"""Эксперимент: насколько точно распознавание угадывает категорию и цвет (#72).

Прогоняет фото через тот же recognize, что и POST /items/recognize, сравнивает
с разметкой человека и пишет таблицы в docs/recognition-experiment.md.

    docker compose exec -T backend python scripts/recognition_experiment.py \\
        --photos media/demo --labels media/demo/labels.csv

labels.csv — разметка человека, колонки file, category, color (или файл,
категория, цвет), значения из справочника. Сами фото в репозиторий не кладём.
Ответы модели сохраняются рядом с разметкой (recognition-results.csv): с
--reuse повторный прогон берёт их, а не гоняет CLIP заново. Тот же набор — те же цифры.
"""

import argparse
import csv
import sys
from collections import Counter
from io import BytesIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from PIL import Image  # noqa: E402

from app.services.attributes import ATTRIBUTES, values  # noqa: E402
from app.services.photos import to_jpeg  # noqa: E402

THRESHOLDS = [0.3, 0.4, 0.5, 0.6, 0.7]
# Неверно предзаполненное поле хуже пустого: человек может его не заметить
WRONG_COST = 2
FIELDS = {"category": "Категория", "color": "Цвет"}
HEADERS = {"file": ("file", "файл"), "category": ("category", "категория"), "color": ("color", "цвет")}
LABELS = {field: {o["value"]: o["label"] for o in ATTRIBUTES[field]} for field in FIELDS}
PHOTO_SUFFIXES = (".HEIC", ".heic", ".jpg", ".jpeg", ".JPG", ".png")
REPORT = Path(__file__).resolve().parents[2] / "docs" / "recognition-experiment.md"


def main() -> int:
    parser = argparse.ArgumentParser(description="Точность распознавания категории и цвета")
    parser.add_argument("--photos", type=Path, required=True)
    parser.add_argument("--labels", type=Path, required=True)
    parser.add_argument("--out", type=Path, default=REPORT)
    parser.add_argument("--reuse", action="store_true", help="взять ответы модели из прошлого прогона")
    args = parser.parse_args()
    # Русский текст в консоли Windows и в докере
    sys.stdout.reconfigure(encoding="utf-8")

    labels = read_labels(args.labels)
    results_file = args.labels.with_name("recognition-results.csv")
    if args.reuse and results_file.is_file():
        guesses = read_results(results_file)
    else:
        guesses = run_model(args.photos, labels)
        write_results(results_file, guesses)
    rows = [{**labels[name], **guesses[name], "file": name} for name in labels if name in guesses]
    args.out.write_text(report(rows), encoding="utf-8")
    print(f"Фото: {len(rows)}. Ответы модели: {results_file}. Отчёт: {args.out}")
    return 0


def read_labels(path: Path) -> dict[str, dict]:
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        columns = {field: next((c for c in reader.fieldnames if c.strip().lower() in names), None)
                   for field, names in HEADERS.items()}
        missing = [field for field, column in columns.items() if column is None]
        if missing:
            sys.exit(f"В разметке нет колонок: {', '.join(missing)}")
        labels = {}
        for line, row in enumerate(reader, start=2):
            name = Path(row[columns["file"]].strip()).stem
            label = {field: row[columns[field]].strip() for field in FIELDS}
            for field, value in label.items():
                if value not in values(field):
                    sys.exit(f"Строка {line}, {name}: {field} «{value}» нет в справочнике")
            labels[name] = label
    return labels


def run_model(folder: Path, labels: dict[str, dict]) -> dict[str, dict]:
    from app.services.recognition import recognize  # грузит torch и модели

    guesses = {}
    for number, name in enumerate(sorted(labels), start=1):
        photo = find_photo(folder, name)
        if photo is None:
            print(f"Нет фото {name}, пропускаю")
            continue
        # Как в POST /photos: HEIC → JPEG 1024 px, потом распознавание
        image = Image.open(BytesIO(to_jpeg(photo.read_bytes())))
        category, color = recognize(image)
        guesses[name] = {
            "category_guess": category.value, "category_confidence": category.confidence,
            "color_guess": color.value, "color_confidence": color.confidence,
        }
        print(f"{number}/{len(labels)} {name}: {category.value} {category.confidence}, "
              f"{color.value} {color.confidence}")
    return guesses


def write_results(path: Path, guesses: dict[str, dict]) -> None:
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["file", "category_guess", "category_confidence", "color_guess", "color_confidence"])
        for name, guess in sorted(guesses.items()):
            writer.writerow([name, guess["category_guess"], guess["category_confidence"],
                             guess["color_guess"], guess["color_confidence"]])


def read_results(path: Path) -> dict[str, dict]:
    with path.open(encoding="utf-8", newline="") as file:
        return {
            row["file"]: {
                "category_guess": row["category_guess"],
                "category_confidence": float(row["category_confidence"]),
                "color_guess": row["color_guess"],
                "color_confidence": float(row["color_confidence"]),
            }
            for row in csv.DictReader(file)
        }


def report(rows: list[dict]) -> str:
    total = len(rows)
    lines = [
        "# Эксперимент: точность распознавания категории и цвета",
        "",
        "Таблицы собирает `backend/scripts/recognition_experiment.py` (#72), руками не править:",
        "поменялась разметка — перезапустить скрипт с `--reuse`.",
        "",
        f"Набор: {total} фото, по одной вещи на кадре, разметка человека — категория и цвет",
        "из справочника. Модель — та же, что в `POST /items/recognize`: категория по CLIP,",
        "цвет по rembg + k-means. Фото проходят то же сжатие, что при загрузке.",
        "",
        "## Итог",
        "",
        "| Поле | Верно | Точность |",
        "|---|---|---|",
    ]
    for field, title in FIELDS.items():
        correct = sum(row[field] == row[f"{field}_guess"] for row in rows)
        lines.append(f"| {title} | {correct} из {total} | {percent(correct, total)} |")
    for field, title in FIELDS.items():
        lines += ["", f"## {title}: по значениям", ""]
        lines += ["| Значение | Фото | Верно | Точность |", "|---|---|---|---|"]
        for value, label in LABELS[field].items():
            subset = [row for row in rows if row[field] == value]
            if subset:
                correct = sum(row[f"{field}_guess"] == value for row in subset)
                lines.append(f"| {label} | {len(subset)} | {correct} | {percent(correct, len(subset))} |")
        wrong_rows = [row for row in rows if row[field] != row[f"{field}_guess"]]
        confusions = Counter((row[field], row[f"{field}_guess"]) for row in wrong_rows)
        if confusions:
            lines += ["", "Частые путаницы:", ""]
            for (truth, guess), count in confusions.most_common(5):
                lines.append(f"- {name_of(field, truth)} → {name_of(field, guess)}: {count}")
    lines += [
        "",
        "## Порог уверенности",
        "",
        "Ниже порога поле не предзаполняется. «Ошибочно» — предзаполнено неверно: человек",
        f"может этого не заметить, поэтому такая ошибка считается в {WRONG_COST} раза хуже пустого поля.",
        f"Оценка порога — верно предзаполненные минус {WRONG_COST} × ошибочно предзаполненные.",
    ]
    best = {}
    for field, title in FIELDS.items():
        lines += ["", f"### {title}", ""]
        lines += ["| Порог | Предзаполнено | Из них верно | Ошибочно | Пусто | Оценка |", "|---|---|---|---|---|---|"]
        scores = {}
        for threshold in THRESHOLDS:
            filled = [row for row in rows if row[f"{field}_confidence"] >= threshold]
            correct = sum(row[field] == row[f"{field}_guess"] for row in filled)
            wrong = len(filled) - correct
            scores[threshold] = correct - WRONG_COST * wrong
            empty = total - len(filled)
            lines.append(f"| {threshold} | {len(filled)} | {correct} | {wrong} | {empty} | {scores[threshold]} |")
        # При равной оценке — порог ниже: больше полей предзаполнено
        best[field] = max(THRESHOLDS, key=lambda threshold: (scores[threshold], -threshold))
    recommended = max(best.values())
    lines += [
        "",
        "## Рекомендация",
        "",
        f"Лучший порог для категории — {best['category']}, для цвета — {best['color']}. Настройка",
        f"`RECOGNITION_THRESHOLD` одна на оба поля, поэтому берём больший: **{recommended}**",
        "(лучше оставить поле пустым, чем предзаполнить неверно). Ставится отдельной задачей (#76).",
        "",
        "## Ограничения",
        "",
        "- Все фото из одного гардероба и сняты в одном месте: на вешалке на фоне двери.",
        "  На фото с другим фоном и светом точность может быть другой.",
        "- Значения, которых нет в наборе, в таблицах не появляются: по ним вывода нет.",
        "",
    ]
    return "\n".join(lines)


def find_photo(folder: Path, name: str) -> Path | None:
    for suffix in PHOTO_SUFFIXES:
        if (folder / f"{name}{suffix}").is_file():
            return folder / f"{name}{suffix}"
    return None


def name_of(field: str, value: str) -> str:
    return LABELS[field].get(value, value)


def percent(part: int, whole: int) -> str:
    return f"{round(100 * part / whole)} %" if whole else "—"


if __name__ == "__main__":
    sys.exit(main())

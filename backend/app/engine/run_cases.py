"""Прогон тестовых входов через build_outfit: печатает комплект и объяснение.

Запуск из папки backend (база и Docker не нужны):
    python -m app.engine.run_cases
В докере:
    docker compose exec backend python -m app.engine.run_cases
Код возврата 1, если хоть одна проверка не прошла.
"""

import sys
from dataclasses import replace

from app.engine import NoNewVariant, build_outfit
from app.engine.cases import CASES, CASES_BY_NAME, TIME_LIMIT_SECONDS, TIMING_RUNS, Case, case_problems
from app.engine.checks import chosen_items, general_problems, worst_duration

# Столько вариантов в день отдаёт бэк по умолчанию (API.md, variants_max)
VARIANTS = 3


def run_case(case: Case) -> list[str]:
    req = case.request
    weather = req.weather
    print(f"=== {case.name}: {case.title} ===")
    print(
        f"Погода: ощущается как {weather.feels_like:g}°, {weather.condition}, "
        f"осадки {weather.precipitation:g} мм. Вещей в гардеробе: {len(req.wardrobe)}"
    )
    try:
        result = build_outfit(req)
    except NoNewVariant:
        print("Движок бросил NoNewVariant на первый запрос дня — это ошибка")
        return ["NoNewVariant при пустом shown_today"]

    items = chosen_items(req, result)
    print("Комплект:", ", ".join(f"{i.name} [{i.category}]" for i in items) or "пусто")
    print("Не хватает:", ", ".join(result.missing) or "—")
    print("Объяснение:", result.explanation)

    problems = case_problems(case, result)
    print("Проверки:", "OK" if not problems else "ЕСТЬ ЗАМЕЧАНИЯ")
    for problem in problems:
        print("  -", problem)
    print()
    return problems


def show_variants(case: Case) -> list[str]:
    """«Другой вариант» дважды: каждый новый комплект не совпадает с прошлыми."""
    print(f"=== Варианты дня: {case.title} ===")
    req, shown, problems = case.request, [], []
    for number in range(1, VARIANTS + 1):
        try:
            result = build_outfit(replace(req, shown_today=shown))
        except NoNewVariant:
            print(f"Вариант {number}: другого нет (NoNewVariant)")
            break
        ids = frozenset(result.item_ids)
        if ids in shown:
            problems.append(f"вариант {number} повторяет уже показанный")
        problems += general_problems(req, result)
        shown = shown + [ids]
        print(f"Вариант {number}:", ", ".join(i.name for i in chosen_items(req, result)) or "пусто")
    print("Проверки:", "OK" if not problems else "ЕСТЬ ЗАМЕЧАНИЯ")
    for problem in problems:
        print("  -", problem)
    print()
    return problems


def measure_large_case() -> list[str]:
    case = CASES_BY_NAME["large"]
    worst = worst_duration(case.request, TIMING_RUNS)
    print(f"=== Время на гардеробе из {len(case.request.wardrobe)} вещей ({TIMING_RUNS} запусков) ===")
    print(f"Самый долгий вызов {worst * 1000:.1f} мс, лимит {TIME_LIMIT_SECONDS * 1000:.0f} мс")
    if worst > TIME_LIMIT_SECONDS:
        return [f"большой гардероб: {worst:.3f} с, лимит {TIME_LIMIT_SECONDS} с"]
    print("Проверки: OK")
    return []


def main() -> int:
    # Русский текст в консоли Windows и в докере
    sys.stdout.reconfigure(encoding="utf-8")
    failed = 0
    for case in CASES:
        if run_case(case):
            failed += 1
    for name in ("rain", "large"):
        if show_variants(CASES_BY_NAME[name]):
            failed += 1
    if measure_large_case():
        failed += 1
    print()
    print("Всё в порядке" if not failed else f"Не прошло проверок: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

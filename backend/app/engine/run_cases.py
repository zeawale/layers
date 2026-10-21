"""Прогон тестовых входов через build_outfit: печатает комплект и объяснение.

Запуск из папки backend (база и Docker не нужны):
    python -m app.engine.run_cases
В докере:
    docker compose exec backend python -m app.engine.run_cases
Код возврата 1, если хоть одна проверка не прошла.
"""

import sys
import time

from app.engine import NoNewVariant, build_outfit
from app.engine.cases import CASES, CASES_BY_NAME, TIME_LIMIT_SECONDS
from app.engine.checks import chosen_items, general_problems

TIMING_RUNS = 20


def run_case(case) -> list[str]:
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

    problems = general_problems(req, result)
    if case.expect:
        problems += case.expect(req, result)
    print("Проверки:", "OK" if not problems else "ЕСТЬ ЗАМЕЧАНИЯ")
    for problem in problems:
        print("  -", problem)
    print()
    return problems


def measure_large_case() -> list[str]:
    case = CASES_BY_NAME["large"]
    durations = []
    for _ in range(TIMING_RUNS):
        started = time.perf_counter()
        build_outfit(case.request)
        durations.append(time.perf_counter() - started)
    average, worst = sum(durations) / len(durations), max(durations)
    print(f"=== Время на гардеробе из {len(case.request.wardrobe)} вещей ({TIMING_RUNS} запусков) ===")
    print(f"В среднем {average * 1000:.1f} мс, самый долгий {worst * 1000:.1f} мс, лимит {TIME_LIMIT_SECONDS * 1000:.0f} мс")
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
    if measure_large_case():
        failed += 1
    print()
    print("Всё в порядке" if not failed else f"Не прошло проверок: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

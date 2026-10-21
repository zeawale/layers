"""Те же тестовые входы, что и в run_cases.py, но как тесты pytest.

Запуск из папки backend:
    python -m pytest app/engine -v
"""

import time

import pytest

from app.engine import build_outfit
from app.engine.cases import CASES, CASES_BY_NAME, TIME_LIMIT_SECONDS
from app.engine.checks import general_problems


@pytest.mark.parametrize("case", CASES, ids=lambda case: case.name)
def test_outfit_for_case(case):
    result = build_outfit(case.request)
    problems = general_problems(case.request, result)
    if case.expect:
        problems += case.expect(case.request, result)
    assert not problems, "\n".join(problems)


def test_large_wardrobe_is_fast():
    request = CASES_BY_NAME["large"].request
    worst = 0.0
    for _ in range(20):
        started = time.perf_counter()
        build_outfit(request)
        worst = max(worst, time.perf_counter() - started)
    assert worst < TIME_LIMIT_SECONDS, f"{worst:.3f} с при лимите {TIME_LIMIT_SECONDS} с"

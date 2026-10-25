"""Те же тестовые входы, что и в run_cases.py, но как тесты pytest.

Запуск из папки backend:
    python -m pytest app/engine -v
"""

import pytest

from app.engine import build_outfit
from app.engine.cases import CASES, CASES_BY_NAME, TIME_LIMIT_SECONDS, TIMING_RUNS, case_problems
from app.engine.checks import worst_duration


@pytest.mark.parametrize("case", CASES, ids=lambda case: case.name)
def test_outfit_for_case(case):
    problems = case_problems(case, build_outfit(case.request))
    assert not problems, "\n".join(problems)


def test_large_wardrobe_is_fast():
    worst = worst_duration(CASES_BY_NAME["large"].request, TIMING_RUNS)
    assert worst < TIME_LIMIT_SECONDS, f"{worst:.3f} с при лимите {TIME_LIMIT_SECONDS} с"

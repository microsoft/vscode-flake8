# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""
Unit tests for diagnostic regex parsing in lsp_server.
"""

import pytest
from lsp_server import DIAGNOSTIC_RE


def _get_group_dict(line: str):
    """Helper function to get match groups from a line."""
    match = DIAGNOSTIC_RE.match(line)
    if match:
        return match.groupdict()
    return None


# ---------------------------------------------------------------------------
# Positive-match tests (parametrized)
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "line, expected",
    [
        pytest.param(
            "14,5,E,E302:expected 2 blank lines, got 1",
            {
                "line": "14",
                "column": "5",
                "type": "E",
                "code": "E302",
                "message": "expected 2 blank lines, got 1",
            },
            id="E302",
        ),
        pytest.param(
            "42,12,W,W503:line break before binary operator",
            {
                "line": "42",
                "column": "12",
                "type": "W",
                "code": "W503",
                "message": "line break before binary operator",
            },
            id="W503",
        ),
        pytest.param(
            "1,1,F,F401:'os' imported but unused",
            {
                "line": "1",
                "column": "1",
                "type": "F",
                "code": "F401",
                "message": "'os' imported but unused",
            },
            id="F401",
        ),
        pytest.param(
            "10,1,C,C901:'my_function' is too complex (15)",
            {
                "line": "10",
                "column": "1",
                "type": "C",
                "code": "C901",
                "message": "'my_function' is too complex (15)",
            },
            id="C901",
        ),
        pytest.param(
            "7,80,E,E501:line too long (120 > 79 characters)",
            {
                "line": "7",
                "column": "80",
                "type": "E",
                "code": "E501",
                "message": "line too long (120 > 79 characters)",
            },
            id="E501",
        ),
        pytest.param(
            # Known edge case: the regex captures "-1" as a string.  Downstream
            # code that calls ``int(column)`` will get -1, which is an invalid
            # LSP position; downstream should clamp to 0.
            "5,-1,E,E303:too many blank lines (3)",
            {
                "line": "5",
                "column": "-1",
                "type": "E",
                "code": "E303",
                "message": "too many blank lines (3)",
            },
            id="negative-column",
        ),
        pytest.param(
            "3,5,E,E111:indentation is not a multiple of four",
            {
                "line": "3",
                "column": "5",
                "type": "E",
                "code": "E111",
                "message": "indentation is not a multiple of four",
            },
            id="E111",
        ),
        pytest.param(
            "15,20,W,W291:trailing whitespace",
            {
                "line": "15",
                "column": "20",
                "type": "W",
                "code": "W291",
                "message": "trailing whitespace",
            },
            id="W291",
        ),
        pytest.param(
            "99999,1,E,E302:expected 2 blank lines, got 1",
            {
                "line": "99999",
                "column": "1",
                "type": "E",
                "code": "E302",
                "message": "expected 2 blank lines, got 1",
            },
            id="large-line-number",
        ),
        pytest.param(
            "1,1,E,E999:SyntaxError: invalid syntax",
            {
                "line": "1",
                "column": "1",
                "type": "E",
                "code": "E999",
                "message": "SyntaxError: invalid syntax",
            },
            id="colon-in-message",
        ),
        pytest.param(
            "0,0,E,E302:msg",
            {"line": "0", "column": "0", "type": "E", "code": "E302", "message": "msg"},
            id="zero-line-column",
        ),
        pytest.param(
            "1,1,E,E302:",
            {"line": "1", "column": "1", "type": "E", "code": "E302", "message": ""},
            id="empty-message",
        ),
        pytest.param(
            "1,1,e,E302:msg",
            {"line": "1", "column": "1", "type": "e", "code": "E302", "message": "msg"},
            id="lowercase-type",
        ),
    ],
)
def test_diagnostic_regex_positive(line, expected):
    """Verify that valid flake8 output lines are parsed correctly."""
    data = _get_group_dict(line)
    assert data is not None, f"Regex should match: {line}"
    assert data == expected


# ---------------------------------------------------------------------------
# Negative-match tests
# ---------------------------------------------------------------------------


def test_diagnostic_regex_no_match_on_empty_string():
    """Test that an empty string does not match the regex."""
    assert _get_group_dict("") is None


def test_diagnostic_regex_no_match_on_garbage():
    """Test that random text does not match the regex."""
    assert _get_group_dict("this is not a diagnostic line") is None


def test_diagnostic_regex_no_match_without_code():
    """Test that a line without a valid code does not match."""
    assert _get_group_dict("14,5,E,:missing code") is None


def test_diagnostic_regex_no_match_leading_whitespace():
    """Leading whitespace prevents match because .match() is start-anchored."""
    assert _get_group_dict(" 14,5,E,E302:msg") is None

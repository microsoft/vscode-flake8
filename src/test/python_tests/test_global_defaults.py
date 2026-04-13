# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""Unit tests for _get_global_defaults() in lsp_server.

Covers the fix from PR #327 where ignorePatterns was always returning []
instead of reading from GLOBAL_SETTINGS.

Mock setup is provided by conftest.py (setup_lsp_mocks).
"""

import lsp_server
import pytest


def _with_global_settings(overrides, fn):
    """Run fn with GLOBAL_SETTINGS temporarily set to overrides."""
    original = lsp_server.GLOBAL_SETTINGS.copy()
    try:
        lsp_server.GLOBAL_SETTINGS.clear()
        lsp_server.GLOBAL_SETTINGS.update(overrides)
        return fn()
    finally:
        lsp_server.GLOBAL_SETTINGS.clear()
        lsp_server.GLOBAL_SETTINGS.update(original)


@pytest.mark.parametrize(
    "overrides, key, expected",
    [
        pytest.param(
            {"ignorePatterns": ["**/vendor/**", "**/.tox/**"]},
            "ignorePatterns",
            ["**/vendor/**", "**/.tox/**"],
            id="ignorePatterns-set",
        ),
        pytest.param({}, "ignorePatterns", [], id="ignorePatterns-default"),
        pytest.param(
            {"showNotifications": "always"},
            "showNotifications",
            "always",
            id="showNotifications-set",
        ),
        pytest.param(
            {"importStrategy": "fromEnvironment"},
            "importStrategy",
            "fromEnvironment",
            id="importStrategy-set",
        ),
    ],
)
def test_global_defaults_setting(overrides, key, expected):
    """Each global setting is correctly read or defaults when absent."""
    result = _with_global_settings(overrides, lsp_server._get_global_defaults)
    assert result[key] == expected

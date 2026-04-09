# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""Unit tests for _get_global_defaults() in lsp_server.

Covers the fix from PR #327 where ignorePatterns was always returning []
instead of reading from GLOBAL_SETTINGS.

Mock setup is provided by conftest.py (setup_lsp_mocks).
"""

import lsp_server


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


def test_ignore_patterns_read_from_global_settings():
    """_get_global_defaults() returns ignorePatterns from GLOBAL_SETTINGS."""
    result = _with_global_settings(
        {"ignorePatterns": ["**/vendor/**", "**/.tox/**"]},
        lsp_server._get_global_defaults,
    )
    assert result["ignorePatterns"] == ["**/vendor/**", "**/.tox/**"]


def test_ignore_patterns_defaults_to_empty_list():
    """_get_global_defaults() returns [] when GLOBAL_SETTINGS has no ignorePatterns."""
    result = _with_global_settings({}, lsp_server._get_global_defaults)
    assert result["ignorePatterns"] == []


def test_show_notifications_read_from_global_settings():
    """_get_global_defaults() returns showNotifications from GLOBAL_SETTINGS."""
    result = _with_global_settings(
        {"showNotifications": "always"},
        lsp_server._get_global_defaults,
    )
    assert result["showNotifications"] == "always"


def test_import_strategy_read_from_global_settings():
    """_get_global_defaults() returns importStrategy from GLOBAL_SETTINGS."""
    result = _with_global_settings(
        {"importStrategy": "fromEnvironment"},
        lsp_server._get_global_defaults,
    )
    assert result["importStrategy"] == "fromEnvironment"

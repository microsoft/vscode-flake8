# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""Unit tests for _get_global_defaults() in lsp_server.

Covers the fix from PR #327 where ignorePatterns was always returning []
instead of reading from GLOBAL_SETTINGS.
"""

import pathlib
import sys
import types


# ---------------------------------------------------------------------------
# Stub out bundled LSP dependencies so lsp_server can be imported without the
# full VS Code extension environment.
# ---------------------------------------------------------------------------
def _setup_mocks():
    class _MockLS:
        def __init__(self, *args, **kwargs):
            pass

        def feature(self, *args, **kwargs):
            return lambda f: f

        def command(self, *args, **kwargs):
            return lambda f: f

        def window_log_message(self, *args, **kwargs):
            pass

        def window_show_message(self, *args, **kwargs):
            pass

    mock_lsp_server_mod = types.ModuleType("pygls.lsp.server")
    mock_lsp_server_mod.LanguageServer = _MockLS

    _Doc = type("Document", (), {"path": None})
    mock_workspace = types.ModuleType("pygls.workspace")
    mock_workspace.Document = _Doc
    mock_workspace.TextDocument = _Doc

    mock_uris = types.ModuleType("pygls.uris")
    mock_uris.from_fs_path = lambda p: "file://" + p

    mock_lsp = types.ModuleType("lsprotocol.types")
    for _name in [
        "TEXT_DOCUMENT_DID_OPEN",
        "TEXT_DOCUMENT_DID_SAVE",
        "TEXT_DOCUMENT_DID_CLOSE",
        "TEXT_DOCUMENT_CODE_ACTION",
        "INITIALIZE",
        "EXIT",
        "SHUTDOWN",
        "NOTEBOOK_DOCUMENT_DID_OPEN",
        "NOTEBOOK_DOCUMENT_DID_CHANGE",
        "NOTEBOOK_DOCUMENT_DID_SAVE",
        "NOTEBOOK_DOCUMENT_DID_CLOSE",
    ]:
        setattr(mock_lsp, _name, _name)

    mock_lsp.CodeActionKind = types.SimpleNamespace(QuickFix="quickfix")

    class _FlexClass:
        def __init__(self, *args, **kwargs):
            pass

    for _name in [
        "Diagnostic",
        "DiagnosticSeverity",
        "DidCloseTextDocumentParams",
        "DidOpenTextDocumentParams",
        "DidSaveTextDocumentParams",
        "DidChangeNotebookDocumentParams",
        "DidCloseNotebookDocumentParams",
        "DidOpenNotebookDocumentParams",
        "DidSaveNotebookDocumentParams",
        "InitializeParams",
        "NotebookCellKind",
        "NotebookCellLanguage",
        "NotebookDocumentFilterWithNotebook",
        "NotebookDocumentSyncOptions",
        "Position",
        "Range",
        "TextEdit",
        "CodeAction",
        "CodeActionOptions",
        "Command",
        "WorkspaceEdit",
        "TextDocumentEdit",
        "OptionalVersionedTextDocumentIdentifier",
        "LogMessageParams",
        "ShowMessageParams",
        "PublishDiagnosticsParams",
    ]:
        setattr(mock_lsp, _name, _FlexClass)
    mock_lsp.MessageType = types.SimpleNamespace(Log=4, Error=1, Warning=2, Info=3)

    mock_lsp_utils = types.ModuleType("lsp_utils")
    mock_lsp_utils.normalize_path = lambda p, **kw: str(p)
    mock_lsp_utils.is_stdlib_file = lambda p: False
    mock_lsp_utils.is_match = lambda patterns, path: False
    mock_lsp_utils.is_current_interpreter = lambda i: True
    mock_lsp_utils.RunResult = type("RunResult", (), {})
    mock_lsp_utils.substitute_attr = None

    class _QuickFixError(Exception):
        pass

    mock_lsp_utils.QuickFixRegistrationError = _QuickFixError

    mock_jsonrpc = types.ModuleType("lsp_jsonrpc")
    mock_jsonrpc.shutdown_json_rpc = lambda: None

    for _mod_name, _mod in [
        ("pygls", types.ModuleType("pygls")),
        ("pygls.lsp", types.ModuleType("pygls.lsp")),
        ("pygls.lsp.server", mock_lsp_server_mod),
        ("pygls.workspace", mock_workspace),
        ("pygls.uris", mock_uris),
        ("lsprotocol", types.ModuleType("lsprotocol")),
        ("lsprotocol.types", mock_lsp),
        ("lsp_jsonrpc", mock_jsonrpc),
        ("lsp_utils", mock_lsp_utils),
    ]:
        if _mod_name not in sys.modules:
            sys.modules[_mod_name] = _mod

    tool_dir = str(pathlib.Path(__file__).parents[3] / "bundled" / "tool")
    if tool_dir not in sys.path:
        sys.path.insert(0, tool_dir)


_setup_mocks()

import lsp_server  # noqa: E402


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

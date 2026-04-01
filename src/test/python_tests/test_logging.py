# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""Unit tests for the logging/notification helpers in lsp_server.

Covers the Pygls 2 migration (PR #367) which changed logging calls from
show_message_log/show_message to window_log_message/window_show_message
with parameter objects, and verifies the LS_SHOW_NOTIFICATION gating logic.
"""

import os
import pathlib
import sys
import types
from unittest.mock import MagicMock, patch


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
            self._kwargs = kwargs

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


def _patch_lsp_server():
    """Replace LSP_SERVER logging methods with mocks and return them."""
    log_mock = MagicMock()
    show_mock = MagicMock()
    lsp_server.LSP_SERVER.window_log_message = log_mock
    lsp_server.LSP_SERVER.window_show_message = show_mock
    return log_mock, show_mock


# ---------------------------------------------------------------------------
# log_to_output
# ---------------------------------------------------------------------------
def test_log_to_output_calls_window_log_message():
    """log_to_output uses the Pygls 2 window_log_message API."""
    log_mock, show_mock = _patch_lsp_server()

    lsp_server.log_to_output("hello")

    log_mock.assert_called_once()
    show_mock.assert_not_called()


# ---------------------------------------------------------------------------
# log_error
# ---------------------------------------------------------------------------
def test_log_error_always_logs():
    """log_error always calls window_log_message regardless of notification setting."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "off"}):
        lsp_server.log_error("error occurred")

    log_mock.assert_called_once()
    show_mock.assert_not_called()


def test_log_error_shows_notification_on_error():
    """log_error shows a notification popup when LS_SHOW_NOTIFICATION=onError."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "onError"}):
        lsp_server.log_error("error occurred")

    log_mock.assert_called_once()
    show_mock.assert_called_once()


def test_log_error_shows_notification_on_always():
    """log_error shows a notification popup when LS_SHOW_NOTIFICATION=always."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "always"}):
        lsp_server.log_error("error occurred")

    log_mock.assert_called_once()
    show_mock.assert_called_once()


# ---------------------------------------------------------------------------
# log_warning
# ---------------------------------------------------------------------------
def test_log_warning_no_notification_when_off():
    """log_warning does not show notification when LS_SHOW_NOTIFICATION=off."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "off"}):
        lsp_server.log_warning("warning message")

    log_mock.assert_called_once()
    show_mock.assert_not_called()


def test_log_warning_no_notification_on_error_only():
    """log_warning does not show notification when LS_SHOW_NOTIFICATION=onError."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "onError"}):
        lsp_server.log_warning("warning message")

    log_mock.assert_called_once()
    show_mock.assert_not_called()


def test_log_warning_shows_notification_on_warning():
    """log_warning shows notification when LS_SHOW_NOTIFICATION=onWarning."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "onWarning"}):
        lsp_server.log_warning("warning message")

    log_mock.assert_called_once()
    show_mock.assert_called_once()


def test_log_warning_shows_notification_on_always():
    """log_warning shows notification when LS_SHOW_NOTIFICATION=always."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "always"}):
        lsp_server.log_warning("warning message")

    log_mock.assert_called_once()
    show_mock.assert_called_once()


# ---------------------------------------------------------------------------
# log_always
# ---------------------------------------------------------------------------
def test_log_always_no_notification_when_off():
    """log_always does not show notification when LS_SHOW_NOTIFICATION=off."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "off"}):
        lsp_server.log_always("info message")

    log_mock.assert_called_once()
    show_mock.assert_not_called()


def test_log_always_no_notification_on_error():
    """log_always does not show notification when LS_SHOW_NOTIFICATION=onError."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "onError"}):
        lsp_server.log_always("info message")

    log_mock.assert_called_once()
    show_mock.assert_not_called()


def test_log_always_no_notification_on_warning():
    """log_always does not show notification when LS_SHOW_NOTIFICATION=onWarning."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "onWarning"}):
        lsp_server.log_always("info message")

    log_mock.assert_called_once()
    show_mock.assert_not_called()


def test_log_always_shows_notification_on_always():
    """log_always shows notification only when LS_SHOW_NOTIFICATION=always."""
    log_mock, show_mock = _patch_lsp_server()

    with patch.dict(os.environ, {"LS_SHOW_NOTIFICATION": "always"}):
        lsp_server.log_always("info message")

    log_mock.assert_called_once()
    show_mock.assert_called_once()

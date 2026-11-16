# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""Source-based Python installation paths used by native build sessions."""

import importlib.util
import os
import pathlib
import sys
import types

import pytest


@pytest.fixture
def build_module(monkeypatch):
    """Load build helpers without requiring nox inside the test environment."""
    monkeypatch.setitem(
        sys.modules,
        "nox",
        types.SimpleNamespace(
            Session=object,
            session=lambda **_kwargs: lambda function: function,
        ),
    )
    spec = importlib.util.spec_from_file_location(
        "_bundle_setup", pathlib.Path(__file__).parents[1] / "noxfile.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.mark.parametrize("session_name", ["install_bundled_libs", "setup"])
def test_native_sessions_install_shared_python_from_the_pinned_checkout(
    build_module, monkeypatch, session_name
):
    """Both bundle and development setup must include the same local source."""
    installs = []
    session = types.SimpleNamespace(install=lambda *args: installs.append(args))
    monkeypatch.setattr(build_module, "_update_pip_packages", lambda _session: None)
    getattr(build_module, session_name)(session)
    assert "-r" in installs[-2]
    assert installs[-2][-1] == "./requirements.txt"
    shared = pathlib.Path(build_module.__file__).parent / (
        "external/vscode-common-python-lsp/python"
    )
    assert installs[-1] == (
        "-t",
        "./bundled/libs",
        "--no-cache-dir",
        "--no-deps",
        "--upgrade",
        os.fspath(shared),
    )


def test_missing_shared_source_fails_before_installing(build_module, monkeypatch):
    """A missing submodule must not silently produce an incomplete bundle."""
    installs = []

    def error(message):
        raise RuntimeError(message)

    session = types.SimpleNamespace(
        install=lambda *args: installs.append(args), error=error
    )
    monkeypatch.setattr(pathlib.Path, "is_file", lambda _path: False)
    with pytest.raises(RuntimeError, match="git submodule update"):
        build_module._install_bundle(session)
    assert not installs

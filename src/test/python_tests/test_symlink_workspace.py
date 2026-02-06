# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""
Test for workspace settings with symlinked paths.
This tests the fix for issue #340 where workspace-level flake8.args
were ignored when document paths contained symlinks (e.g., with pyenv).
"""

import pathlib
import sys
import tempfile

import pytest

# Add bundled tool to path for direct testing
BUNDLED_TOOL_PATH = pathlib.Path(__file__).parent.parent.parent.parent / "bundled" / "tool"
sys.path.insert(0, str(BUNDLED_TOOL_PATH))


def test_document_key_resolution_with_symlinks():
    """Test that _get_document_key correctly resolves symlinked paths.
    
    This is a unit test for the fix to issue #340 where workspace-level
    flake8.args were ignored when document paths contained symlinks.
    """
    # Import after adding to path
    try:
        import lsp_utils as utils
        import lsp_server
        from unittest.mock import Mock
    except ImportError as e:
        pytest.skip(f"Cannot import required modules: {e}")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create the real workspace directory
        real_workspace = pathlib.Path(tmpdir) / "real_workspace"
        real_workspace.mkdir()
        
        # Create a Python file
        test_file = real_workspace / "test.py"
        test_file.write_text("print('test')")
        
        # Create a symlink to the workspace
        symlink_workspace = pathlib.Path(tmpdir) / "symlinked_workspace"
        try:
            symlink_workspace.symlink_to(real_workspace)
        except OSError as e:
            pytest.skip(f"Symlinks not supported in this environment: {e}")
        
        # File path accessed through the symlink
        symlinked_file = symlink_workspace / "test.py"
        
        # Set up workspace settings with the real workspace path
        real_workspace_key = utils.normalize_path(real_workspace.resolve())
        lsp_server.WORKSPACE_SETTINGS.clear()
        lsp_server.WORKSPACE_SETTINGS[real_workspace_key] = {
            "workspaceFS": real_workspace_key,
            "args": ["--max-line-length=120"],
        }
        
        # Create a mock document with the symlinked path
        mock_document = Mock()
        mock_document.path = str(symlinked_file)
        
        # Test that _get_document_key finds the workspace despite the symlink
        document_key = lsp_server._get_document_key(mock_document)
        
        # The document key should match the real workspace key
        assert document_key == real_workspace_key, (
            f"Expected document key '{real_workspace_key}' but got '{document_key}'. "
            "Symlinked paths should resolve to match workspace settings."
        )
        
        # Verify we can retrieve the correct settings
        settings = lsp_server._get_settings_by_document(mock_document)
        assert settings is not None, "Should retrieve workspace settings"
        assert settings.get("args") == ["--max-line-length=120"], (
            "Should get workspace-specific args, not fall back to global settings"
        )


def test_workspace_settings_update_resolves_symlinks():
    """Test that _update_workspace_settings resolves symlinks when storing keys."""
    try:
        import lsp_utils as utils
        import lsp_server
        from pygls import uris
    except ImportError as e:
        pytest.skip(f"Cannot import required modules: {e}")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create workspace through a symlink
        real_workspace = pathlib.Path(tmpdir) / "real_workspace"
        real_workspace.mkdir()
        
        symlink_workspace = pathlib.Path(tmpdir) / "symlinked_workspace"
        try:
            symlink_workspace.symlink_to(real_workspace)
        except OSError as e:
            pytest.skip(f"Symlinks not supported in this environment: {e}")
        
        # Create settings using the symlinked path
        symlink_uri = uris.from_fs_path(str(symlink_workspace))
        settings = [
            {
                "workspace": symlink_uri,
                "args": ["--ignore=E501"],
            }
        ]
        
        # Update workspace settings
        lsp_server.WORKSPACE_SETTINGS.clear()
        lsp_server._update_workspace_settings(settings)
        
        # The key should be the resolved path (real workspace)
        expected_key = utils.normalize_path(real_workspace.resolve())
        
        assert expected_key in lsp_server.WORKSPACE_SETTINGS, (
            f"Expected key '{expected_key}' not found in WORKSPACE_SETTINGS. "
            f"Available keys: {list(lsp_server.WORKSPACE_SETTINGS.keys())}"
        )
        
        stored_settings = lsp_server.WORKSPACE_SETTINGS[expected_key]
        assert stored_settings.get("args") == ["--ignore=E501"], (
            "Workspace settings should be stored correctly"
        )

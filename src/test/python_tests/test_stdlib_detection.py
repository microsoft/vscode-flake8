# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
"""
Test for stdlib file detection.
"""

import os
import site
import sys
import sysconfig
import tempfile
from pathlib import Path

# Add bundled tool to path
bundled_path = Path(__file__).parent.parent.parent.parent / "bundled" / "tool"
sys.path.insert(0, str(bundled_path))

from lsp_utils import is_stdlib_file


def test_stdlib_file_detection():
    """Test that stdlib files are correctly identified."""
    # Test with an actual stdlib file (os module)
    os_file = os.__file__
    assert is_stdlib_file(os_file), f"os module file {os_file} should be detected as stdlib"
    
    # Test with sys module (built-in)
    if hasattr(sys, '__file__'):
        sys_file = sys.__file__
        assert is_stdlib_file(sys_file), f"sys module file {sys_file} should be detected as stdlib"


def test_site_packages_not_stdlib():
    """Test that site-packages files are NOT identified as stdlib."""
    # Get site-packages directories
    site_packages = site.getsitepackages()
    
    for site_pkg_dir in site_packages:
        # Create a hypothetical file path in site-packages
        test_file = os.path.join(site_pkg_dir, "pytest", "__init__.py")
        
        # This should NOT be detected as stdlib
        result = is_stdlib_file(test_file)
        assert not result, f"File in site-packages {test_file} should NOT be detected as stdlib, but got {result}"


def test_user_site_packages_not_stdlib():
    """Test that user site-packages files are NOT identified as stdlib."""
    user_site = site.getusersitepackages()
    
    # Create a hypothetical file path in user site-packages
    test_file = os.path.join(user_site, "some_package", "__init__.py")
    
    # This should NOT be detected as stdlib
    result = is_stdlib_file(test_file)
    assert not result, f"File in user site-packages {test_file} should NOT be detected as stdlib"


def test_random_file_not_stdlib():
    """Test that random user files are NOT identified as stdlib."""
    # Create a temporary file that's definitely not in stdlib
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as tmp:
        tmp_path = tmp.name
    
    try:
        result = is_stdlib_file(tmp_path)
        assert not result, f"Temporary file {tmp_path} should NOT be detected as stdlib"
    finally:
        os.unlink(tmp_path)


def test_false_positive_site_packages_in_name():
    """Test that files with 'site-packages' in directory name are correctly handled."""
    # Test 1: A directory with 'site-packages' as part of the name (not a path segment)
    # This should NOT be detected as stdlib because it's not in an actual stdlib path
    test_file_1 = os.path.join(os.sep, "home", "user", "my-site-packages-project", "src", "main.py")
    result_1 = is_stdlib_file(test_file_1)
    assert not result_1, f"User project file {test_file_1} should NOT be detected as stdlib"
    
    # Test 2: A directory literally named 'site-packages-backup' with the substring but not segment
    # The path segment logic should NOT match this because it's 'site-packages-backup', not 'site-packages'
    test_file_2 = os.path.join(os.sep, "backup", "site-packages-backup", "mymodule.py")
    result_2 = is_stdlib_file(test_file_2)
    assert not result_2, f"File in site-packages-backup {test_file_2} should NOT be detected as stdlib"


if __name__ == "__main__":
    test_stdlib_file_detection()
    test_site_packages_not_stdlib()
    test_user_site_packages_not_stdlib()
    test_random_file_not_stdlib()
    test_false_positive_site_packages_in_name()
    print("All tests passed!")

import ctypes
import os
import sys

def check_dll(name):
    try:
        ctypes.WinDLL(name)
        print(f"Success: {name} is available")
    except Exception as e:
        print(f"Error: {name} is NOT available - {e}")

print(f"Python version: {sys.version}")
check_dll("vcruntime140.dll")
check_dll("vcruntime140_1.dll")
check_dll("msvcp140.dll")

pyd_path = r"C:\Users\rahan\OneDrive\Documents\React\aatedence ai\.venv\Lib\site-packages\_dlib_pybind11.cp312-win_amd64.pyd"
if os.path.exists(pyd_path):
    print(f"Found pyd at {pyd_path}")
    try:
        ctypes.WinDLL(pyd_path)
        print("Success: Loaded _dlib_pybind11.pyd with ctypes")
    except Exception as e:
        print(f"Error: Failed to load _dlib_pybind11.pyd with ctypes - {e}")
else:
    print("Could not find _dlib_pybind11.pyd")

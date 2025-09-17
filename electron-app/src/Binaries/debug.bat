@echo off
cd /d "%~dp0"
set PYTHONPATH=%~dp0packages
echo PYTHONPATH: %PYTHONPATH%
echo.
echo Contents of packages folder:
dir packages /b | findstr langchain
echo.
echo Python sys.path:
"%~dp0embedded\python.exe" -c "import sys; [print(f'{i}: {p}') for i, p in enumerate(sys.path)]"
echo.
echo Testing import:
"%~dp0embedded\python.exe" -c "import sys; sys.path.insert(0, r'%~dp0packages'); import langchain_ollama; print('SUCCESS!')"
pause
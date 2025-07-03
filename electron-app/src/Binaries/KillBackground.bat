@echo off
echo Killing all ollama.exe processes (excluding ollama app.exe)...

REM Kill only pure ollama.exe processes
for /f "tokens=1,2" %%a in ('tasklist ^| findstr /I "ollama.exe"') do (
    if /I "%%a"=="ollama.exe" (
        echo Killing ollama.exe PID %%b
        taskkill /PID %%b /F
    )
)

echo Done. ollama app.exe left running.
exit /b 0

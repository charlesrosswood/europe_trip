@echo OFF
setlocal

call .\bundle_js.bat
endlocal

python ..\app.py
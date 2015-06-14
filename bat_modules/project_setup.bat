@echo OFF

call pip install -r .\requirements.txt

echo Checking processor architecture...

:CheckOS
IF "%PROCESSOR_ARCHITECTURE%"=="x86" (goto 64BIT) else (goto 32BIT)

:64BIT
echo 64 bit found
call pip install psycopg2-2.6-cp34-none-win_amd64.whl
goto END

:32BIT
echo 32 bit found
call pip install psycopg2-2.6-cp34-none-win32.whl
goto END

:END
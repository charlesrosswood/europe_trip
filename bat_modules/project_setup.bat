@echo OFF
setlocal enableDelayedExpansion

:CheckPython
call python --version >nul 2>&1 && (
  echo Python installed, checking version...
  for /f "delims=+" %%i in ('python --version') do (
    set python=%%i
    set python_version=!python:Python =!
    set python3=!python_version:3.4.3=!
    if not !python3!==!python_version! (
      echo !python! found, continuing
      goto CheckNpm
    ) else (
      goto NoPython
    )
  )
) || (
    goto NoPython
)

:NoPython
echo Python not installed (or incorrect version), please install from: https://www.python.org/download/releases/3.4.0/
goto CheckNpm

:CheckNpm
call npm -v >nul 2>&1 && (
  for /f "delims=+" %%i in ('npm -v') do (
    echo npm found, installing browserify...
    call npm install -g browserify
    goto CheckPsql
  )
) || (
    echo npm not found, probably because NodeJS is not installed. Please install from: https://nodejs.org/download/
    goto CheckPsql
)

:CheckPsql
call psql --version >nul 2>&1 && (
  echo PostgreSQL found
  goto InstallRequirements
) || (
  echo PostgreSQL not found, either:
  echo   1 add the folder containing the PostgreSQL binaries to the PATH environment variable, or
  echo   2 download PostgreSQL, pgAdmin III contains all necessary binaries, from
  echo     http://www.pgadmin.org/download/windows.php
  goto END
)

:InstallRequirements
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
echo Done
endlocal
@echo OFF
setlocal enableDelayedExpansion

for /f "tokens=*" %%G in ('dir /b /s /a:d "..\static\js\*"') do (
  set filepath=%%G
  set containing_folder=%%~nG

  for /f %%F in ('dir /b /a-d !filepath!') do (
    set filename=%%F
    set bundle=!filename:bundle=!
    if not "!bundle!" == "!filename!" (
      echo * Deleting old bundle !filename!
      del !filepath!\!filename!
    )
  )

  for /f %%F in ('dir /b /a-d !filepath!') do (
    set filename=%%F
    if "!filename!" == "main.js" (
      set bundle_path=!filepath!\!containing_folder!_bundle.js
      set main_path=!filepath!\!filename!
      echo * Bundling !containing_folder!_bundle.js
      call browserify !main_path! -o !bundle_path!

    )
    )
  )
)
echo done

endlocal
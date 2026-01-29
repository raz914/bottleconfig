@echo off
echo Starting Build Process...

:: Run npm run build
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Exiting.
    exit /b %ERRORLEVEL%
)

set "DEST=%~dp0bottle-customizer-plugin\configurator"
set "DIST=%~dp0dist"
set "PLUGIN_DIR=%~dp0bottle-customizer-plugin"
set "ZIP_FILE=%~dp0bottle-customizer-plugin.zip"

:: Check if dist exists
if not exist "%DIST%" (
    echo Dist folder not found at %DIST%
    exit /b 1
)

:: Ensure destination exists
if not exist "%DEST%" (
    echo Creating destination directory: %DEST%
    mkdir "%DEST%"
)

echo Deploying files to %DEST%...

:: Copy files recursively and force overwrite
xcopy /E /I /Y /Q "%DIST%\*" "%DEST%\"

echo Creating Zip archive of the plugin...
:: Compress-Archive can fail on Windows when a file is locked by another process.
:: Use tar.exe (bundled with modern Windows) which is more tolerant.
pushd "%~dp0"
tar -a -c -f "%ZIP_FILE%" "bottle-customizer-plugin"
popd

echo Deployment and Zipping Complete!

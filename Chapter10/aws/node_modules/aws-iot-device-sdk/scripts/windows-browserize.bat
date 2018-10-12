@echo off

SET BROWSER_BUNDLE_DIR=browser

rem Make sure npm is available
where npm
IF %ERRORLEVEL% NEQ 0 ECHO "npm is not available, please install" && EXIT /B 2

rem Make sure browserify is available

where browserify
IF %ERRORLEVEL% NEQ 0 ECHO "browserify is not available, please install, e.g. npm install -g browserify" && EXIT /B 1
for /f "delims=" %%a in ('where browserify') do @set BROWSERIFY=%%a

rem Make sure in the top top-level directory by verifying a few files
IF NOT EXIST %BROWSER_BUNDLE_DIR% goto :EX3
IF NOT EXIST thing/index.js goto :EX3
IF NOT EXIST README.md goto :EX3
goto CONT
:EX3
echo "this script must be run in the package top-level directory"

rem Check to see if the SDK browser bundle exists; if it does not, we'll create the browser
rem bundle to be used by other applications.
:CONT
SET ROOTDIR="%cd%"
IF NOT EXIST %BROWSER_BUNDLE_DIR%\aws-iot-sdk-browser-bundle.js (
	echo %BROWSER_BUNDLE_DIR%\aws-iot-sdk-browser-bundle.js

rem Prepare the bundle by doing an npm install in the browser bundle directory.  Note
rem that we use this copy of the SDK files rather than pulling them from npm, so that
rem we can easily work with local changes, if necessary.
	cd %BROWSER_BUNDLE_DIR%
	mkdir node_modules\aws-iot-device-sdk
	xcopy /y /EXCLUDE:..\scripts\exclude_list.txt ..\* .\node_modules\aws-iot-device-sdk
	xcopy /e /i /y ..\device .\node_modules\aws-iot-device-sdk\device
	xcopy /e /i /y ..\common .\node_modules\aws-iot-device-sdk\common
	xcopy /e /i /y ..\scripts .\node_modules\aws-iot-device-sdk\scripts
	xcopy /e /i /y ..\thing .\node_modules\aws-iot-device-sdk\thing
	call npm install

rem Create the browser bundle and delete all working files/directories.  Allow
rem aws-iot-device-sdk and aws-sdk to be required by other browserify bundles.

	call %BROWSERIFY% -r aws-iot-device-sdk -r aws-sdk -o aws-iot-sdk-browser-bundle.js
	rmdir /s /q node_modules
	cd %ROOTDIR%
 	)

rem Check to see how many arguments are available; if one argument is available, we'll
rem browserify that file using external references to aws-sdk and aws-iot-device-sdk and
rem place the result in that directory under 'bundle.js'. If two arguments are available
rem we'll use the second argument as the bundle output file. Finally, we'll copy the browser
rem bundle into the application directory so that it's available for use.


IF NOT "%1"=="" (
	SET APP_PATH=%~p1
	SET APP_NAME=%~n1
	SET OUTPUT_FILE=bundle.js
	IF NOT "%2"=="" SET OUTPUT_FILE=%~nx2
	echo browserifying %APP_NAME% and placing result in "%APP_PATH%%OUTPUT_FILE%..."
	copy %BROWSER_BUNDLE_DIR%\aws-iot-sdk-browser-bundle.js %APP_PATH%
	cd %APP_PATH%
	call %BROWSERIFY% -x aws-sdk -x aws-iot-device-sdk %APP_NAME% -o %OUTPUT_FILE%
	cd %ROOTDIR%
	)

EXIT /B 0


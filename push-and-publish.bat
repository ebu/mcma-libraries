cd nodejs
call ./publish-all-npm.bat %1
REM cd ../dotnet
REM call ./push-all-nuget.bat %1
echo %1 > ../current.version

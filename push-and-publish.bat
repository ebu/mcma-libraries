cd nodejs
::call ./publish-all-npm.bat %1
cd ../dotnet
call ./push-all-nuget.bat %1
echo %1 > ../current.version
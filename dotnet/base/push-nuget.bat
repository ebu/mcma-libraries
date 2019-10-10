dotnet pack base/Mcma.Core -p:PackageVersion=%1
dotnet nuget push base/Mcma.Core/bin/packages/Mcma.Core.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack base/Mcma.Client -p:PackageVersion=%1
dotnet nuget push base/Mcma.Client/bin/packages/Mcma.Client.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack base/Mcma.Data -p:PackageVersion=%1
dotnet nuget push base/Mcma.Data/bin/packages/Mcma.Data.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack base/Mcma.Worker -p:PackageVersion=%1
dotnet nuget push base/Mcma.Worker/bin/packages/Mcma.Worker.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack base/Mcma.Api -p:PackageVersion=%1
dotnet nuget push base/Mcma.Api/bin/packages/Mcma.Api.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json
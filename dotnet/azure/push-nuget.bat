dotnet pack azure/Mcma.Azure.Client -p:PackageVersion=%1
dotnet nuget push azure/Mcma.Azure.Client/bin/packages/Mcma.Azure.Client.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack azure/Mcma.Azure.CosmosDb -p:PackageVersion=%1
dotnet nuget push azure/Mcma.Azure.CosmosDb/bin/packages/Mcma.Azure.CosmosDb.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack azure/Mcma.Azure.Functions.Logging -p:PackageVersion=%1
dotnet nuget push azure/Mcma.Azure.Functions.Logging/bin/packages/Mcma.Azure.Functions.Logging.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack azure/Mcma.Azure.BlobStorage -p:PackageVersion=%1
dotnet nuget push azure/Mcma.Azure.BlobStorage/bin/packages/Mcma.Azure.BlobStorage.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack azure/Mcma.Azure.Functions.Api -p:PackageVersion=%1
dotnet nuget push azure/Mcma.Azure.Functions.Api/bin/packages/Mcma.Azure.Functions.Api.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack azure/Mcma.Azure.Functions.Worker -p:PackageVersion=%1
dotnet nuget push azure/Mcma.Azure.Functions.Worker/bin/packages/Mcma.Azure.Functions.Worker.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json
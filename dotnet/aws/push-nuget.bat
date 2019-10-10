dotnet pack aws/Mcma.Aws.Client -p:PackageVersion=%1
dotnet nuget push aws/Mcma.Aws.Client/bin/packages/Mcma.Aws.Client.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack aws/Mcma.Aws.DynamoDb -p:PackageVersion=%1
dotnet nuget push aws/Mcma.Aws.DynamoDb/bin/packages/Mcma.Aws.DynamoDb.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack aws/Mcma.Aws.Lambda -p:PackageVersion=%1
dotnet nuget push aws/Mcma.Aws.Lambda/bin/packages/Mcma.Aws.Lambda.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack aws/Mcma.Aws.S3 -p:PackageVersion=%1
dotnet nuget push aws/Mcma.Aws.S3/bin/packages/Mcma.Aws.S3.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack aws/Mcma.Aws.ApiGateway -p:PackageVersion=%1
dotnet nuget push aws/Mcma.Aws.ApiGateway/bin/packages/Mcma.Aws.ApiGateway.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json

dotnet pack aws/Mcma.Aws.LambdaWorkerInvoker -p:PackageVersion=%1
dotnet nuget push aws/Mcma.Aws.LambdaWorkerInvoker/bin/packages/Mcma.Aws.LambdaWorkerInvoker.%1.nupkg -k=%NUGET_API_KEY% -s https://api.nuget.org/v3/index.json
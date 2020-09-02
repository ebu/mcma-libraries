using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Mcma.Serialization;
using Mcma.Data;
using Microsoft.Azure.Cosmos;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbTableProvider : IDocumentDatabaseTableProvider, IDisposable
    {
        public CosmosDbTableProvider(CosmosDbTableProviderOptions options)
        {
            if (options == null) throw new ArgumentNullException(nameof(options));

            CosmosClient =
                new CosmosClient(options.Endpoint,
                                 options.Key,
                                 new CosmosClientOptions
                                 {
                                     ApplicationRegion = options.Region,
                                     Serializer = new CosmosJsonDotNetSerializer(McmaJson.DefaultSettings())
                                 });

            Database = CosmosClient.GetDatabase(options.DatabaseId);
        }

        private CosmosClient CosmosClient { get; }
        
        private Database Database { get; }

        private Dictionary<string, (ContainerProperties containerProperties, Container container)> ContainerProperties { get; } =
            new Dictionary<string, (ContainerProperties containerProperties, Container container)>();
        
        private SemaphoreSlim ContainerPropertiesSemaphore { get; } = new SemaphoreSlim(1, 1);

        public async Task<IDocumentDatabaseTable> GetAsync(string tableName)
        {
            await ContainerPropertiesSemaphore.WaitAsync();
            
            ContainerProperties containerProperties;
            Container container;
            try
            {
                if (!ContainerProperties.ContainsKey(tableName))
                {
                    var resp = await Database.GetContainer(tableName).ReadContainerAsync();
                    ContainerProperties[tableName] = (resp.Resource, resp.Container);
                }

                (containerProperties, container) = ContainerProperties[tableName];
            }
            finally
            {
                ContainerPropertiesSemaphore.Release();
            }
            
            return new CosmosDbTable(container, containerProperties);
        }

        public void Dispose() => CosmosClient?.Dispose();
    }
}

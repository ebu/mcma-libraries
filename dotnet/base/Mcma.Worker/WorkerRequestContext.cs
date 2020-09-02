using System;
using System.Collections.Generic;
using Mcma.Context;
using Mcma.Logging;
using Mcma.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Worker
{
    public class WorkerRequestContext : ContextVariableProvider
    {
        public WorkerRequestContext(WorkerRequest request, string requestId, ILogger logger = null)
            : base(new EnvironmentVariableProvider().Merge(request.ContextVariables).ToDictionary())
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            
            OperationName = !string.IsNullOrWhiteSpace(request.OperationName)
                                ? request.OperationName
                                : throw new McmaException("OperationName must be a non-empty string");
            
            Input = request.Input;
            Tracker = request.Tracker;
            RequestId = requestId;
            
            Logger = logger;
        }

        public string OperationName { get; }

        public JObject Input { get;  }
        
        public McmaTracker Tracker { get; }

        public ILogger Logger { get; }
        
        public string RequestId { get; }

        public object GetInputAs(Type type)
        {
            try
            {
                return Input?.ToMcmaObject(type);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Worker request input could not be deserialized to type {type.Name}. See inner exception for details.", ex);
            }
        }

        public T GetInputAs<T>() => (T)GetInputAs(typeof(T));

        public bool TryGetInputAs(Type type, out object dataObject)
        {
            dataObject = null;
            try
            {
                dataObject = GetInputAs(type);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool TryGetInputAs<T>(out T dataObject)
        {
            dataObject = default;

            var result = TryGetInputAs(typeof(T), out var obj);
            if (result)
                dataObject = (T)obj;

            return result;
        }
    }
}
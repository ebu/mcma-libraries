using System;
using System.Collections.Generic;
using Mcma.Core;
using Mcma.Core.ContextVariables;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Worker
{
    public class WorkerRequest : ContextVariableProvider
    {
        public WorkerRequest(string operationName, IDictionary<string, string> contextVariables)
            : base(contextVariables)
        {
            OperationName = operationName;
        }

        public string OperationName { get; }

        public JObject Input { get; set; }

        public T GetInput<T>()
        {
            try
            {
                 return Input != null ? Input.ToMcmaObject<T>() : default(T);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Worker request input could not be deserialized to type {typeof(T).Name}. See inner exception for details.", ex);
            }
        }

        public bool TryGetInput<T>(out T dataObject)
        {
            dataObject = default(T);
            try
            {
                 dataObject = GetInput<T>();

                 return true;
            }
            catch
            {
                return false;
            }
        }
    }
}

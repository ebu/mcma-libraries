using System;
using System.Collections.Generic;
using Mcma.Core.Context;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Worker
{
    public class WorkerRequest : Context
    {
        public WorkerRequest(string operationName, IDictionary<string, string> contextVariables)
            : base(new EnvironmentVariables().Merge(contextVariables).ToDictionary())
        {
            OperationName = operationName;
        }

        public string OperationName { get; }

        public JObject Input { get; set; }

        public object GetInput(Type type)
        {
            try
            {
                 return Input != null ? Input.ToMcmaObject(type) : null;
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Worker request input could not be deserialized to type {type.Name}. See inner exception for details.", ex);
            }
        }

        public T GetInput<T>() => (T)GetInput(typeof(T));

        public bool TryGetInput(Type type, out object dataObject)
        {
            dataObject = null;
            try
            {
                 dataObject = GetInput(type);

                 return true;
            }
            catch
            {
                return false;
            }
        }

        public bool TryGetInput<T>(out T dataObject)
        {
            dataObject = default(T);

            var result = TryGetInput(typeof(T), out var obj);
            if (result)
                dataObject = (T)obj;

            return result;
        }
    }
}

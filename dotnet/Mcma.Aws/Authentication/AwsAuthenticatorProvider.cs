using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Aws.Authentication
{
    public class AwsAuthenticatorProvider : IMcmaAuthenticatorProvider
    {
        public AwsAuthenticatorProvider(IDictionary<string, string> defaultAuthContexts = null)
        {
            DefaultAuthContexts = defaultAuthContexts ?? new Dictionary<string, string>();
        }

        private IDictionary<string, string> DefaultAuthContexts { get; }

        public Task<IMcmaAuthenticator> GetAuthenticatorAsync(string authType, string authContext)
        {
            switch (authType)
            {
                case AwsConstants.AWS4:
                    return Task.FromResult<IMcmaAuthenticator>(new AwsV4Authenticator(GetAuthContext<AwsV4AuthContext>(authType, authContext, true)));
                default:
                    throw new Exception($"Unrecognized authentication type '{authType}'");
            }
        }

        private T GetAuthContext<T>(string authType, string authContext, bool required)
        {
            if (TryParseAuthContext<T>(authContext, out var result))
                return result;

            if (DefaultAuthContexts.ContainsKey(authType) && TryParseAuthContext<T>(DefaultAuthContexts[authType], out var defaultResult))
                return defaultResult;

            if (required)
                throw new Exception($"Auth type {authType} requires a context.");

            return default(T);
        }

        private bool TryParseAuthContext<T>(string authContext, out T result)
        {
            try
            {
                result = JObject.Parse(authContext).ToMcmaObject<T>();
                return true;
            }
            catch// (Exception ex)
            {
                //Logger.Warn($"Failed to parse an auth context object of type {typeof(T).Name} from JSON '{authContext}'.{Environment.NewLine}Exception:{Environment.NewLine}{ex}");

                result = default(T);
                return false;
            }
        }
    }
}
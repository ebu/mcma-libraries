using System;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public interface IAuthTypeRegistration
    {
        string AuthType { get; }
        Type ContextType { get; }
        Task<IAuthenticator> CreateAuthenticatorAsync(object context);
    }
}
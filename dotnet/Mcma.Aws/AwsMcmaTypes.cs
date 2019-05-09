using Mcma.Core.Serialization;
using Mcma.Aws.S3;

namespace Mcma.Aws
{
    public static class AwsMcmaTypes
    {
        private static bool Called { get; set; }

        public static void Add()
        {
            if (Called) return;
            
            McmaTypes.Add<S3Locator>();
            Called = true;
        }
    }
}
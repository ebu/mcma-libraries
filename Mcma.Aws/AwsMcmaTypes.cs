using Mcma.Core.Serialization;

namespace Mcma.Aws
{
    public static class AwsMcmaTypes
    {
        public static void Add() => McmaTypes.Add<S3Locator>();
    }
}

using System;

namespace Mcma.Aws.Client
{
    public class AwsDate
    {
        private DateTime UtcNow { get; } = DateTime.UtcNow;

        public string DateString => UtcNow.ToString("yyyyMMdd");

        public string DateTimeString => UtcNow.ToString("yyyyMMddTHHmmssZ");
    }
}
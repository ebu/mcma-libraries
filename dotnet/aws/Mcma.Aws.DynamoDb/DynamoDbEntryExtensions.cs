using Amazon.DynamoDBv2.DocumentModel;
using System;

namespace Mcma.Aws.DynamoDb
{
    public static class DynamoDbEntryExtensions
    {
        public static Primitive ToPrimitive(this object obj, string objTextValue = null)
        {
            if (obj == null)
                return new Primitive();

            var primitive = new Primitive(objTextValue ?? obj.ToString());

            switch (obj)
            {
                case float partitionKeyFloat:
                case double partitionKeyDouble:
                case decimal partitionKeyDecimal:
                case int partitionKeyInt:
                case uint partitionKeyUInt:
                case long partitionKeyLong:
                case ulong partitionKeyULong:
                case short partitionKeyShort:
                case ushort partitionKeyUShort:
                    primitive.Type = DynamoDBEntryType.Numeric;
                    break;

                case string partitionKeyStr:
                case DateTime dateTime:
                case Guid guid:
                case Type type:
                    primitive.Type = DynamoDBEntryType.String;
                    break;
            }

            return primitive;
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using Mcma.Core.Logging;

namespace Mcma.Core.Serialization
{
    public static class McmaTypes
    {
        private static List<Type> Types { get; } = new List<Type>();

        public static void Add(Type type)
        {
            if (!Types.Contains(type))
                Types.Add(type);
        }

        public static void Add<T>() => Add(typeof(T));

        public static Type FindType(string typeString)
        {
            // check for match in explicitly-provided type collection
            var objectType = Types.FirstOrDefault(t => t.Name.Equals(typeString, StringComparison.OrdinalIgnoreCase));
            if (objectType == null)
            {
                // check for match in core types
                objectType = Type.GetType(typeof(McmaObject).AssemblyQualifiedName.Replace(nameof(McmaObject), typeString));
            }

            return objectType;
        }
    }
}
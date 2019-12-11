using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Mcma.Core.Logging;

namespace Mcma.Core.Serialization
{
    public static class McmaTypes
    {
        public interface ITypeRegistrations
        {
            ITypeRegistrations Add<T>();

            ITypeRegistrations Add(Type type);
        }

        private class TypeRegistrations : ITypeRegistrations, IEnumerable<Type>
        {
            internal List<Type> Types { get; } = new List<Type>();

            public ITypeRegistrations Add<T>() => Add(typeof(T));

            public ITypeRegistrations Add(Type type)
            {
                if (!Types.Contains(type))
                    Types.Add(type);
                return this;
            }

            public IEnumerator<Type> GetEnumerator() => Types.GetEnumerator();

            IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
        }

        static McmaTypes()
        {
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
                AddTypesFromAssembly(assembly);

            AppDomain.CurrentDomain.AssemblyLoad += (sender, args) => AddTypesFromAssembly(args.LoadedAssembly);
        }

        private static TypeRegistrations Types { get; } = new TypeRegistrations();
        
        private static void AddTypesFromAssembly(Assembly assembly)
        {
            if (assembly.FullName.StartsWith("System") || assembly.FullName.StartsWith("Microsoft"))
                return;

            try
            {
                foreach (var mcmaType in assembly.GetExportedTypes().Where(t => typeof(McmaObject).IsAssignableFrom(t)))
                    Types.Add(mcmaType);
            }
            catch (Exception ex)
            {
                Logger.System.Error($"Failed to load types from assembly {assembly.FullName}.{Environment.NewLine}Exception:{Environment.NewLine}{ex}");
            }
        }
        
        public static ITypeRegistrations Add<T>() => Add(typeof(T));
        
        public static ITypeRegistrations Add(Type type) => Types.Add(type);

        public static Type FindType(string typeString)
        {
            if (typeString == null)
                return null;

            // check for match in explicitly-provided type collection
            var objectType = Types.FirstOrDefault(t => t.Name.Equals(typeString, StringComparison.OrdinalIgnoreCase));
            if (objectType == null)
            {
                // check for match in core types
                objectType = Type.GetType(typeof(McmaObject).AssemblyQualifiedName.Replace(nameof(McmaObject), typeString));
            }

            return objectType;
        }

        public static Type GetResourceType(this McmaResource resource) => resource?.Type != null ? FindType(resource.Type) : null;
    }
}
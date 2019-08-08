using System;
using System.Linq;
using System.Reflection;

public static class ReflectionExtensions
{
    public static bool HasImplicitConversionTo<T>(this Type baseType)
        => baseType.HasImplicitConversionTo(typeof(T));
        
    public static bool HasImplicitConversionTo(this Type castFrom, Type castTo)
        =>
            castFrom.GetMethods(BindingFlags.Public | BindingFlags.Static)
                .Any(mi =>
                    mi.Name == "op_Implicit" &&
                    mi.ReturnType == castTo &&
                    mi.GetParameters().Any(pi => pi.ParameterType == castFrom));
}

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mcma.Core.Utility
{
    public static class StringExtensions
    {
        /// <summary>
        /// Splits a string
        /// </summary>
        /// <param name="toSplit"></param>
        /// <param name="splitOn"></param>
        /// <returns></returns>
        public static string[] SplitOn(this string toSplit, string splitOn)
            => toSplit.Split(new[] {splitOn}, StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim()).ToArray();

        /// <summary>
        /// Joins a collection of strings
        /// </summary>
        /// <param name="toJoin"></param>
        /// <param name="joinWith"></param>
        /// <returns></returns>
        public static string Join(this IEnumerable<string> toJoin, string joinWith = null)
            => toJoin != null ? string.Join(joinWith ?? string.Empty, toJoin) : string.Empty;

        /// <summary>
        /// Converts a delimited string into a dictionary of key-value pairs
        /// </summary>
        /// <param name="source"></param>
        /// <param name="pairDelimiter"></param>
        /// <param name="valueDelimiter"></param>
        /// <returns></returns>
        public static IDictionary<string, string> ToDictionary(this string source, string pairDelimiter, string valueDelimiter = "=")
            => source.SplitOn(pairDelimiter).Select(x => x.ToKeyValuePair(valueDelimiter)).ToDictionary(x => x.Item1, x => x.Item2);

        /// <summary>
        /// Converts a string to a key-value pair
        /// </summary>
        /// <param name="source"></param>
        /// <param name="delimiter"></param>
        /// <returns></returns>
        public static (string, string) ToKeyValuePair(this string source, string delimiter = "=")
        {
            var split = source.SplitOn(delimiter);

            switch (split.Length)
            {
                case 0:
                    return (string.Empty, string.Empty);
                case 1:
                    return (split[0], string.Empty);
                case 2:
                    return (split[0], split[1]);
                default:
                    return (split[0], string.Join(delimiter, split.Skip(1)));
            }
        }
        /// <summary>
        /// Converts a string to the base 64 representation of its UTF-8 bytes
        /// </summary>
        /// <param name="text">The text to convert</param>
        /// <returns>The base 64 representation of its UTF-8 bytes</returns>
        public static string ToBase64(this string text) => Convert.ToBase64String(Encoding.UTF8.GetBytes(text));
        /// <summary>
        /// Converts a string from base 64 representation
        /// </summary>
        /// <param name="text">The text to convert</param>
        /// <returns>The plain text version of the given base 64</returns>
        public static string FromBase64(this string text) => Encoding.UTF8.GetString(Convert.FromBase64String(text));

        /// <summary>
        /// Converts a text value to a given type
        /// </summary>
        /// <typeparam name="T">The type to which to convert the text</typeparam>
        /// <param name="textValue">The text value to convert</param>
        /// <returns>The resulting converted value</returns>
        public static T Parse<T>(this string textValue) => (T)textValue.Parse(typeof(T));

        /// <summary>
        /// Tries to parse a text value to a value of a given type, using a default value if parsing fails
        /// </summary>
        /// <typeparam name="T">The type to which to parse</typeparam>
        /// <param name="textValue">The text value to parse</param>
        /// <param name="defaultValue">The default value to use if parsing fails</param>
        /// <returns>The parsed value if successful; otherwise, the provided default value</returns>
        public static T TryParse<T>(this string textValue, T defaultValue) => textValue.TryParse(out T tmp) ? tmp : defaultValue;
        

        /// <summary>
        /// Tries to parse a text value to a value of a given type
        /// </summary>
        /// <typeparam name="T">The type to which to parse</typeparam>
        /// <param name="textValue">The text value to parse</param>
        /// <param name="obj">The resulting parsed object</param>
        /// <returns>True if parsed successfully; else, false</returns>
        public static bool TryParse<T>(this string textValue, out T obj)
        {
            // try to parse
            var parsed = textValue.TryParse(typeof(T), out var tmp);

            // set out value
            obj = parsed ? (T)tmp : default(T);

            // return parsed flag
            return parsed;
        }

        /// <summary>
        /// Converts a text value to a given type
        /// </summary>
        /// <param name="textValue">The text value to convert</param>
        /// <param name="type">The type to which to convert the text</param>
        /// <returns>The resulting converted value</returns>
        public static object Parse(this string textValue, Type type)
        {
            // try to parse
            if (textValue.TryParse(type, out object obj))
                return obj;

            // if we reach this point, the type was recognized, but the text could not be parsed
            throw new Exception($"Failed to parse object of type {type.Name} from text '{textValue}'.");
        }

        /// <summary>
        /// Tries to parse a text value to a value of a given type
        /// </summary>
        /// <param name="textValue">The text value to parse</param>
        /// <param name="type">The type to which to parse</param>
        /// <param name="obj">The resulting parsed object</param>
        /// <returns>True if parsed successfully; else, false</returns>
        public static bool TryParse(this string textValue, Type type, out object obj)
        {
            // strings always return true
            if (type == typeof(string))
            {
                // return value as-is
                obj = textValue;
                return true;
            }

            // set obj value to null
            obj = null;

            // handle nullables by either converting to the inner type or returning null
            if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>))
            {
                // if empty text, consider value to be null
                if (string.IsNullOrWhiteSpace(textValue)) return true;

                // use inner type to convert value
                type = type.GetGenericArguments().First();
            }

            // try to convert the value based on the type
            if (type == typeof(bool))
            {
                if (bool.TryParse(textValue, out var boolValue))
                    obj = boolValue;
            }
            else if (type == typeof(int))
            {
                // try to parse to an int
                if (int.TryParse(textValue, out var intValue))
                    obj = intValue;
            }
            else if (type == typeof(uint))
            {
                // try to parse to an unsigned int
                if (uint.TryParse(textValue, out var uintValue))
                    obj = uintValue;
            }
            else if (type == typeof(long))
            {
                // try to parse to a long
                if (long.TryParse(textValue, out var longValue))
                    obj = longValue;
            }
            else if (type == typeof(ulong))
            {
                // try to parse to an unsigned long
                if (ulong.TryParse(textValue, out var ulongValue))
                    obj = ulongValue;
            }
            else if (type == typeof(double))
            {
                // try to parse to a decimal
                if (double.TryParse(textValue, out var doubleValue))
                    obj = doubleValue;
            }
            else if (type == typeof(decimal))
            {
                // try to parse to a double
                if (decimal.TryParse(textValue, out var decimalValue))
                    obj = decimalValue;
            }
            else if (type == typeof(float))
            {
                // try to parse to a float
                if (float.TryParse(textValue, out var floatValue))
                    obj = floatValue;
            }
            else if (type == typeof(DateTime))
            {
                // try to parse to a datetim
                if (DateTime.TryParse(textValue, out var dateTimeValue))
                    obj = dateTimeValue;
            }
            else if (type == typeof(TimeSpan))
            {
                // try to parse to a timespan
                if (TimeSpan.TryParse(textValue, out var timeSpanValue))
                    obj = timeSpanValue;
            }
            else if (type == typeof(Guid))
            {
                // try to parse to a guid
                if (Guid.TryParse(textValue, out var guidValue))
                    obj = guidValue;
            }
            else // type not recognized
                throw new Exception($"Type '{type.Name}' is not parsable from text.");

            return obj != null;
        }
        
        /// <summary>
        /// Replaces text in a given string, using the specified StringComparison to find matches
        /// </summary>
        /// <param name="source"></param>
        /// <param name="toReplace"></param>
        /// <param name="replaceWith"></param>
        /// <param name="stringComparison"></param>
        /// <returns></returns>
        public static string Replace(this string source, string toReplace, string replaceWith, StringComparison stringComparison)
        {
            var curIndex = 0;
            var indexOfNextReplacement = source.IndexOf(toReplace, curIndex, stringComparison);

            var result = new StringBuilder();

            while (indexOfNextReplacement >= 0 && curIndex < source.Length)
            {
                if (indexOfNextReplacement != 0)
                    result.Append(source.Substring(curIndex, indexOfNextReplacement));

                result.Append(replaceWith);

                curIndex = indexOfNextReplacement + toReplace.Length;
                indexOfNextReplacement = source.IndexOf(toReplace, curIndex, stringComparison);
            }

            if (curIndex < source.Length)
                result.Append(source.Substring(curIndex));

            return result.ToString();
        }
        #region Camel <-> Pascal

        /// <summary>
        /// Converts a camel case string to Pascal case
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string CamelCaseToPascalCase(this string text)
        {
            return char.ToUpper(text[0]) + text.Substring(1);
        }

        /// <summary>
        /// Converts a Pascal case string to camel case
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string PascalCaseToCamelCase(this string text)
        {
            return char.ToLower(text[0]) + text.Substring(1);
        }

        #endregion

        #region Camel <-> Kebab

        /// <summary>
        /// Converts a kebab case string to camel case
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string KebabCaseToCamelCase(this string text)
        {
            var sb = new StringBuilder();

            for (var i = 0; i < text.Length; i++)
            {
                if (text[i] == '-')
                {
                    i++;
                    sb.Append(char.ToUpper(text[i]));
                }
                else
                    sb.Append(text[i]);
            }

            return sb.ToString();
        }

        /// <summary>
        /// Converts a camel case string to kebab case
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string CamelCaseToKebabCase(this string text)
        {
            var sb = new StringBuilder();

            foreach (var c in text)
            {
                if (char.IsUpper(c))
                {
                    if (sb.Length > 0)
                        sb.Append("-");
                    sb.Append(char.ToLower(c));
                }
                else
                    sb.Append(c);
            }

            return sb.ToString();
        }

        #endregion

        #region Pascal <-> Kebab

        /// <summary>
        /// Converts a Pascal case string to kebab case
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string PascalCaseToKebabCase(this string text)
        {
            return CamelCaseToKebabCase(PascalCaseToCamelCase(text));
        }

        /// <summary>
        /// Converts a kebab case string to Pascal case
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public static string KebabCaseToPascalCase(this string text)
        {
            return CamelCaseToPascalCase(KebabCaseToCamelCase(text));
        }

        #endregion
        

        public static string HexEncode(this byte[] key) => BitConverter.ToString(key).ToLowerInvariant().Replace("-", "");

        public static byte[] HexDecode(this string hexString) => hexString.SplitIntoChunks(2).Select(x => Convert.ToByte(x, 16)).ToArray();

        public static string HexDecodeString(this string hexString) => Encoding.UTF8.GetString(hexString.HexDecode());

        public static IEnumerable<string> SplitIntoChunks(this string source, int chunkSize)
        {
            for (var i = 0; i < source.Length; i += chunkSize)
                yield return (i + chunkSize) < source.Length ? source.Substring(i, chunkSize) : source.Substring(i);
        }

        public static async Task<string> ReadStringFromStreamAsync(this Stream stream)
        {
            using (var textReader = new StreamReader(stream))
                return await textReader.ReadToEndAsync();
        }
    }
}
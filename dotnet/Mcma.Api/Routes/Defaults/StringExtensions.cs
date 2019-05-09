using Pluralize.NET;
using System.Linq;

namespace Mcma.Api.Routes.Defaults
{
    public static class StringExtensions
    {
        private static readonly Pluralizer Pluralizer = new Pluralizer();

        public static string PluralizeKebabCase(this string kebabCase)
        {
            var parts = kebabCase.Split('-').ToArray();
            parts[parts.Length - 1] = Pluralizer.Pluralize(parts[parts.Length - 1]);
            return string.Join("-", parts);
        }
    }
}

using System.Collections.Generic;

namespace Mcma.Core
{
    public class BMContent : McmaResource
    {
        public string Status { get; set; }

        public List<string> BmEssences { get; set; } = new List<string>();
    }
}
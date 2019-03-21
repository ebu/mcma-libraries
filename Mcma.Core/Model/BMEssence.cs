namespace Mcma.Core
{
    public class BMEssence : McmaResource
    {
        public string BmContent { get; set; }

        public string Status { get; set; }

        public Locator[] Locations { get; set; }
    }
}
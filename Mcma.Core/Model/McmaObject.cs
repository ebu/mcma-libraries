namespace Mcma.Core
{
    public abstract class McmaObject : McmaExpandoObject
    {
        protected McmaObject()
        {
            Type = GetType().Name;
        }

        public string Type { get; set; }
    }
}
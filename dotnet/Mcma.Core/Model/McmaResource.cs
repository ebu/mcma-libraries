using System;

namespace Mcma.Core
{
    public abstract class McmaResource : McmaObject
    {
        public string Id { get; set; }

        public DateTime? DateCreated { get; set; }

        public DateTime? DateModified { get; set; }
    }
}
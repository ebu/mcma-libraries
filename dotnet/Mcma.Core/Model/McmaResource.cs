using System;

namespace Mcma.Core
{
    public abstract class McmaResource : McmaObject
    {
        public string Id { get; set; }

        public DateTime? DateCreated { get; set; }

        public DateTime? DateModified { get; set; }

        public void OnCreate(string id)
        {
            Id = id;
            DateModified = DateCreated = DateTime.UtcNow;
        }

        public void OnUpsert(string id)
        {
            Id = id;
            DateModified = DateTime.UtcNow;
            if (!DateCreated.HasValue)
                DateCreated = DateModified;
        }
    }
}

using System;
using System.Threading.Tasks;
using Mcma.Logging;

namespace Mcma.Data
{
    public abstract class DocumentDatabaseMutex : IDocumentDatabaseMutex
    {
        protected DocumentDatabaseMutex(string mutexName, string mutexHolder, TimeSpan? lockTimeout, ILogger logger = null)
        {
            MutexName = mutexName ?? throw new ArgumentNullException(nameof(mutexName));
            MutexHolder = mutexHolder ?? throw new ArgumentNullException(nameof(mutexHolder));
            LockTimeout = lockTimeout ?? TimeSpan.FromMinutes(1);
            Logger = logger;
        }

        protected string MutexName { get; }
        
        protected string MutexHolder { get; }
        
        protected TimeSpan LockTimeout { get; }
        
        protected ILogger Logger { get; }
        
        protected bool HasLock { get; set; }
        
        protected abstract string VersionId { get; }
        
        public async Task LockAsync()
        {
            if (HasLock)
                throw new McmaException("Cannot lock when already locked");

            Logger?.Debug("Requesting lock for mutex '" + MutexName + "' by '" + MutexHolder + "'");
            while (!HasLock) {
                try
                {
                    await PutLockDataAsync();
                    var lockData = await GetLockDataAsync();
                    HasLock = lockData?.MutexHolder == MutexHolder && lockData?.VersionId == VersionId;
                }
                catch
                {
                    var lockData = await GetLockDataAsync();
                    if (lockData != null)
                    {
                        if (lockData.Timestamp < DateTime.UtcNow - LockTimeout)
                        {
                            Logger?.Warn("Deleting stale lock for mutex '" + MutexName + "' by '" + lockData.MutexHolder + "'");
                            try
                            {
                                await DeleteLockDataAsync(lockData.VersionId);
                            }
                            catch
                            {
                                // nothing else we can do at this point
                            }
                        }
                    }
                }

                if (!HasLock) {
                    await Task.Delay(TimeSpan.FromSeconds(0.5));
                }
            }
            Logger?.Debug("Acquired lock for mutex '" + MutexName + "' by '" + MutexHolder + "'");
        }

        public async Task UnlockAsync()
        {
            if (!HasLock) {
                throw new McmaException("Cannot unlock when not locked");
            }

            await DeleteLockDataAsync(VersionId);
            HasLock = false;
            Logger?.Debug("Released lock for mutex '" + MutexName + "' by '" + MutexHolder + "'");
        }

        protected abstract Task PutLockDataAsync();

        protected abstract Task<LockData> GetLockDataAsync();

        protected abstract Task DeleteLockDataAsync(string versionId);
    }
}
import { Logger, McmaException, Utils } from "@mcma/core";

export interface DocumentDatabaseMutex {
    lock(): Promise<void>;
    tryLock(): Promise<boolean>;
    unlock(): Promise<void>;
}

export interface LockData {
    mutexHolder: string;
    timestamp: number;
    versionId?: string;
}

export abstract class DocumentDatabaseMutex {
    protected hasLock = false;

    protected constructor(
        public readonly mutexName: string,
        protected readonly mutexHolder: string,
        protected readonly lockTimeout = 300000,
        protected readonly logger?: Logger
    ) {
    }

    protected abstract get versionId(): string;

    protected abstract putLockData(): Promise<void>;

    protected abstract getLockData(): Promise<LockData>;

    protected abstract deleteLockData(versionId: string): Promise<void>;

    async lock() {
        if (this.hasLock) {
            throw new McmaException("Cannot lock when already locked");
        }

        this.logger?.debug("Requesting lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
        while (!this.hasLock) {
            try {
                await this.putLockData();
                const lockData = await this.getLockData();
                this.hasLock = lockData?.mutexHolder === this.mutexHolder && lockData?.versionId === this.versionId;
            } catch (error) {
                const lockData = await this.getLockData();
                if (lockData) {
                    if (lockData.timestamp < Date.now() - this.lockTimeout) {
                        this.logger?.warn("Deleting stale lock for mutex '" + this.mutexName + "' by '" + lockData.mutexHolder + "'");
                        try {
                            await this.deleteLockData(lockData.versionId);
                        } catch (error) {
                        }
                    }
                }
            }

            if (!this.hasLock) {
                await Utils.sleep(500);
            }
        }
        this.logger?.debug("Acquired lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
    }

    async tryLock(): Promise<boolean> {
        if (this.hasLock) {
            throw new McmaException("Cannot lock when already locked");
        }

        let tryAgain: boolean;

        this.logger?.debug("Requesting lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
        do {
            tryAgain = false;
            try {
                await this.putLockData();
                const lockData = await this.getLockData();
                this.hasLock = lockData?.mutexHolder === this.mutexHolder && lockData?.versionId === this.versionId;
            } catch (error) {
                const lockData = await this.getLockData();
                if (lockData) {
                    if (lockData.timestamp < Date.now() - this.lockTimeout) {
                        this.logger?.warn("Deleting stale lock for mutex '" + this.mutexName + "' by '" + lockData.mutexHolder + "'");
                        try {
                            await this.deleteLockData(lockData.versionId);
                        } catch (error) {
                        }
                        tryAgain = true;
                    }
                }
            }

            if (tryAgain) {
                await Utils.sleep(500);
            }
        } while (tryAgain);

        if (this.hasLock) {
            this.logger?.debug("Acquired lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
        } else {
            this.logger?.debug("Failed to acquire lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
        }

        return this.hasLock;
    }

    async unlock() {
        if (!this.hasLock) {
            throw new McmaException("Cannot unlock when not locked");
        }

        await this.deleteLockData(this.versionId);
        this.hasLock = false;
        this.logger?.debug("Released lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
    }
}

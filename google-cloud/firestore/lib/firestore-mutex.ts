import { DocumentDatabaseMutex, LockData } from "@mcma/data";
import { CollectionReference, DocumentReference, Timestamp } from "@google-cloud/firestore";
import { Logger } from "@mcma/core";

function timestampToString(timestamp: Timestamp) {
    return timestamp.seconds + "." + timestamp.nanoseconds;
}

export class FirestoreMutex extends DocumentDatabaseMutex {
    private docRef: DocumentReference;
    private timestamp: string;
    
    constructor(
        collectionRef: CollectionReference,
        mutexName: string,
        mutexHolder: string,
        lockTimeout: number = 300000,
        logger?: Logger
    ) {
        super(mutexName, mutexHolder, lockTimeout, logger);

        let prefix = "mutexes";
        if (!this.mutexName.startsWith("/")) {
            prefix += "/";
        }
        
        this.docRef = collectionRef.doc(prefix + this.mutexName);
    }
    
    protected get versionId(): string {
        return this.timestamp;
    }

    protected async getLockData(): Promise<LockData> {
        const doc = await this.docRef.get();
        const item = doc.data();

        // sanity check which removes the record from CosmosDB in case it has incompatible structure. Only possible
        // if modified externally, but this could lead to a situation where the lock would never be acquired.
        if (item && (!item.mutexHolder || !item.timestamp)) {
            await this.docRef.delete();
            return undefined;
        }
        
        item.versionId = timestampToString(doc.createTime);

        return item as LockData;
    }

    protected async putLockData(): Promise<void> {
        const result = await this.docRef.create({
            mutexHolder: this.mutexHolder,
            timestamp: Date.now()
        });
        
        this.timestamp = timestampToString(result.writeTime);
    }
    
    protected async deleteLockData(versionId: string): Promise<void> {
        const [ seconds, nanoseconds ] = versionId.split(".");
        await this.docRef.delete({
            lastUpdateTime: new Timestamp(parseInt(seconds), parseInt(nanoseconds))
        });
    }
}

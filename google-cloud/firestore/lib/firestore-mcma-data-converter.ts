import { Document } from "@mcma/data";
import { DocumentData, FirestoreDataConverter, Timestamp } from "@google-cloud/firestore";

function serialize(object: any) {
    let copy: any;
    if (object) {
        copy = Array.isArray(object) ? [] : {};
        for (const key of Object.keys(object)) {
            const value = object[key];
            if (value instanceof Date) {
                copy[key] = Timestamp.fromDate(value);
            } else if (typeof value === "object") {
                copy[key] = serialize(value);
            } else if (typeof value !== "undefined" && typeof value !== "function") {
                copy[key] = value;
            }
        }
    }
    return copy;
}

function deserialize(object: any) {
    let copy: any;
    if (object) {
        copy = Array.isArray(object) ? [] : {};
        for (const key of Object.keys(object)) {
            const value = object[key];
            if (value instanceof Timestamp) {
                copy[key] = new Date(value.toMillis());
            } else if (typeof value === "object") {
                copy[key] = deserialize(value);
            } else {
                copy[key] = value;
            }
        }
    }
    return copy;
}

export class FirestoreMcmaDataConverter<TDocument = Document> implements FirestoreDataConverter<TDocument> {
    fromFirestore(documentData: DocumentData): TDocument {
        return deserialize(documentData);
    }

    toFirestore(document: TDocument): DocumentData {
        return serialize(document);
    }
}
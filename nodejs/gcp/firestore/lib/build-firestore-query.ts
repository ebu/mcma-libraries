import { Document, FilterCriteria, FilterCriteriaGroup, FilterExpression, isFilterCriteriaGroup, Query } from "@mcma/data";
import { CollectionReference, Query as FirestoreQuery, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { McmaException } from "@mcma/core";

function addFilterCriteriaToQuery<TDocument>(firestoreQuery: FirestoreQuery, filterCriteria: FilterCriteria<TDocument>): FirestoreQuery {
    if (filterCriteria.operator === "!=") {
        throw new McmaException(
            "Firestore does not currently support the not equals (!=) operator. When possible, use < and > to exclude specific values.\n" +
            "For more information, see https://firebase.google.com/docs/firestore/query-data/queries.");
    }
    
    const fieldPath = "resource." + filterCriteria.propertyName;
    const operator = filterCriteria.operator === "=" ? "==" : filterCriteria.operator;
    
    return firestoreQuery.where(fieldPath, operator, filterCriteria.propertyValue);
}

function addFilterCriteriaGroupToQuery<TDocument>(firestoreQuery: FirestoreQuery, filterCriteriaGroup: FilterCriteriaGroup<TDocument>): FirestoreQuery {
    if (filterCriteriaGroup.logicalOperator === "||") {
        throw new McmaException(
            "Firestore does not currently support the logical or (||) operator. When possible, split your query into parts and merge the results.\n" +
            "For more information, see https://firebase.google.com/docs/firestore/query-data/queries.");
    }
    for (const expression of filterCriteriaGroup.children) {
        firestoreQuery = addFilterToQuery(firestoreQuery, expression);
    }
    return firestoreQuery;
}

function addFilterToQuery<TDocument>(firestoreQuery: FirestoreQuery, filterExpression: FilterExpression<TDocument>): FirestoreQuery {
    return isFilterCriteriaGroup<TDocument>(filterExpression)
        ? addFilterCriteriaGroupToQuery<TDocument>(firestoreQuery, filterExpression)
        : addFilterCriteriaToQuery(firestoreQuery, filterExpression);
}

async function pageQuery(firestoreQuery: FirestoreQuery, pageSize: number, pageNumber: number): Promise<FirestoreQuery> {
    pageNumber = pageNumber ?? 0;

    let curPageNum = 0;
    let startAfter: QueryDocumentSnapshot;
    while (curPageNum < pageNumber) {
    
        let pageQuery = firestoreQuery.orderBy("path").limit(pageSize);
        if (startAfter) {
            pageQuery = pageQuery.startAfter(startAfter);
        }
    
        const pageResults = await pageQuery.get();
        startAfter = pageResults.docs[pageResults.docs.length - 1];
        curPageNum++;
    }
    
    firestoreQuery = firestoreQuery.orderBy("path").limit(pageSize);
    if (startAfter) {
        firestoreQuery = firestoreQuery.startAfter(startAfter);
    }
    
    return firestoreQuery;
}

export async function buildFirestoreQuery<TDocument extends Document = Document>(collectionRef: CollectionReference, query: Query<TDocument>): Promise<FirestoreQuery> {
    let firestoreQuery: FirestoreQuery = collectionRef;
    if (query.path) {
        firestoreQuery = firestoreQuery.where("path", "==", query.path);
    }
    if (query.filterExpression) {
        firestoreQuery = addFilterToQuery<TDocument>(firestoreQuery, query.filterExpression);
    }
    if (query.pageSize) {
        firestoreQuery = await pageQuery(firestoreQuery, query.pageSize, query.pageNumber);
    }
    return firestoreQuery;
}
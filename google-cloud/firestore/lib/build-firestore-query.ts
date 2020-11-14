import { Document, FilterCriteria, FilterCriteriaGroup, FilterExpression, isFilterCriteriaGroup, Query } from "@mcma/data";
import { Query as FirestoreQuery } from "@google-cloud/firestore";
import { McmaException } from "@mcma/core";

function addFilterCriteriaToQuery<TDocument>(firestoreQuery: FirestoreQuery<TDocument>, filterCriteria: FilterCriteria<TDocument>): FirestoreQuery<TDocument> {
    if (filterCriteria.operator === "!=") {
        throw new McmaException(
            "Firestore does not currently support the not equals (!=) operator. When possible, use < and > to exclude specific values.\n" +
            "For more information, see https://firebase.google.com/docs/firestore/query-data/queries.");
    }
    return firestoreQuery.where(filterCriteria.propertyName, filterCriteria.operator === "=" ? "==" : filterCriteria.operator, filterCriteria.propertyValue);
}

function addFilterCriteriaGroupToQuery<TDocument>(firestoreQuery: FirestoreQuery<TDocument>, filterCriteriaGroup: FilterCriteriaGroup<TDocument>): FirestoreQuery<TDocument> {
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

function addFilterToQuery<TDocument>(firestoreQuery: FirestoreQuery<TDocument>, filterExpression: FilterExpression<TDocument>): FirestoreQuery<TDocument> {
    return isFilterCriteriaGroup<TDocument>(filterExpression)
        ? addFilterCriteriaGroupToQuery<TDocument>(firestoreQuery, filterExpression)
        : addFilterCriteriaToQuery(firestoreQuery, filterExpression);
}

export function buildFirestoreQuery<TDocument extends Document = Document>(
    firestoreQuery: FirestoreQuery<TDocument>, query: Query<TDocument>
): FirestoreQuery<TDocument> {
    if (query.filterExpression) {
        firestoreQuery = addFilterToQuery<TDocument>(firestoreQuery, query.filterExpression);
    }
    if (query.pageSize) {
        firestoreQuery = firestoreQuery.limit(query.pageSize);
    }
    if (query.pageStartToken) {
        firestoreQuery = firestoreQuery.startAfter(query.pageStartToken);
    }

    return firestoreQuery;
}


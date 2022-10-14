/* tslint:disable */
/* eslint-disable */
/**
 * datomic-qbuilder-api
 * TODO...
 *
 * The version of the OpenAPI document: 0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface QueryApiResponse
 */
export interface QueryApiResponse {
    /**
     * 
     * @type {number}
     * @memberof QueryApiResponse
     */
    total: number;
    /**
     * 
     * @type {Array<object>}
     * @memberof QueryApiResponse
     */
    hits: Array<object>;
}

/**
 * Check if a given object implements the QueryApiResponse interface.
 */
export function instanceOfQueryApiResponse(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "total" in value;
    isInstance = isInstance && "hits" in value;

    return isInstance;
}

export function QueryApiResponseFromJSON(json: any): QueryApiResponse {
    return QueryApiResponseFromJSONTyped(json, false);
}

export function QueryApiResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): QueryApiResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'total': json['total'],
        'hits': json['hits'],
    };
}

export function QueryApiResponseToJSON(value?: QueryApiResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'total': value.total,
        'hits': value.hits,
    };
}


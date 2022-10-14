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
import type { SortInstruction } from './SortInstruction';
import {
    SortInstructionFromJSON,
    SortInstructionFromJSONTyped,
    SortInstructionToJSON,
} from './SortInstruction';

/**
 * 
 * @export
 * @interface QueryApiRequest
 */
export interface QueryApiRequest {
    /**
     * 
     * @type {string}
     * @memberof QueryApiRequest
     */
    find: string;
    /**
     * 
     * @type {string}
     * @memberof QueryApiRequest
     */
    where: string;
    /**
     * 
     * @type {string}
     * @memberof QueryApiRequest
     */
    pull: string;
    /**
     * 
     * @type {number}
     * @memberof QueryApiRequest
     */
    from: number;
    /**
     * 
     * @type {number}
     * @memberof QueryApiRequest
     */
    size?: number;
    /**
     * 
     * @type {Array<SortInstruction>}
     * @memberof QueryApiRequest
     */
    sortInstructions?: Array<SortInstruction>;
}

/**
 * Check if a given object implements the QueryApiRequest interface.
 */
export function instanceOfQueryApiRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "find" in value;
    isInstance = isInstance && "where" in value;
    isInstance = isInstance && "pull" in value;
    isInstance = isInstance && "from" in value;

    return isInstance;
}

export function QueryApiRequestFromJSON(json: any): QueryApiRequest {
    return QueryApiRequestFromJSONTyped(json, false);
}

export function QueryApiRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): QueryApiRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'find': json['find'],
        'where': json['where'],
        'pull': json['pull'],
        'from': json['from'],
        'size': !exists(json, 'size') ? undefined : json['size'],
        'sortInstructions': !exists(json, 'sortInstructions') ? undefined : ((json['sortInstructions'] as Array<any>).map(SortInstructionFromJSON)),
    };
}

export function QueryApiRequestToJSON(value?: QueryApiRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'find': value.find,
        'where': value.where,
        'pull': value.pull,
        'from': value.from,
        'size': value.size,
        'sortInstructions': value.sortInstructions === undefined ? undefined : ((value.sortInstructions as Array<any>).map(SortInstructionToJSON)),
    };
}


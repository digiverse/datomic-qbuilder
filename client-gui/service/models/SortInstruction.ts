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
 * @interface SortInstruction
 */
export interface SortInstruction {
    /**
     * 
     * @type {string}
     * @memberof SortInstruction
     */
    sortExpression: string;
    /**
     * 
     * @type {string}
     * @memberof SortInstruction
     */
    sortOrder: string;
}

/**
 * Check if a given object implements the SortInstruction interface.
 */
export function instanceOfSortInstruction(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "sortExpression" in value;
    isInstance = isInstance && "sortOrder" in value;

    return isInstance;
}

export function SortInstructionFromJSON(json: any): SortInstruction {
    return SortInstructionFromJSONTyped(json, false);
}

export function SortInstructionFromJSONTyped(json: any, ignoreDiscriminator: boolean): SortInstruction {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'sortExpression': json['sortExpression'],
        'sortOrder': json['sortOrder'],
    };
}

export function SortInstructionToJSON(value?: SortInstruction | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'sortExpression': value.sortExpression,
        'sortOrder': value.sortOrder,
    };
}


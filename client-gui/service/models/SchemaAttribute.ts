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
 * @interface SchemaAttribute
 */
export interface SchemaAttribute {
    /**
     * 
     * @type {string}
     * @memberof SchemaAttribute
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof SchemaAttribute
     */
    type: string;
    /**
     * 
     * @type {Set<string>}
     * @memberof SchemaAttribute
     */
    entity?: Set<string>;
    /**
     * 
     * @type {string}
     * @memberof SchemaAttribute
     */
    _enum?: string;
    /**
     * 
     * @type {object}
     * @memberof SchemaAttribute
     */
    cardinality: object;
    /**
     * 
     * @type {object}
     * @memberof SchemaAttribute
     */
    unique?: object;
    /**
     * 
     * @type {boolean}
     * @memberof SchemaAttribute
     */
    index?: boolean;
    /**
     * 
     * @type {string}
     * @memberof SchemaAttribute
     */
    doc?: string;
}

/**
 * Check if a given object implements the SchemaAttribute interface.
 */
export function instanceOfSchemaAttribute(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "type" in value;
    isInstance = isInstance && "cardinality" in value;

    return isInstance;
}

export function SchemaAttributeFromJSON(json: any): SchemaAttribute {
    return SchemaAttributeFromJSONTyped(json, false);
}

export function SchemaAttributeFromJSONTyped(json: any, ignoreDiscriminator: boolean): SchemaAttribute {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': json['name'],
        'type': json['type'],
        'entity': !exists(json, 'entity') ? undefined : json['entity'],
        '_enum': !exists(json, 'enum') ? undefined : json['enum'],
        'cardinality': json['cardinality'],
        'unique': !exists(json, 'unique') ? undefined : json['unique'],
        'index': !exists(json, 'index') ? undefined : json['index'],
        'doc': !exists(json, 'doc') ? undefined : json['doc'],
    };
}

export function SchemaAttributeToJSON(value?: SchemaAttribute | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'type': value.type,
        'entity': value.entity,
        'enum': value._enum,
        'cardinality': value.cardinality,
        'unique': value.unique,
        'index': value.index,
        'doc': value.doc,
    };
}


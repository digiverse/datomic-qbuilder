export interface EAVT {
    /**
     * 
     * @type {string}
     * @memberof EAVT
     */
    e: string;
    /**
     * 
     * @type {string}
     * @memberof EAVT
     */
    a: string;
    /**
     * 
     * @type {object}
     * @memberof EAVT
     */
    v: object | string | number | boolean | null;
    /**
     * 
     * @type {string}
     * @memberof EAVT
     */
    t: string | null;
}

/**
 * Check if a given object implements the EAVT interface.
 */
export function instanceOfEAVT(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "e" in value;
    isInstance = isInstance && "a" in value;
    isInstance = isInstance && "v" in value;
    isInstance = isInstance && "t" in value;

    return isInstance;
}

export function EAVTFromJSON(json: any): EAVT {
    return EAVTFromJSONTyped(json, false);
}

export function EAVTFromJSONTyped(json: any, ignoreDiscriminator: boolean): EAVT {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'e': json['e'],
        'a': json['a'],
        'v': json['v'],
        't': json['t'],
    };
}

export function EAVTToJSON(value?: EAVT | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'e': value.e,
        'a': value.a,
        'v': value.v,
        't': value.t,
    };
}


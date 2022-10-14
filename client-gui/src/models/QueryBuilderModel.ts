import type {EAVT} from "@/models/EAVT";

export interface QueryBuilderModel {
    /**
     * 
     * @type {Array<object>}
     * @memberof QueryBuilderModel
     */
    find: Array<string>;
    /**
     * 
     * @type {Array<object>}
     * @memberof QueryBuilderModel
     */
    where: Array<EAVT | string>;
    /**
     * 
     * @type {Array<object>}
     * @memberof QueryBuilderModel
     */
    pull: Array<string>;
}
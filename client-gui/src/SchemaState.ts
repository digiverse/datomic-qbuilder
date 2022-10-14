import {reactive, toRefs, computed} from 'vue'
import {DatabaseSchemaApi} from '../service/apis'
import openapi from '@/openapi'
import type {SchemaApiResponse} from "../service/models";

const state = reactive({
    schema: null as null | SchemaApiResponse,
    loading: false,
})

export default function useSchemaState() {
    const getSchema = async () => {
        const api = new DatabaseSchemaApi(openapi)
        state.loading = true
        try {
            state.schema = await api.apiSchemaGet()
        } finally {
            state.loading = false
        }
    }

    return {
        ...toRefs(state),
        getSchema: getSchema,
    }
}

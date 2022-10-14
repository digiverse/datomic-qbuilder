import {reactive, toRefs, computed, ref} from 'vue'
import openapi from '@/openapi'
import type {HitModel} from '@/models/HitModel'
import type QueryModel from "@/models/QueryModel";
import type {QueryBuilderModel} from "@/models/QueryBuilderModel";
import type {QueryApiResponse,} from "../service";
import {DatomicQueryApi} from "../service";

const DEFAULT_PAGE_SIZE = 10

const state = reactive({
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    queryModel: {
        find: '[]',
        where: '[]',
        pull: '[*]',
    } as QueryModel,
    builderModel: null as null | QueryBuilderModel,
    pullDisabled: false,
    results: null as null | QueryApiResponse,
    loading: false,
    displayHits: true,
    tab: 'source',
    queryName: "",
    saveDialog: ref(false),
    loadDialog: ref(false),
})

export default function useGlobalState() {
    const updateBuilderModel = async () => {
        const api = new DatomicQueryApi(openapi)
        state.loading = true
        try {
            state.builderModel = await api.apiQueryToBuilderModelPost({
                queryModel: {
                    find: state.queryModel.find === '[]' ? '[[?e ...]]' : state.queryModel.find,
                    where: state.queryModel.where === '[]' ? '[[?e]]' : state.queryModel.where,
                    pull: state.queryModel.pull,
                }
            }) as any
        } finally {
            state.loading = false
        }
    }
    const updateQueryModel = async () => {
        const api = new DatomicQueryApi(openapi)
        state.loading = true
        if (state.builderModel == null) {
            return null
        }
        try {
            const result = await api.apiQueryFromBuilderModelPost({
                queryBuilderModel: state.builderModel as any
            })
            state.queryModel.find = result.find
            state.queryModel.where = result.where
            state.queryModel.pull = result.pull
        } finally {
            state.loading = false
            state.displayHits = false
        }
    }
    const getResults = async () => {
        const api = new DatomicQueryApi(openapi)
        // send pull expression or just empty pull?
        const regex: RegExp = /\[\[.*\.\.\.]]/
        const find = state.queryModel.find
        const sendPull = regex.test(find)

        state.loading = true
        try {
            state.results = await api.apiQueryPost({
                queryApiRequest: {
                    find: state.queryModel.find,
                    where: state.queryModel.where,
                    pull: sendPull ? state.queryModel.pull : '[]',
                    from: (state.currentPage - 1) * state.pageSize,
                    size: state.pageSize,
                }
            })
        } finally {
            state.loading = false
            state.displayHits = true
        }
    }

    const loadQuery = async (name: string) => {
        const api = new DatomicQueryApi(openapi)
        state.loading = true
        try {
            state.queryModel = await api.apiQueryLoadNameGet({
                name: name
            })
            await updateBuilderModel()
        } finally {
            state.loading = false
        }
    }

    const saveQuery = async (name: string) => {
        const api = new DatomicQueryApi(openapi)
        state.loading = true
        try {
            await api.apiQuerySavePost({
                saveQueryModel: {
                    name: name,
                    find: state.queryModel.find,
                    where: state.queryModel.where,
                    pull: state.queryModel.pull,
                }
            })
        } finally {
            state.loading = false
        }
    }

    const hitsDisplayOff = () => {
        state.displayHits = false
    }

    const getResultsForPage = (page: number, size: number) => {
        state.currentPage = page
        state.pageSize = size
        return getResults()
    }

    return {
        ...toRefs(state),
        getResults,
        getResultsForPage,
        updateBuilderModel,
        updateQueryModel,
        saveQuery,
        loadQuery,
        resetPagination: () => {
            state.currentPage = 1
        },
        hitsDisplayOff,
        total: computed(() => {
            return state.results?.total || 0
        }),
        pagination: computed(() => {
            return {
                page: state.currentPage,
                rowsPerPage: state.pageSize,
                rowsNumber: state.results?.total || 0,
            }
        }),
        hits: computed(() => {
            let hits = state.results?.hits.map(v => v === null ? {"No Data": ""} : v);
            if (hits !== undefined && typeof hits[0] !== "object") {
                return hits.map(v => {
                    return {"Value": v}
                })
            } else {
                return hits as HitModel;
            }
        }),
        columns: computed(() => {
                const hits = state.results?.hits as HitModel

                if (hits?.length <= 0) {
                    return []
                }

                const firstHit = hits.find(v => v !== null)

                if (firstHit === undefined) {
                    return hits[0]?.map(v => {
                        return {
                            name: "No Data",
                            label: "No Data",
                            field: "No Data",
                            align: 'left',
                            sortable: false,
                        };
                    })
                } else if (typeof firstHit !== "object") {
                    const col = "Value"
                    return [{
                        name: col,
                        label: col,
                        field: col,
                        align: 'left',
                        sortable: false,
                    }];
                } else {
                    return Object.keys(firstHit as any).map((col) => {
                        return {
                            name: col,
                            label: col,
                            field: col,
                            align: 'left',
                            sortable: false,
                        };
                    })
                }
            }
        ),
        disablePull: computed(() => {
            const regex: RegExp = /\[\[.*\.\.\.]]/
            const find = state.queryModel.find
            return !regex.test(find)
        })
    }
}

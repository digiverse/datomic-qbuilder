<template>
  <query-editor v-model="queryModel"/>
  <div class="q-pa-md">
    <q-btn @click="execute" :disable="loading">Execute</q-btn>
    <q-btn v-if="results && !loading && displayHits" flat @click="goToResults">
      <q-icon name="chevron_right" color="black"/>
      {{ total }} hits
    </q-btn>
    <q-spinner v-if="loading"/>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import QueryEditor from '@/components/QueryEditor.vue'
import ResultsNestedTable from '@/components/ResultsNestedTable.vue'
import useGlobalState from '@/GlobalState'
import useErrorState from "@/ErrorState";

export default defineComponent({
  components: {ResultsNestedTable, QueryEditor},
  name: 'DatalogView',
  setup() {
    return {
      ...useGlobalState(),
      ...useErrorState()
    }
  },
  methods: {
    requestPagination(req: any) {
      this.getResultsForPage(req.pagination.page, req.pagination.rowsPerPage)
    },
    execute() {
      this.clearError()
      this.resetPagination()
      this.getResults()
    },
    goToResults() {
      this.tab = 'results'
    },
  },
  watch: {
    queryModel: [
      {
        handler: 'hitsDisplayOff',
      },
    ],
  },
})
</script>

<template>
  <q-table v-if="hits"
           dense
           :columns="columns"
           :rows="hits"
           v-model:pagination="pagination"
           @request="requestPagination">
    <template v-slot:body-cell="props">
      <q-td :props="props">
        <ResultsNestedTable v-if="Array.isArray(props.value)"
                            :hits="props.value"
                            :depth="1"/>
        <ResultsNestedTable v-else-if="props.value === Object(props.value)" :hits="[props.value]" :depth="depth + 1"/>
        <router-link v-else-if="props.col.name === ':db/id'" :to="`/entity/${props.value}`">
          {{ props.value }}
        </router-link>
        <router-link v-else-if="props.col.name.endsWith('/id')"
                     :to="`/entity/lookup/${encodeURIComponent(props.col.name)}/${props.value}`">
          {{ props.value }}
        </router-link>
        <span v-else>{{ props.value }}</span>
      </q-td>
    </template>
  </q-table>
  <div v-if="!results?.total" class="text-weight-thin">No results</div>

</template>
<script lang="ts">
import {defineComponent} from 'vue'
import QueryEditor from '@/components/QueryEditor.vue'
import ResultsNestedTable from '@/components/ResultsNestedTable.vue'
import useGlobalState from '@/GlobalState'

export default defineComponent({
  components: {ResultsNestedTable, QueryEditor},
  name: 'ResultsView',
  setup() {
    return {
      ...useGlobalState(),
    }
  },
  methods: {
    requestPagination(req: any) {
      this.getResultsForPage(req.pagination.page, req.pagination.rowsPerPage)
    },
    execute() {
      this.resetPagination()
      this.getResults()
    },
    goToResults() {
      this.tab = 'results'
    },
  },
})
</script>

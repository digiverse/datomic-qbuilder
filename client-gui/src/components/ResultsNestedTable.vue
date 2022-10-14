<template>
  <q-table v-if="hits" :columns="columns" :rows="hits" :hide-pagination="true">
    <template v-slot:body-cell="props">
      <q-td :props="props">
        <ResultsNestedTable v-if="Array.isArray(props.value)" :hits="props.value" :depth="depth + 1"/>
        <router-link v-else-if="props.col.name === 'db/id'" :to="`/entity/${props.value}`">
          {{ props.value }}
        </router-link>
        <span v-else>{{ props.value }}</span>
      </q-td>
    </template>
  </q-table>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import type {PropType} from 'vue'
import type {HitModel} from '@/models/HitModel'

export default defineComponent({
  name: 'ResultsNestedTable',
  props: {
    hits: {
      type: Object as PropType<HitModel> | undefined,
      default: undefined,
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    columns() {
      if (!this.hits || this.hits.length <= 0) {
        return []
      }

      const firstHit = this.hits[0]
      return Object.keys(firstHit).map((col) => {
        return {
          name: col,
          label: col,
          field: col,
          align: 'left',
          sortable: false,
        }
      })
    },
  },
})
</script>

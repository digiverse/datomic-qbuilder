<template>
  <q-dialog persistent :model-value="true">
    <q-card>
      <q-card-section class="bg-primary text-white row items-center">
        <div class="q-pa-xs q-gutter-xs">
          <div class="text-h6">Entity Explorer</div>
          <q-breadcrumbs class="text-white" active-color="white">
            <q-breadcrumbs-el label="Back" @click="goBack" icon="undo" to="/"/>
            <q-breadcrumbs-el :label="entityId.toString()"/>
          </q-breadcrumbs>
          <q-space/>
        </div>

        <q-space/>
        <q-btn icon="close" flat round dense to="/" size="sm"/>
      </q-card-section>

      <q-card-section v-if="data && !loading" class="q-pb-none">
        <EntityTree :entity-props="data"/>
      </q-card-section>

      <q-spinner v-if="loading" color="primary" size="3em"/>
      <q-card-section></q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import {EntityExplorerApi} from '../../service'
import type EntityProps from '@/models/EntityProps'
import openapi from '@/openapi'
import EntityTree from '@/components/EntityTree.vue'

const api = new EntityExplorerApi(openapi)

export default defineComponent({
  name: 'EntityView',
  components: {EntityTree},
  data() {
    return {
      show: true,
      data: undefined as EntityProps | undefined,
      loading: false,
    }
  },
  mounted() {
    this.getData()
  },
  computed: {
    entityId() {
      return Number(this.$route.params.id)
    },
    lookupExpression() {
      if (this.$route.params.lookupAttr !== 'undefined') {
        return '[' + this.$route.params.lookupAttr + ' "' + this.$route.params.lookupVal + '"]'
      } else {
        return 'undefined'
      }
    },
    label() {
      if (this.$route.params.lookupAttr !== 'undefined') {
        return '[' + this.$route.params.lookupAttr + ' "' + this.$route.params.lookupVal + '"]'
      } else {
        return this.$route.params.id
      }
    },
  },
  methods: {
    async getData() {
      this.loading = true
      if (!isNaN(this.entityId)) {
        this.data = await api.apiEntityIdGet({
          id: this.entityId,
        })
      } else if (!this.lookupExpression.includes('undefined')) {
        this.data = await api.apiEntityLookupGet({
          lookupExpression: this.lookupExpression,
        })
      }
      this.loading = false
    },
    goBack() {
      window.history.back()
    },
  },
  watch: {
    entityId: [
      {
        handler: 'getData',
      },
    ],
    lookupExpression: [
      {
        handler: 'getData',
      },
    ],
  },
})
</script>

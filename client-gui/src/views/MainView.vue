<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="menu"/>
          QBuilder Client
        </q-toolbar-title>

        <q-btn @click="loadSavedQueries()">Load</q-btn>
        <q-dialog v-model="loadDialog" persistent>
          <q-card style="min-width: 350px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Load Query</div>
            </q-card-section>

            <q-card-section>
              <q-select :options="loadOptions"
                        @filter="(val, update) => loadFilter(val, update)"
                        v-model="queryName"
                        emit-value
                        use-input
                        fill-input
                        hide-selected
                        new-value-mode="add-unique"
                        dense class="q-ma-sm" outlined/>
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancel" v-close-popup/>
              <q-btn @click="loadQuery(queryName)" flat label="Load" v-close-popup/>
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-btn @click="saveDialog = true">Save</q-btn>
        <q-dialog v-model="saveDialog" persistent>
          <q-card style="min-width: 350px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Save Query</div>
            </q-card-section>

            <q-card-section>
              <q-input dense v-model="queryName" autofocus @keyup.enter="saveDialog = false"/>
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancel" v-close-popup/>
              <q-btn @click="saveQuery(queryName)" flat label="Save" v-close-popup/>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-toolbar>
    </q-header>

    <router-view></router-view>
    <q-page-container>
      <q-tabs v-model="tab" align="left">
        <q-tab name="source" label="Datalog Source"/>
        <q-tab name="builder" label="Datalog Builder"/>
        <q-tab name="results" label="Results"/>
        <q-tab name="schema" label="Schema Viewer"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="schema">
          TODO!
        </q-tab-panel>
        <q-tab-panel name="source">
          <DatalogView/>
        </q-tab-panel>
        <q-tab-panel name="builder">
          <DatalogBuilderView/>
        </q-tab-panel>
        <q-tab-panel name="results">
          <ResultsView/>
        </q-tab-panel>
      </q-tab-panels>
      <div class="q-pa-lg"></div>
    </q-page-container>

    <div v-if="error" class="q-pa-md fixed-bottom">
      <q-banner inline-actions rounded class="text-white bg-red">
        <div class="row items-center justify-between">Error: {{ error }}</div>
        <template v-slot:action>
          <q-btn @click="clearError" flat color="white">
            <q-icon name="cancel"/>
          </q-btn>
        </template>
      </q-banner>
    </div>
  </q-layout>
</template>
<script lang="ts">
import {defineComponent, ref} from 'vue'
import useErrorState from '@/ErrorState'
import DatalogView from "@/views/DatalogView.vue";
import DatalogBuilderView from "@/views/DatalogBuilderView.vue";
import ResultsView from "@/views/ResultsView.vue";
import useGlobalState from "@/GlobalState";
import openapi from "@/openapi";
import {DatomicQueryApi} from "../../service";

export default defineComponent({
  components: {ResultsView, DatalogBuilderView, DatalogView},
  name: 'MainView',
  setup() {
    return {
      ...useGlobalState(),
      ...useErrorState()
    }
  },
  data() {
    return {
      queries: undefined as undefined | string[],
      loadOptions: undefined as undefined | string[]
    }
  },
  methods: {
    async loadSavedQueries() {
      const api = new DatomicQueryApi(openapi)
      this.loadDialog = true
      this.loading = true
      try {
        this.queries = await api.apiQueryListGet()
      } finally {
        this.loading = false
      }
    },
    loadFilter(val: string, update: any) {
      if (val === '') {
        update(() => {
          this.loadOptions = this.queries
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.loadOptions = this.queries?.filter((v: string) => v.toLowerCase().indexOf(needle) > -1)
      })
    },
  }
})
</script>

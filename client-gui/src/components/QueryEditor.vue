<template>
  <div class="q-pa-md">
    <q-input v-model="find" label="Find Expression (use the [?e ...] form to enable pull)" filled autogrow spellcheck="false"/>
  </div>
  <div class="q-pa-md">
    <q-input v-model="where" label="Where Expressions" filled autogrow spellcheck="false"/>
  </div>
  <div class="q-pa-md">
    <q-input v-model="pull" label="Pull" filled autogrow spellcheck="false" :disable="this.disablePull"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import type {PropType} from 'vue'
import type QueryModel from "@/models/QueryModel";
import useGlobalState from "@/GlobalState";

export default defineComponent({
  name: 'QueryEditor',
  props: {
    modelValue: {
      type: Object as PropType<QueryModel>,
      required: true,
    },
  },
  setup() {
    return {
      ...useGlobalState(),
    }
  },
  computed: {
    find: {
      get: function () {
        return this.modelValue.find.slice(1,-1)
      },
      set: function (newValue: string) {
        this.$emit('update:modelValue', {...this.modelValue, find: "[" + newValue + "]"})
      },
    },
    where: {
      get: function () {
        return this.modelValue.where.slice(1,-1)
      },
      set: function (newValue: string) {
        this.$emit('update:modelValue', {...this.modelValue, where: "[" + newValue + "]"})
      },
    },
    pull: {
      get: function () {
        return this.modelValue.pull
      },
      set: function (newValue: string) {
        this.$emit('update:modelValue', {...this.modelValue, pull: newValue})
      },
    },
  },
})
</script>

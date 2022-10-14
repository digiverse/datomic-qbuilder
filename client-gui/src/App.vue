<template>
  <MainView />
</template>

<script lang="ts">
import MainView from './views/MainView.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'App',
  components: { MainView },
})
</script>

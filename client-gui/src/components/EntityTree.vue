<template>
  <div class="q-pa-none">
    <q-markup-table dense flat>
      <tbody v-for="prop in mapped" :key="prop.name">
      <tr v-if="!prop.isReverseAtt && !prop.isDbEntity">
        <td class="text-left">
          <div>
            <span class="q-pl-none text-weight-medium" data-test="name">:{{ prop.name }}</span>
          </div>
        </td>
        <td class="text-left text-weight-regular">
          <div data-test="value">
              <span v-if="prop.isDbEntity">
                <router-link :to="`/entity/${prop.value}`">{{ prop.value }}</router-link>
              </span>
            <span v-else-if="prop.isLookupEntity">
                <router-link :to="`/entityLookup/${encodeURIComponent(prop.name)}/${prop.value}`">
                {{ prop.value }}
                </router-link>
              </span>
            <q-list v-else-if="prop.isValueArray" class="text-left q-pa-none q-ma-none">
              <q-expansion-item
                dense
                popup
                expand-separator
                :label="`Items (${prop.value.length})`"
                class="no-padding">
                <q-separator/>
                <q-item dense v-for="item in prop.value" :key="JSON.stringify(item)">
                  <router-link v-if="item['db/id']" :to="`/entity/${item['db/id']}`">
                    {{ item['db/id'] }}
                  </router-link>
                  <span v-else>{{ item }}</span>
                  &nbsp;
                </q-item>
              </q-expansion-item>
            </q-list>
            <div v-else>{{ prop.value }}</div>
          </div>
        </td>
      </tr>
      </tbody>
    </q-markup-table>
    <q-separator v-if="Object.keys(reverseAttributes).length !== 0" class="q-mt-lg"/>
    <div v-if="Object.keys(reverseAttributes).length !== 0">
      <div class="text-subtitle2 q-mb-md">Reverse Attributes</div>
      <q-list v-for="(value, key) in reverseAttributes" :key="value">
        <q-expansion-item
          popup
          group="accordion"
          :label="`${key} (${value.length})`"
          icon="explore"
          expand-icon-class="text-white"
          header-class="bg-secondary text-white"
          class="no-padding">
          <q-separator/>
          <q-item dense v-for="item in value">
            <router-link :to="`/entity/${item}`" class="text-caption q-ma-xs">
              {{ item }}
            </router-link>
            &nbsp;
          </q-item>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import type {PropType} from 'vue'
import {defineComponent} from 'vue'
import type EntityProps from "@/models/EntityProps";
import type ReverseAttributes from "@/models/ReverseAttributes";

export default defineComponent({
  name: 'EntityTree',
  props: {
    entityProps: {
      type: Object as PropType<EntityProps>,
      required: true,
    },
  },
  computed: {
    reverseAttributes() {
      return this.entityProps['reverse-attributes'] as ReverseAttributes
    },
    mapped() {
      return Object.keys(this.entityProps).map((key) => {
        const value = this.entityProps[key]
        const isDbEntity = key === 'db/id'
        const isLookupEntity = key.endsWith('/id') && !isDbEntity
        const isReverseAtt = key === 'reverse-attributes'
        return {
          name: key,
          isDbEntity: key === 'db/id',
          isLookupEntity: isLookupEntity,
          isReverseAtt: isReverseAtt,
          isValueArray: Array.isArray(value),
          value: value,
        }
      })
    },
  },
})
</script>
<style scoped>
.entity-tree {
  font-size: 1.1rem;
}

.entity-tree:nth-child(odd) {
  background: rgb(240, 240, 240);
}

.margin-left {
  margin-left: 16px;
  margin-bottom: 8px;
}
</style>

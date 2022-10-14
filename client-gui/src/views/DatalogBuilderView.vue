<template>
  <q-badge class="q-ma-sm q-pa-sm" color="primary" multi-line>Where Builder</q-badge>
  <div class="row" v-if="builderModel" v-for="(eavt, index) in builderModel.where">
    <div class="col-9" v-if="typeof eavt === 'string'">
      <q-input
        @change="this.updateQueryModel"
        v-model="builderModel.where[index]"
        label-slot
        dense class="q-ma-sm" outlined>
        <template v-slot:label>function expression</template>
      </q-input>
    </div>
    <div class="col-3" v-if="typeof eavt === 'object'">
      <q-select :options="entityOptions"
                @filter="(val, update) => entityFilter(val, update, index)"
                v-model="builderModel.where[index].e"
                @update:model-value="updateModelValueEvent"
                emit-value
                use-input
                fill-input
                hide-selected
                new-value-mode="add-unique"
                input-debounce="0"
                dense class="q-ma-sm" outlined/>
    </div>
    <div class="col-3" v-if="typeof eavt === 'object'">
      <q-select :options="attributeOptions"
                @filter="(val, update) => attributeFilter(val, update, index)"
                v-model="builderModel.where[index].a"
                @update:model-value="updateModelValueEvent"
                emit-value
                use-input
                fill-input
                hide-selected
                new-value-mode="add-unique"
                dense class="q-ma-sm" outlined/>
    </div>
    <div class="col-3" v-if="typeof eavt === 'object'">
      <q-input
        v-if="getAttributeType(index) === 'string' && isValueALiteral(index)"
        prefix='"'
        suffix='"'
        @change="this.updateQueryModel"
        v-model="builderModel.where[index].v"
        label-slot
        dense class="q-ma-sm" outlined>
        <template v-slot:label>{{ getAttributeType(index) }}</template>
      </q-input>
      <q-input
        v-else-if="getAttributeType(index) === 'long' && isValueALiteral(index)"
        type="number"
        @change="this.updateQueryModel"
        v-model="builderModel.where[index].v"
        label-slot
        dense class="q-ma-sm" outlined>
        <template v-slot:label>{{ getAttributeType(index) }}</template>
      </q-input>
      <q-select
        v-else
        :options="entityOptions"
        @filter="(val, update) => valueFilter(val, update, index)"
        v-model="builderModel.where[index].v"
        @update:model-value="updateModelValueEvent"
        emit-value
        use-input
        fill-input
        hide-selected
        new-value-mode="add-unique"
        label-slot
        input-debounce="0"
        clearable
        dense class="q-ma-sm" outlined>
        <template v-slot:label>{{ getAttributeType(index) }}</template>
      </q-select>
    </div>
    <div class="col">
      <q-btn-group rounded class="q-ma-sm">
        <q-btn v-if="hasMoreThanOneWhere()" @click="removeWhere(index)" color="primary" icon="delete"/>
        <q-btn v-if="index !== 0" @click="moveWhere(index, true)" color="primary" icon="arrow_upward"/>
        <q-btn v-if="!isLastWhere(index)" @click="moveWhere(index, false)" color="primary" icon="arrow_downward"/>
        <q-btn v-if="isLastWhere(index)" @click="addWhere" color="primary" icon="add"/>
        <q-btn
          v-if="findReferencingAttributes(index)?.length > 0"
          color="primary"
          icon="add_link"
          label="Parent">
          <q-menu>
            <q-list v-for="v in findReferencingAttributes(index)">
              <q-item clickable v-close-popup @click="addParentWhere(v, builderModel.where[index].e)">
                <q-item-section>{{ v }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn
          v-if="findChildAttributes(index)?.length > 0"
          color="primary"
          icon="add_link"
          label="Child">
          <q-menu>
            <q-list v-for="v in findChildAttributes(index)">
              <q-item clickable v-close-popup @click="addChildWhere(v, index)">
                <q-item-section>{{ v }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-btn-group>
    </div>
  </div>
  <q-badge class="q-ma-sm q-pa-sm" color="primary" multi-line>Pull Entity</q-badge>
  <div class="row" v-if="builderModel">
    <q-input v-if="disablePull"
             v-model="builderModel.find"
             :disable="disablePull"
             dense class="q-ma-sm" outlined/>
    <q-select v-if="!disablePull"
              :options="this.getEntityOptions()"
              v-model="builderModel.find[0][0]"
              @update:model-value="updateQueryModel"
              dense class="q-ma-sm" outlined/>
  </div>
  <q-badge class="q-ma-sm q-pa-sm" color="primary" multi-line>Pull Builder</q-badge>
  <div class="row" v-if="this.hasNoPull()">
    <div class="col">
      <q-btn-group rounded class="q-ma-sm">
        <q-btn @click="addPull" :disable="this.disablePull" color="primary" icon="add"/>
      </q-btn-group>
    </div>
  </div>
  <div class="row" v-if="builderModel" v-for="(pull, index) in builderModel.pull">
    <div class="col-9">
      <q-select :options="pullOptions"
                @filter="(val, update) => pullFilter(val, update, index)"
                v-model="builderModel.pull[index]"
                @update:model-value="updateModelValueEvent"
                emit-value
                use-input
                fill-input
                hide-selected
                new-value-mode="add-unique"
                :disable="this.disablePull"
                dense class="q-ma-sm" outlined/>
    </div>
    <div class="col">
      <q-btn-group rounded class="q-ma-sm">
        <q-btn v-if="!hasNoPull()" @click="removePull(index)" :disable="this.disablePull" color="primary"
               icon="delete"/>
        <q-btn v-if="index !== 0" @click="movePull(index, true)" color="primary" icon="arrow_upward"/>
        <q-btn v-if="!isLastPull(index)" @click="movePull(index, false)" color="primary" icon="arrow_downward"/>
        <q-btn v-if="canAddPull(index)" @click="addPull" :disable="this.disablePull" color="primary" icon="add"/>
        <q-btn
          v-if="getPullAttributeReferenceAttributes(index)"
          color="primary"
          icon="data_object"
          label="Child">
          <q-menu>
            <q-list v-for="v in getPullAttributeReferenceAttributes(index)">
              <q-item clickable v-close-popup @click="addNestedPull(index, v, builderModel.pull[index])">
                <q-item-section>{{ v }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>

        </q-btn>
      </q-btn-group>
    </div>
  </div>
  <div class="q-ma-sm">
    <q-btn @click="execute" :disable="loading">Execute</q-btn>
    <q-btn v-if="results && !loading && displayHits" flat @click="goToResults">
      <q-icon name="chevron_right" color="black"/>
      {{ total }} hits
    </q-btn>
    <q-spinner v-if="loading"/>
  </div>
</template>
<script lang="ts">
import {defineComponent, ref} from 'vue'
import useGlobalState from '@/GlobalState'
import useSchemaState from "@/SchemaState";

export default defineComponent({
  components: {},
  name: 'DatalogBuilderView',
  setup() {
    return {
      ...useGlobalState(),
      ...useSchemaState(),
    }
  },
  beforeCreate() {
    this.updateBuilderModel()
    if (this.schema == null) {
      this.getSchema()
    }
  },
  data() {
    return {
      entityOptions: undefined as undefined | string[],
      attributeOptions: undefined as undefined | string[],
      pullOptions: undefined as undefined | string[]
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
    hasMoreThanOneWhere() {
      return this.builderModel?.where.length !== 1
    },
    isLastWhere(index: number) {
      if (this.builderModel) {
        return index == this.builderModel.where.length - 1
      }
    },
    addWhere() {
      const e = this.builderModel?.where[this.builderModel?.where.length - 1].e
      this.builderModel?.where.push({
        e: e ? e : "?e",
        a: "",
        v: null,
        t: null
      })
      this.updateQueryModel()
    },
    removeWhere(index: number) {
      this.builderModel?.where.splice(index, 1)
      this.updateQueryModel()
    },
    moveWhere(index: number, moveUp: boolean) {
      const toIndex: number = moveUp ? index - 1 : index + 1
      let where = this.builderModel?.where;
      if (where) {
        const element = where[index];
        where.splice(index, 1);
        where.splice(toIndex, 0, element);
        this.updateQueryModel()
      }
    },
    removePull(index: number) {
      this.builderModel?.pull.splice(index, 1)
      this.updateQueryModel()
    },
    getPullAttributeReferenceAttributes: function (index: number) {
      let attName = this.builderModel?.pull[index] as unknown as string
      if (attName.startsWith('{')) {
        const regex: RegExp = /{(:[\w/]*)/
        attName = attName.match(regex)[1]
      }
      const a = this.schema?.entities.reduce((acc: any, ent) => {
        const att = ent.attributes.find(v => v.name === attName)
        if (att) {
          acc = att
        }
        return acc
      }, null);
      const entityName = a?.entity
      if (a?.type === 'ref' && entityName) {
        const entity = this.schema?.entities.find(e => e.name == entityName); // entityName is an object, hence ==
        return entity?.attributes.map(v => v.name)
      }
    },
    addNestedPull(index: number, nestedAttribute: string, attribute: string) {
      if (this.builderModel?.pull) {
        const regex: RegExp = /{(:.*)\s\[(.*)]}/
        const match = attribute.match(regex)
        if (match) {
          const currAtt = match[1]
          const currNested = match[2].match(/(:[\w/]*)/g)
          if (currNested?.find(v => v === nestedAttribute)) {
            // already there...
            return
          }
          let nestedAttStr = currNested?.join(' ') + " " + nestedAttribute
          let finalPullExp = "{" + currAtt + " [" + nestedAttStr + "]}"
          this.builderModel.pull[index] = finalPullExp
        } else {
          this.builderModel.pull[index] = "{" + attribute + " [" + nestedAttribute + "]}"
        }
        this.updateQueryModel()
      }
    },
    findReferencingAttributes(index: number) {
      let whereExp = this.builderModel?.where[index];
      if (typeof whereExp === 'string') {
        return []
      }
      const entity = whereExp?.a.split('/', 1)[0]
      if (!entity) {
        return []
      }
      return this.schema?.entities.reduce((acc: any, ent) => {
        const att = ent.attributes.find(v => {
          if (v.entity) {
            return v.entity == entity;
          } else {
            return false
          }
        })
        if (att) {
          acc.push(att.name)
        }
        return acc
      }, [])
    },
    addParentWhere(value: string, entity: string | undefined) {
      const entityVar = value.split('/', 1)[0].replace(':', '?');
      // add parent entity where
      this.builderModel?.where.push({
        e: entityVar,
        a: value,
        v: entity != undefined ? entity : null,
        t: null
      })
      this.updateQueryModel();
    },
    addChildWhere(value: string, index: number) {
      const entityVar = value.split('/', 1)[0].replace(':', '?');
      const parentWhere = this.builderModel?.where?.at(index);
      const parentWhereValue = parentWhere?.v
      // add child entity where
      this.builderModel?.where.push({
        e: parentWhereValue ? parentWhereValue : entityVar,
        a: value,
        v: null,
        t: null
      })
      if (parentWhereValue === null || parentWhereValue === "") {
        parentWhere.v = entityVar
      }
      this.updateQueryModel();
    },
    findChildAttributes(index: number) {
      let whereExp = this.builderModel?.where[index];
      if (typeof whereExp === 'string') {
        return []
      }
      let attName = whereExp?.a;
      const entityName = attName?.split('/', 1)[0]
      if (!entityName) {
        return []
      }
      const attribute = this.schema
        ?.entities.find(e => e.name === entityName)
        ?.attributes.find(a => a.name === attName)
      if (!attribute?.entity) {
        return []
      }

      const entity = this.schema?.entities.find(e => e.name === entityName);
      // TODO: schema.entities.attributes.entity is a set in swagger, but it comes as an array
      // possible solution: don't use sets for swagger, check also other places in this file...
      let childEntityName = attribute.entity[0];
      const childEntity = this.schema?.entities.find(e => e.name === childEntityName)
      return childEntity?.attributes.map(a => a.name)
    },
    hasNoPull() {
      return this.builderModel?.pull.length === 0
    },
    canAddPull(index: number) {
      if (this.builderModel) {
        if (this.builderModel?.pull[index] === '*') {
          return false
        }
        return index === this.builderModel.pull.length - 1
      }
    },
    addPull() {
      if (this.hasNoPull()) {
        this.builderModel?.pull.push("*" as any);
      } else {
        this.builderModel?.pull.push("" as any);
      }
      this.updateQueryModel()
    },
    isLastPull(index: number) {
      if (this.builderModel) {
        return index === this.builderModel.pull.length - 1
      }
    },
    movePull(index: number, moveUp: boolean) {
      const toIndex: number = moveUp ? index - 1 : index + 1
      let pull = this.builderModel?.pull;
      if (pull) {
        const element = pull[index];
        pull.splice(index, 1);
        pull.splice(toIndex, 0, element);
        this.updateQueryModel()
      }
    },
    getEntityOptions() {
      return this.builderModel?.where.reduce((acc: string[], cur: any) => {
        // include all entities (E)
        if (!acc.includes(cur.e)) {
          acc.push(cur.e);
        }
        // include all values (V) that are also variables
        const v = cur.v?.toString()
        if (v?.startsWith("?") && !acc.includes(v)) {
          acc.push(v)
        }
        return acc;
      }, [])
    },
    getAttributeOptions(): string[] | undefined {
      return this.schema?.entities.flatMap(ent => {
        return ent.attributes.map(att => att.name)
      })
    },
    isValueALiteral(index: number) {
      const v = this.builderModel?.where[index].v as null | string
      return !(v === null || v.trim() === "" || v.startsWith('?'));
    },
    updateModelValueEvent(val: string) {
      this.updateQueryModel()
    },
    getAttributeType(index: number) {
      const att = this.builderModel?.where[index].a
      return this.schema
        ?.entities.find(v => att?.startsWith(v.name))
        ?.attributes.find(v => v.name === att)
        ?.type
    },
    entityFilter(val: string, update: any, index: number) {
      const entities = this.getEntityOptions()
      entities?.push('_')
      if (val === '') {
        update(() => {
          this.entityOptions = entities
        })
        return
      }

      update(
        () => {
          const needle = val.toLowerCase()
          this.entityOptions = entities?.filter((v: string) => v?.toLowerCase().indexOf(needle) > -1)
        },
        ref => {
          if (val !== '' && ref.options.length > 0) {
            ref.setOptionIndex(-1) // reset optionIndex in case there is something selected
            //ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
          }
        }
      )
    },
    getAttributeEntityName(index: number): string | undefined {
      const currEntity = this.builderModel?.where[index].e
      return this.builderModel?.where.find((v, idx) => {
        // only check previous clauses (not the current one...)
        if (idx < index)
          return v.e === currEntity
        else
          return false
      })?.a.split('/', 1)[0]
    },
    attributeFilter(val: string, update: any, index: number) {
      const entityName = this.getAttributeEntityName(index)
      const attributes = entityName === undefined ?
        this.getAttributeOptions()
        :
        this.getAttributeOptions()?.filter(v => v.startsWith(entityName))
      if (val === '') {
        update(() => {
          this.attributeOptions = attributes
        })
        return
      }

      update(
        () => {
          const needle = val.toLowerCase()
          this.attributeOptions = attributes?.filter((v: string) => v?.toLowerCase().indexOf(needle) > -1)
        },
      )

    },
    valueFilter(val: string, update: any, index: number) {
      const currAttribute = this.builderModel?.where[index].a
      const entityName = currAttribute?.split('/', 1)[0] as string
      const _enum = this.schema?.entities.find(v => v.name === entityName)
        ?.attributes.find(v => v.name === currAttribute)?._enum
      const entityOptions = this.getEntityOptions()
      const values = _enum === undefined ?
        entityOptions
        :
        this.schema?.enums.find(v => v.name === _enum)?.values
      if (val === '') {
        update(() => {
          this.entityOptions = values
        })
        return
      }

      update(
        () => {
          const needle = val.toLowerCase()
          this.entityOptions = values?.filter((v: string) => v?.toLowerCase().indexOf(needle) > -1)
        },
        ref => {
          if (val !== '' && ref.options.length > 0) {
            ref.setOptionIndex(-1) // reset optionIndex in case there is something selected
            // ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
          }
        }
      )
    },
    pullFilter(val: string, update: any, index: number) {
      const entity = this.builderModel?.find[0][0]
      const entityAtt = this.builderModel?.where.find(v => v.e === entity)?.a // E position
      const valueAtt = this.builderModel?.where.find(v => v.v === entity)?.a // V position
      // search by entity in E or V position
      const entityName = entityAtt ?
        entityAtt.split('/', 1)[0]
        :
        valueAtt?.split('/', 1)[0] as string | undefined
      const attributes = entityName === undefined ?
        this.getAttributeOptions()
        :
        this.getAttributeOptions()?.filter(v => v.startsWith(entityName))
      attributes?.push(':db/ident')
      if (index === 0) {
        attributes?.push('*')
      }
      if (val === '') {
        update(() => {
          this.pullOptions = attributes
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.pullOptions = attributes?.filter((v: string) => v.toLowerCase().indexOf(needle) > -1)
      })
    },
  },


})
</script>

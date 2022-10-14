import { test, expect } from 'vitest'
import { mountQuasar } from '../../../test/_utils'
import EntityTree from '../EntityTree.vue'

const mockedEntity = {
  ':reverse-attributes': {
    ':location/partOf': 776,
    ':encounter/locations': 522,
  },
  ':demographicsResource/versionId': '4',
  ':demographicsResource/lastUpdated': '2021-11-25T16:40:59.317+00:00',
  ':location/type': [':locationType/fa'],
  ':location/name': 'Musgrove park hospital',
  ':db/id': 17592186045437,
  ':location/status': ':locationStatus/active',
  ':entityType': ':location',
  ':location/id': '80027',
}

test('EntityTree', async () => {
  expect(EntityTree).toBeTruthy()

  // @ts-ignore
  const wrapper = mountQuasar(EntityTree, {
    props: {
      entities: mockedEntity,
    },
  })

  const inner = wrapper.findComponent(EntityTree)
  const rows = inner.findAll('.entity-tree.row')
  expect(rows.length).toBe(11)

  const IdName = rows[5].find('[data-test="name"]')
  const IdValue = rows[5].find('[data-test="value"]')
  expect(IdName?.text()).toBe(':db/id')
  expect(IdValue?.text()).toBe('17592186045437')
})

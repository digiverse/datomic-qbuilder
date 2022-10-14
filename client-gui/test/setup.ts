import { config } from '@vue/test-utils'
import { Quasar } from 'quasar'
import router from '@/router'

config.global.plugins.push([Quasar, {}])
config.global.plugins.push([router])

import { createApp } from 'vue'
import { Quasar } from 'quasar'
import quasarIconSet from 'quasar/icon-set/material-icons'

// icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import router from './router'

import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
  plugins: {},
  iconSet: quasarIconSet,
})

app.use(router)

app.mount('#app')

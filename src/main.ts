import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import boolAttr from './bool-attr'
import vClickOutside from 'v-click-outside'
import { setupGlobalFuncs } from './markdown-bridge'
import { mountMitt } from '@/onMount'

import('katex/dist/katex.css')

!(async () => {
  setupGlobalFuncs()

  const app = createApp(App)
  app.use(router)
  app.use(store.original)

  app.use(boolAttr)
  app.use(vClickOutside)

  app.mount('#app')

  if (process.env.NODE_ENV === 'development') {
    app.config.performance = true
  }

  mountMitt.emit('mount')
})()

import { createApp } from 'vue'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/atkinson-hyperlegible-next'
import './style.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')

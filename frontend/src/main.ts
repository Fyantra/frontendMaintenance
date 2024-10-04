// import './assets/main.css'

// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/simplebar.css'

//  Icons CSS
import './assets/css/feather.css'
import './assets/css/select2.css'
import './assets/css/dropzone.css'
import './assets/css/uppy.min.css'
import './assets/css/jquery.steps.css'
import './assets/css/jquery.timepicker.css'
import './assets/css/quill.snow.css'
import './assets/css/daterangepicker.css'
import './assets/css/dataTables.bootstrap4.css'

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

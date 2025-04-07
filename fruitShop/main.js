import App from './App'
import request from './utils/request'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  
  // 全局挂载request方法
  app.config.globalProperties.$request = request
  
  // 添加小程序特有的配置
  app.config.globalProperties.$platform = uni.getSystemInfoSync().platform
  
  return {
    app
  }
}
// #endif
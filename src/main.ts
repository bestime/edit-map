import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import dayjs from 'dayjs'
// element-plus的样式文件通过cdn引入就行，不需要导入
import ElementPlus from 'element-plus'

const buildTime = dayjs(window.viteBuildTime).format('YYYY-MM-DD HH:mm:ss')
console.log(`%c 项目打包时间：${buildTime}`, 'background:pink;color:black;padding: 4px 8px 4px 0;border-radius:4px;' )

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')





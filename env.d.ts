/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** vue-rotuer 的 baseUrl */
  readonly VITE_ROUTER_BASE: string
  /** 服务器01在本地开发时的代理名字 */
  readonly VITE_HOST_01_NAME: string
  
  /** vue-rotuer 路由模式 */
  readonly VITE_ROUTER_MODE: 'hash' | 'history'
}


declare global {
  /** 项目打包时间戳 */
  var viteBuildTime: string
}

// 为了保证可以声明 declare global
export default undefined;
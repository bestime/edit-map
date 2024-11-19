import { vitePluginHtmlTemplate, getManualChunks, getDevProxy } from '@bestime/utils_build'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
// 变量存放目录
const envDir = 'env'


function resolveNodePath (relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url))
}


// https://vitejs.dev/config/
export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, resolveNodePath(envDir))
  
  return {
    server: {
      port: 7400,
      strictPort: true,
      open: false,
      host: '0.0.0.0',
      proxy: getDevProxy([
        {
          name: env.VITE_HOST_01_NAME,
          target: env.VITE_HOST_01_TARGET,
        }
      ])
    },
    envDir,
    base: env.VITE_ROUTER_BASE,
    plugins: [
      vue(),
      vitePluginHtmlTemplate({
        // 可自行配置其他变量
        VITE_BUILD_TIME: new Date().getTime()
      })
    ],
    build: {
      assetsDir: 'packed', // 被打包后的资源放在此目录下
      rollupOptions: {
        output: {
          manualChunks: getManualChunks([
            ['lodash-es', '@element-plus/icons-vue'],
            ['dayjs', 'axios', 'vue-router'],
            ['vue'],
            ['element-plus']
          ])
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: { api: 'modern-compiler' },
      }
    },
    resolve: {
      alias: {
        '@': resolveNodePath('./src')
      }
    }
  }
})

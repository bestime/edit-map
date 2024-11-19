
# vite-vue3.5 空项目模板
项目导航:
1.  [构建命令](#构建命令)
2.  [项目配置](#项目配置)
3.  [自定义环境变量](#自定义环境变量)
4.  [注意事项](#注意事项)

## 项目配置
- 构建工具采用 vite
- 前端框架采用 vue3

## 构建命令
- `npm run dev` 开发模式
- `npm run build:hash` 发布模式（hash）
- `npm run build:history` 发布模式（history）

## 自定义环境变量
- VITE_ROUTER_MODE - 路由模式。支持 hash 和 history
- VITE_ROUTER_BASE - 项目baseUrl，会直接影响系统变量 BASE_URL
- VITE_HOST_01_NAME - 接口01代理：别名
- VITE_HOST_01_TARGET - 接口01代理：目标地址

## 注意事项
  - 不建议将图片、json、字体、svg等静态资源放在 `src/assets` 中，后期迭代不及时清理会导致项目越来越卡，请放在public中并创建一个目录比如`public/static`，减小部署倒服务器后url重名冲突的可能
  - 静态资源访问（不用像webpack那样麻烦，可直接 `/` 开头，指向 `public` 文件夹）
    - 标签中：`<img src="/static/images/leida02.png"/>`
    - css中：`background-image: url("/static/images/tobacco.png");`
  - 不要对标签使用全局样式，可以定义全局类名（.g_xxxx）作用到需要的标签上
  - 不要滥用 `全局变量`（如果用，请把名字取复杂一点）
  - 不要滥用 `订阅发布模式`（如果用，请把名字取复杂一点）
  - 不要滥用 `vuex` 或 `pinia`
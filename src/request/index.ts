import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { merge } from 'lodash-es'
const instence = axios.create({
  timeout: 60 * 1000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
  }
})

const routerMode = import.meta.env.VITE_ROUTER_MODE
const localHostPrefix = routerMode ==='hash' ? './' : import.meta.env.VITE_ROUTER_BASE

/** 不允许传 baseURL和 url */
export type IRquestBase = Omit<AxiosRequestConfig, 'url' | 'baseURL'>

const prefixMap = {
  '@host01': import.meta.env.VITE_HOST_01_NAME,
  '@local': localHostPrefix.replace(/\/$/, '')
};

console.log("prefixMap", prefixMap)
export interface RequestPagerResult<T> {
  code: number;
  message: string;
  data: {
    pageNum: number;
    pageTotal: number;
    data: T;
  };
}

/**
 * 请求接口的的入口函数。
 * 注：不建议在里面处理loading和弹窗等和业务相关的操作！可以吧不同的事件通过订阅模式通知出去
 * @param options 
 * @returns 
 */
async function request<T>(options: IRquestBase & {
  baseURL: keyof typeof prefixMap;
  url: string;
}) {
  return instence<T>(merge(options, {
    url: serverURL(options.baseURL, options.url),
    baseURL: '',
  }))
}

/**
 * 项目中的路径转换统一入口，用于处理不同环境变量下的url地址
 * @param prefix 
 * @param path 
 * @returns 
 */
export function serverURL(prefix: keyof typeof prefixMap, path: string) {
  if (!/^\//.test(path)) {
    throw {
      message: `必须以 "/" 开头："${path}"`,
    };
  }
  return prefixMap[prefix] + path;
}


/**
 * 请求前端本地文件数据
 * @param relativePath 
 * @returns 
 */
export async function requestLocalFile<T>(relativePath: string){
  return axios<T>({
    baseURL: '',
    url: serverURL('@local', relativePath)
  })
}

export default request
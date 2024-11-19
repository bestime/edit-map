import request from "@/request";
import type { IRquestBase } from '@/request'

export function apiTest (options?: IRquestBase) {
  return request<string>({
    baseURL: '@host01',
    url: '/s',
    ...options
  })
}
import { type FetchOptions } from 'ofetch'

export const $api = <T>(request: string, opts?: FetchOptions) => {
  const config = useRuntimeConfig()

  return $fetch<T>(request, {
    baseURL: config.public.apiBase as string,
    ...opts,

    onRequest({ options }) {
      const token = useCookie('auth_token')

      if (token.value) {
        options.headers = options.headers || {}
        options.headers.Authorization = `Bearer ${token.value}`
      }

      // CORREÇÃO 1: Usar import.meta.env.DEV
      if (import.meta.env.DEV) {
        console.log(`[API] ${options.method || 'GET'} request to ${request}`)
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        const token = useCookie('auth_token')
        token.value = null
        navigateTo('/login')
      }
    }
  // CORREÇÃO 2: Cast simples usando o tipo importado
  } as FetchOptions)
}
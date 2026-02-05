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
        ;(options.headers as Record<string, string>).Authorization = `Bearer ${token.value}`
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
  } as Parameters<typeof $fetch<T>>[1])
}

export function getChannelsFollowing() {
  return $api<{ id: number; name: string; is_live: boolean; slug?: string }[]>('/api/channels/following')
}

export function getChannelsLive() {
  return $api<{ id: number; name: string; is_live: boolean; slug?: string; title?: string; viewers?: number }[]>('/api/channels/live')
}

// --- Auth (POST sem token) ---

export interface SignupBody {
  name: string
  email: string
  password: string
}

export interface SigninBody {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  name?: string
  email?: string
  account_id?: string
}

export function signup(body: SignupBody) {
  return $api<AuthResponse>('/signup', { method: 'POST', body })
}

export function signin(body: SigninBody) {
  return $api<AuthResponse>('/signin', { method: 'POST', body })
}
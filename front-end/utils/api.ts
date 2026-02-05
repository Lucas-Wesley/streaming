import { type FetchOptions } from 'ofetch'

/** Dados do usuário logado salvos no cookie (sem stream_key). */
export interface AuthCookie {
  accessToken: string
  account_id: string
  email: string
  name: string
}

export const $api = <T>(request: string, opts?: FetchOptions) => {
  const config = useRuntimeConfig()
  const auth = useCookie<AuthCookie | null>('auth')

  return $fetch<T>(request, {
    baseURL: config.public.apiBase as string,
    ...opts,

    onRequest({ options }) {
      const token = auth.value?.accessToken
      if (token) {
        options.headers = options.headers || {}
        ;(options.headers as Record<string, string>).Authorization = `Bearer ${token}`
      }

      if (import.meta.dev) {
        const method = (options.method as string) || 'GET'
        const url = `${config.public.apiBase}${request}`
        const onde = import.meta.server ? 'SSR' : 'browser'
        console.log(`[API ${onde}]`, method, url)
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        auth.value = null
        navigateTo('/login')
      }
    }
  } as Parameters<typeof $fetch<T>>[1])
}

/** Resposta das APIs de canais: { channels: [] } */
export interface ChannelsResponse {
  channels: { id: number; name: string; is_live: boolean; slug?: string; title?: string; viewers?: number }[]
}

export function getChannelsFollowing() {
  return $api<ChannelsResponse>('/api/channels/following').then((res) => res?.channels ?? [])
}

export function getChannelsLive() {
  return $api<ChannelsResponse>('/api/channels/live').then((res) => res?.channels ?? [])
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
  account_id: string
  email: string
  name: string
  stream_key?: string
}

export function signup(body: SignupBody) {
  return $api<AuthResponse>('/signup', { method: 'POST', body })
}

export function signin(body: SigninBody) {
  return $api<AuthResponse>('/signin', { method: 'POST', body })
}

// --- Conta do usuário (requer token) ---

export interface Account {
  account_id: string
  name: string
  email: string
  stream_key?: string
}

/** Busca a conta do usuário. Passar o token garante o envio do Authorization (ex.: em SSR). */
export function getAccount(accountId: string, accessToken?: string | null) {
  const opts = accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } as Record<string, string> }
    : undefined
  return $api<Account>(`/accounts/${accountId}`, opts)
}
import { type FetchOptions } from 'ofetch'
import { getCurrentToken, clearCurrentAuth } from './authCookie'

export const $api = <T>(request: string, opts?: FetchOptions) => {
  const config = useRuntimeConfig()

  return $fetch<T>(request, {
    baseURL: config.public.apiBase as string,
    ...opts,

    onRequest({ options }) {
      const token = getCurrentToken()
      if (token) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
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
        clearCurrentAuth()
        if (import.meta.client) navigateTo('/login')
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

// --- Streams (requer token) ---

export interface Stream {
  stream_id: string
  account_id: string
  title: string
  stream_key: string
  is_online: boolean
  created_at?: string
}

export interface CreateStreamBody {
  account_id: string
  title: string
  stream_key: string
}

export function createStream(data: CreateStreamBody) {
  return $api<Stream>('/stream', { method: 'POST', body: data })
}

export function getStreamById(streamId: string) {
  return $api<Stream>(`/stream/id/${streamId}`)
}

export function listStreamsByAccount(accountId: string) {
  return $api<Stream[]>(`/stream/account/${accountId}`)
}

export function endStream(streamId: string) {
  return $api<Stream>(`/stream/${streamId}/end`, { method: 'PUT' })
}
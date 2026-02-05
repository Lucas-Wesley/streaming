/**
 * Cookie de autenticação: chave auth_{account_id} com payload da conta.
 * auth_current guarda o account_id da conta atual.
 */

const COOKIE_CURRENT = 'auth_current'
const COOKIE_PREFIX = 'auth_'

export interface AuthPayload {
  account_id: string
  accessToken: string
  email: string
  name: string
  stream_key?: string
}

function cookieName(accountId: string) {
  return `${COOKIE_PREFIX}${accountId}`
}

/** Lê o payload do cookie auth_{account_id} (apenas no cliente). */
export function getPayloadFromCookie(accountId: string): AuthPayload | null {
  if (import.meta.server || !accountId || typeof document === 'undefined') return null
  const name = cookieName(accountId)
  const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'))
  const raw = match ? decodeURIComponent(match[1]) : null
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthPayload
  } catch {
    return null
  }
}

/** Escreve o cookie auth_{account_id}. */
export function setPayloadCookie(accountId: string, payload: AuthPayload) {
  if (import.meta.server || typeof document === 'undefined') return
  const name = cookieName(accountId)
  const value = encodeURIComponent(JSON.stringify(payload))
  const maxAge = 60 * 60 * 24 * 7 // 7 dias
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/** Remove o cookie auth_{account_id}. */
export function clearPayloadCookie(accountId: string) {
  if (import.meta.server || typeof document === 'undefined' || !accountId) return
  document.cookie = `${cookieName(accountId)}=; path=/; max-age=0`
}

const authCurrentRef = () => useCookie<string | null>(COOKIE_CURRENT, { default: () => null })

/** Retorna o token da conta atual (para uso em api.ts). */
export function getCurrentToken(): string | null {
  const id = authCurrentRef().value
  if (!id) return null
  return getPayloadFromCookie(id)?.accessToken ?? null
}

/** Limpa a conta atual (auth_current e cookie auth_{account_id}). */
export function clearCurrentAuth() {
  const authCurrent = authCurrentRef()
  const id = authCurrent.value
  if (id) clearPayloadCookie(id)
  authCurrent.value = null
}

export { COOKIE_CURRENT }

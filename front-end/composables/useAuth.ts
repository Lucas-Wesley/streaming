import type { Account } from '../utils/api'
import { getAccount } from '../utils/api'
import {
  COOKIE_CURRENT,
  getPayloadFromCookie,
  setPayloadCookie,
  clearPayloadCookie,
  clearCurrentAuth,
  type AuthPayload
} from '../utils/authCookie'

export type { AuthPayload }

/**
 * Composable de autenticação.
 * - auth_current: cookie com o account_id da conta atual.
 * - auth_{account_id}: cookie com o payload (accessToken, email, name, stream_key).
 * ensureAccount(): retorna a conta do cookie ou da API e atualiza o cookie.
 */
export function useAuth() {
  const authCurrent = useCookie<string | null>(COOKIE_CURRENT, { default: () => null })

  const accountFromCookie = computed<AuthPayload | null>(() => {
    const id = authCurrent.value
    if (!id) return null
    if (import.meta.server) return null
    return getPayloadFromCookie(id)
  })

  function setAuth(data: AuthPayload) {
    authCurrent.value = data.account_id
    if (import.meta.client) {
      setPayloadCookie(data.account_id, data)
    }
  }

  function clearAuth() {
    clearCurrentAuth()
  }

  /**
   * Recupera a conta: primeiro do cookie auth_{account_id}; se não tiver stream_key, busca da API e atualiza o cookie.
   */
  async function ensureAccount(): Promise<Account | null> {
    const id = authCurrent.value
    if (!id) return null
    const payload = import.meta.client ? getPayloadFromCookie(id) : null
    const token = payload?.accessToken
    if (!token && import.meta.server) return null
    if (payload?.stream_key) {
      return {
        account_id: payload.account_id,
        name: payload.name,
        email: payload.email,
        stream_key: payload.stream_key
      }
    }
    try {
      const account = await getAccount(id, token ?? undefined)
      if (import.meta.client && account && payload) {
        setPayloadCookie(id, { ...payload, stream_key: account.stream_key })
      }
      return account
    } catch {
      return null
    }
  }

  return {
    authCurrent,
    accountFromCookie,
    setAuth,
    clearAuth,
    ensureAccount,
    getPayloadFromCookie
  }
}

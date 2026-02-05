<template>
  <div class="min-h-[calc(100vh-3.5rem)] p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-[var(--twitch-text)] mb-6">Configurações do canal</h1>

      <div class="bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-6">
        <label class="block text-sm font-medium text-[var(--twitch-muted)] mb-2">
          Stream key (use no OBS)
        </label>
        <div class="flex gap-3 items-center flex-wrap">
          <div
            class="flex-1 min-w-[200px] px-4 py-3 rounded bg-[var(--twitch-bg)] border border-[var(--twitch-border)] font-mono text-[var(--twitch-text)] tracking-widest"
          >
            {{ streamKeyMasked }}
          </div>
          <button
            type="button"
            class="px-4 py-3 rounded font-semibold bg-[var(--twitch-purple)] text-white hover:bg-[#772ce8] transition-colors shrink-0"
            :disabled="!account?.stream_key || copied"
            @click="copyStreamKey"
          >
            {{ copied ? 'Copiado!' : 'Copiar chave' }}
          </button>
        </div>
        <p class="mt-2 text-sm text-[var(--twitch-muted)]">
          Cole esta chave no OBS em Configurações → Transmissão → Chave de transmissão.
        </p>
      </div>

      <div
        v-if="account?.stream_key"
        class="mt-6 bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-6"
      >
        <label class="block text-sm font-medium text-[var(--twitch-muted)] mb-2">
          Transmissão
        </label>
        <button
          type="button"
          class="px-4 py-3 rounded font-semibold bg-[var(--twitch-purple)] text-white hover:bg-[#772ce8] transition-colors"
          @click="goToLive"
        >
          Iniciar Live
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Account } from '../../../utils/api'
import { useAuth } from '../../../composables/useAuth'

definePageMeta({ layout: 'default' })

const { authCurrent, ensureAccount, clearAuth } = useAuth()

const account = ref<Account | null>(null)

onMounted(async () => {
  if (import.meta.client) {
    if (!authCurrent.value) {
      navigateTo('/login')
      return
    }
    account.value = await ensureAccount()
    if (!account.value) {
      clearAuth()
      navigateTo('/login')
    }
  }
})

const streamKeyMasked = computed(() => {
  const key = account.value?.stream_key
  if (!key) return '• • • • • • • • • • • • • • • •'
  return '• • • • • • • • • • • • • • • •'
})

const copied = ref(false)

async function copyStreamKey() {
  const key = account.value?.stream_key
  if (!key) return
  try {
    await navigator.clipboard.writeText(key)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback para navegadores antigos, se precisar
  }
}

function goToLive() {
  const key = account.value?.stream_key
  if (!key) return
  if (import.meta.client) {
    sessionStorage.setItem('liveStreamKey', key)
  }
  navigateTo('/settings/live')
}
</script>

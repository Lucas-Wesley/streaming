<template>
  <div class="min-h-[calc(100vh-3.5rem)] p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-[var(--twitch-text)] mb-6">Configurações do canal</h1>

      <div
        v-if="onlineStream"
        class="mb-6 p-4 rounded-lg border border-[var(--twitch-purple)] bg-[var(--twitch-purple)]/10"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span class="font-medium text-[var(--twitch-text)]">Live ao vivo</span>
        </div>
        <NuxtLink
          :to="`/settings/stream/${onlineStream.stream_id}`"
          class="text-[var(--twitch-purple)] hover:underline font-medium"
        >
          {{ onlineStream.title || 'Sem título' }} →
        </NuxtLink>
      </div>

      <div class="bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-6">
        <label class="block text-sm font-medium text-[var(--twitch-muted)] mb-2">
          Nova live
        </label>
        <div class="space-y-4">
          <input
            v-model="liveTitle"
            type="text"
            placeholder="Ex: Jogando com a galera"
            class="w-full px-4 py-3 rounded bg-[var(--twitch-bg)] border border-[var(--twitch-border)] text-[var(--twitch-text)] placeholder-[var(--twitch-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)]"
          />
          <button
            type="button"
            class="px-4 py-3 rounded font-semibold bg-[var(--twitch-purple)] text-white hover:bg-[#772ce8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canCreateLive || creating"
            @click="createLive"
          >
            {{ creating ? 'Criando...' : 'Iniciar Live' }}
          </button>
        </div>
        <p v-if="onlineStream" class="mt-2 text-sm text-[var(--twitch-muted)]">
          Encerre a live atual antes de iniciar outra.
        </p>
      </div>

      <div class="mt-6">
        <h2 class="text-lg font-semibold text-[var(--twitch-text)] mb-4">Suas lives</h2>
        <div v-if="loading" class="text-[var(--twitch-muted)]">Carregando...</div>
        <div v-else-if="!streams.length" class="text-[var(--twitch-muted)] py-4">
          Nenhuma live ainda.
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="s in streams"
            :key="s.stream_id"
            class="bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-4 flex items-center justify-between gap-4"
          >
            <div class="flex-1 min-w-0">
              <NuxtLink
                :to="`/settings/stream/${s.stream_id}`"
                class="font-medium text-[var(--twitch-text)] hover:text-[var(--twitch-purple)] truncate block"
              >
                {{ s.title || 'Sem título' }}
              </NuxtLink>
              <p class="text-sm text-[var(--twitch-muted)] mt-0.5">
                {{ formatDate(s.created_at) }}
              </p>
            </div>
            <span
              :class="[
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium shrink-0',
                s.is_online
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-[var(--twitch-muted)]/20 text-[var(--twitch-muted)]'
              ]"
            >
              {{ s.is_online ? 'Online' : 'Offline' }}
            </span>
            <NuxtLink
              :to="`/settings/stream/${s.stream_id}`"
              class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--twitch-bg)] text-[var(--twitch-text)] hover:bg-[var(--twitch-border)] shrink-0"
            >
              Ver
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Account, Stream } from '../../../utils/api'
import { createStream, listStreamsByAccount } from '../../../utils/api'
import { useAuth } from '../../../composables/useAuth'

definePageMeta({ layout: 'default' })

const { authCurrent, ensureAccount, clearAuth } = useAuth()

const account = ref<Account | null>(null)
const streams = ref<Stream[]>([])
const loading = ref(true)
const liveTitle = ref('')
const creating = ref(false)

const onlineStream = computed(() =>
  streams.value.find(s => s.is_online) ?? null
)

const canCreateLive = computed(() => {
  if (!account.value?.stream_key) return false
  if (onlineStream.value) return false
  return true
})

function formatDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadStreams() {
  const id = account.value?.account_id
  if (!id) return
  try {
    streams.value = await listStreamsByAccount(id)
  } catch {
    streams.value = []
  }
}

async function createLive() {
  if (!account.value?.account_id || !account.value?.stream_key || onlineStream.value) return
  creating.value = true
  try {
    const created = await createStream({
      account_id: account.value.account_id,
      title: liveTitle.value || 'Live',
      stream_key: account.value.stream_key
    })
    liveTitle.value = ''
    await loadStreams()
    await navigateTo(`/settings/stream/${created.stream_id}`)
  } catch (e: any) {
    alert(e?.data?.error ?? e?.message ?? 'Erro ao criar live')
  } finally {
    creating.value = false
  }
}

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
      return
    }
    loading.value = true
    await loadStreams()
    loading.value = false
  }
})
</script>

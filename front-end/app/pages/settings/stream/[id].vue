<template>
  <div class="min-h-[calc(100vh-3.5rem)] p-6">
    <div class="max-w-2xl mx-auto">
      <div v-if="loading" class="text-[var(--twitch-muted)]">Carregando...</div>
      <div v-else-if="error" class="text-red-400">{{ error }}</div>
      <template v-else-if="stream">
        <div class="flex items-center justify-between gap-4 mb-6">
          <h1 class="text-2xl font-bold text-[var(--twitch-text)] truncate">
            {{ stream.title || 'Live' }}
          </h1>
          <span
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shrink-0',
              stream.is_online
                ? 'bg-green-500/20 text-green-400'
                : 'bg-[var(--twitch-muted)]/20 text-[var(--twitch-muted)]'
            ]"
          >
            {{ stream.is_online ? 'Online' : 'Offline' }}
          </span>
        </div>

        <div class="bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-6 mb-6">
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
              :disabled="copied"
              @click="copyStreamKey"
            >
              {{ copied ? 'Copiado!' : 'Copiar chave' }}
            </button>
          </div>
        </div>

        <div class="bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-6 mb-6">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-[var(--twitch-text)]">Preview</h2>
            <button
              type="button"
              class="text-sm text-[var(--twitch-purple)] hover:text-[#772ce8] hover:underline"
              @click="reloadPreview"
            >
              Recarregar Player
            </button>
          </div>
          <div class="rounded overflow-hidden bg-black">
            <video
              ref="videoEl"
              controls
              autoplay
              muted
              class="w-full aspect-video"
            />
          </div>
          <p v-if="hlsError" class="mt-2 text-sm text-red-400">{{ hlsError }}</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            v-if="stream.is_online"
            type="button"
            class="px-4 py-3 rounded font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
            :disabled="ending"
            @click="endLive"
          >
            {{ ending ? 'Encerrando...' : 'Encerrar Live' }}
          </button>
          <button
            v-if="!stream.is_online && account"
            type="button"
            class="px-4 py-3 rounded font-semibold bg-[var(--twitch-purple)] text-white hover:bg-[#772ce8] transition-colors"
            :disabled="restarting"
            @click="restartLive"
          >
            {{ restarting ? 'Criando...' : 'Recomeçar Live' }}
          </button>
          <NuxtLink
            to="/settings"
            class="px-4 py-3 rounded font-semibold bg-[var(--twitch-bg)] text-[var(--twitch-text)] hover:bg-[var(--twitch-border)] transition-colors"
          >
            Voltar
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Hls from 'hls.js'
import type { Account, Stream } from '../../../../utils/api'
import { getStreamById, endStream, createStream } from '../../../../utils/api'
import { useAuth } from '../../../../composables/useAuth'

definePageMeta({ layout: 'default' })

const route = useRoute()
const config = useRuntimeConfig()
const hlsBase = config.public.hlsBase as string

const { authCurrent, ensureAccount, clearAuth } = useAuth()

const stream = ref<Stream | null>(null)
const account = ref<Account | null>(null)
const loading = ref(true)
const error = ref('')
const copied = ref(false)
const ending = ref(false)
const restarting = ref(false)
const videoEl = ref<HTMLVideoElement | null>(null)
const hlsError = ref('')
let hls: Hls | null = null

const streamKeyMasked = computed(() => '• • • • • • • • • • • • • • • •')

async function loadStream() {
  const id = route.params.id as string
  if (!id) return
  if (hls) {
    hls.destroy()
    hls = null
  }
  loading.value = true
  error.value = ''
  try {
    stream.value = await getStreamById(id)
    nextTick(() => initHls())
  } catch (e: any) {
    error.value = e?.data?.error ?? e?.message ?? 'Stream não encontrada'
    stream.value = null
  } finally {
    loading.value = false
  }
}

function initHls() {
  const video = videoEl.value
  const s = stream.value
  if (!video || !s?.stream_key) return

  const url = `${hlsBase}/hls/${s.stream_key}.m3u8`
  hlsError.value = ''

  if (Hls.isSupported()) {
    if (hls) {
      hls.destroy()
    }
    hls = new Hls()
    hls.loadSource(url)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {})
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        hlsError.value = 'Stream offline ou erro ao carregar. Verifique se está transmitindo no OBS.'
      }
    })
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    video.addEventListener('loadedmetadata', () => video.play())
  } else {
    hlsError.value = 'Seu navegador não suporta reprodução HLS.'
  }
}

function reloadPreview() {
  hlsError.value = ''
  initHls()
}

async function copyStreamKey() {
  const key = stream.value?.stream_key
  if (!key) return
  try {
    await navigator.clipboard.writeText(key)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback para navegadores antigos
  }
}

async function endLive() {
  if (!stream.value) return
  ending.value = true
  try {
    const updated = await endStream(stream.value.stream_id)
    stream.value = { ...stream.value, ...updated }
  } catch (e: any) {
    alert(e?.data?.error ?? e?.message ?? 'Erro ao encerrar')
  } finally {
    ending.value = false
  }
}

async function restartLive() {
  if (!stream.value || !account.value?.stream_key) return
  restarting.value = true
  try {
    const created = await createStream({
      account_id: account.value.account_id,
      title: stream.value.title,
      stream_key: account.value.stream_key
    })
    await navigateTo(`/settings/stream/${created.stream_id}`)
  } catch (e: any) {
    alert(e?.data?.error ?? e?.message ?? 'Erro ao recomeçar')
  } finally {
    restarting.value = false
  }
}

watch(() => route.params.id, loadStream, { immediate: true })

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

onBeforeUnmount(() => {
  if (hls) {
    hls.destroy()
    hls = null
  }
})
</script>

<template>
  <div class="min-h-[calc(100vh-3.5rem)] p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-[var(--twitch-text)] mb-6">Iniciar Live</h1>

      <div class="bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-[var(--twitch-muted)] mb-2">
            Título da live
          </label>
          <input
            v-model="liveTitle"
            type="text"
            placeholder="Ex: Jogando com a galera"
            class="w-full px-4 py-3 rounded bg-[var(--twitch-bg)] border border-[var(--twitch-border)] text-[var(--twitch-text)] placeholder-[var(--twitch-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)]"
          />
        </div>

        <button
          type="button"
          class="px-4 py-3 rounded font-semibold bg-[var(--twitch-purple)] text-white hover:bg-[#772ce8] transition-colors"
          @click="startPreview"
        >
          Iniciar Live
        </button>

        <section v-if="showPreview" class="pt-4 border-t border-[var(--twitch-border)]">
          <h2 class="text-lg font-semibold text-[var(--twitch-text)] mb-3">Preview</h2>
          <div class="rounded overflow-hidden bg-black">
            <video
              ref="videoEl"
              controls
              autoplay
              muted
              class="w-full aspect-video"
            />
          </div>
          <p v-if="errorMessage" class="mt-2 text-sm text-red-400">{{ errorMessage }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Hls from 'hls.js'

definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
const hlsBase = config.public.hlsBase as string

const streamKey = ref<string | null>(null)
const liveTitle = ref('')
const showPreview = ref(false)
const videoEl = ref<HTMLVideoElement | null>(null)
const errorMessage = ref('')
let hls: Hls | null = null

onMounted(() => {
  if (import.meta.client) {
    const key = sessionStorage.getItem('liveStreamKey')
    if (!key) {
      navigateTo('/settings')
      return
    }
    streamKey.value = key
  }
})

function startPreview() {
  showPreview.value = true
  errorMessage.value = ''
  nextTick(() => initHls())
}

function initHls() {
  const video = videoEl.value
  const key = streamKey.value
  if (!video || !key) return

  const url = `${hlsBase}/hls/${key}.m3u8`

  if (Hls.isSupported()) {
    hls = new Hls()
    hls.loadSource(url)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {})
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        errorMessage.value = 'Stream offline ou erro ao carregar. Verifique se está transmitindo no OBS.'
      }
    })
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    video.addEventListener('loadedmetadata', () => video.play())
  } else {
    errorMessage.value = 'Seu navegador não suporta reprodução HLS.'
  }
}

onBeforeUnmount(() => {
  if (hls) {
    hls.destroy()
    hls = null
  }
})
</script>

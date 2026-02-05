<template>
  <section>
    <h2 class="text-xl font-bold mb-4">Canais ao vivo</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <NuxtLink
        v-for="channel in channels"
        :key="channel.id"
        :to="`/${channel.slug ?? channel.id}`"
        class="group"
      >
        <div class="relative aspect-video rounded-lg overflow-hidden bg-[var(--twitch-card)]">
          <span class="absolute inset-0 flex items-center justify-center text-4xl text-[var(--twitch-muted)]">
            {{ channel.name.charAt(0) }}
          </span>
          <span
            class="absolute top-2 left-2 px-1.5 py-0.5 text-xs font-semibold bg-red-600 rounded flex items-center gap-1"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            AO VIVO
          </span>
          <span
            class="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs bg-black/70 rounded"
          >
            {{ channel.viewers ?? 0 }} espectadores
          </span>
        </div>
        <div class="flex gap-3 mt-2">
          <span class="w-8 h-8 rounded-full bg-[var(--twitch-card)] shrink-0 flex items-center justify-center text-sm font-bold text-[var(--twitch-purple)]">
            {{ channel.name.charAt(0) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold truncate group-hover:text-[var(--twitch-purple)]">
              {{ channel.name }}
            </p>
            <p class="text-sm text-[var(--twitch-muted)] truncate">
              {{ channel.title || 'Transmissão ao vivo' }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
    <p v-if="!channels.length" class="text-[var(--twitch-muted)] py-8">
      Nenhum canal ao vivo no momento.
    </p>
  </section>
</template>

<script setup lang="ts">
import { getChannelsLive } from '../../utils/api'

interface ChannelLive {
  id: number
  name: string
  slug?: string
  is_live: boolean
  title?: string
  viewers?: number
}

const { data: channels } = await useAsyncData<ChannelLive[]>(
  'channels-live',
  () => getChannelsLive() as Promise<ChannelLive[]>,
  { default: () => [] }
)
</script>

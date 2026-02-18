<template>
  <section>
    <h2 class="text-xl font-bold mb-4">Canais ao vivo</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <NuxtLink
        v-for="channel in channels"
        :key="channel.stream_id"
        :to="`/${channel.stream_id}`"
        class="group"
      >
        <div class="relative aspect-video rounded-lg overflow-hidden bg-[var(--twitch-card)]">
          <span class="absolute inset-0 flex items-center justify-center text-4xl text-[var(--twitch-muted)]">
            {{ (channel.title || 'L').charAt(0) }}
          </span>
          <span
            class="absolute top-2 left-2 px-1.5 py-0.5 text-xs font-semibold bg-red-600 rounded flex items-center gap-1"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            AO VIVO
          </span>
        </div>
        <div class="flex gap-3 mt-2">
          <span class="w-8 h-8 rounded-full bg-[var(--twitch-card)] shrink-0 flex items-center justify-center text-sm font-bold text-[var(--twitch-purple)]">
            {{ (channel.title || 'L').charAt(0) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold truncate group-hover:text-[var(--twitch-purple)]">
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
import { type ChannelItem, getChannelsLive } from '../../utils/api'

const { data: channels } = await useAsyncData<ChannelItem[]>(
  'channels-live',
  () => getChannelsLive(),
  { default: () => [] }
)
</script>

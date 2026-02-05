<template>
  <aside class="w-60 shrink-0 bg-[var(--twitch-sidebar)] border-r border-[var(--twitch-border)] overflow-y-auto">
    <div class="p-3">
      <h2 class="text-sm font-semibold text-[var(--twitch-muted)] uppercase tracking-wide px-2 mb-2">
        Canais seguidos
      </h2>
      <ul class="space-y-0.5">
        <li v-for="item in channels" :key="item.id">
          <NuxtLink
            :to="`/${item.slug ?? item.id}`"
            class="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/5 group"
          >
            <div class="relative shrink-0">
              <span
                class="block w-8 h-8 rounded-full bg-[var(--twitch-card)] overflow-hidden"
              >
                <span class="flex w-full h-full items-center justify-center text-sm font-bold text-[var(--twitch-purple)]">
                  {{ item.name.charAt(0) }}
                </span>
              </span>
              <span
                v-if="item.is_live"
                class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[var(--twitch-sidebar)]"
              />
            </div>
            <span class="truncate text-sm group-hover:text-[var(--twitch-purple)]">{{ item.name }}</span>
          </NuxtLink>
        </li>
      </ul>
      <p v-if="!channels.length" class="px-2 py-4 text-sm text-[var(--twitch-muted)]">
        Nenhum canal seguido.
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { getChannelsFollowing } from '../../utils/api'

interface Channel {
  id: number
  name: string
  slug?: string
  is_live: boolean
}

const { data: channels } = await useAsyncData<Channel[]>(
  'channels-following',
  () => getChannelsFollowing() as Promise<Channel[]>,
  { default: () => [] }
)
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[var(--twitch-bg)]">
    <header class="h-14 flex items-center px-4 bg-[var(--twitch-sidebar)] border-b border-[var(--twitch-border)] shrink-0">
      <NuxtLink to="/" class="text-2xl font-bold text-[var(--twitch-purple)] mr-8">Streaming</NuxtLink>
      <nav class="flex items-center gap-6 text-[var(--twitch-text)]">
        <NuxtLink to="/" class="font-semibold hover:text-[var(--twitch-purple)]">Seguindo</NuxtLink>
        <NuxtLink to="/" class="hover:text-[var(--twitch-purple)]">Descobrir</NuxtLink>
      </nav>
      <div class="ml-auto flex items-center gap-4">
        <template v-if="auth?.accessToken">
          <NuxtLink
            to="/settings"
            class="p-1.5 rounded text-[var(--twitch-muted)] hover:text-white hover:bg-white/5"
            title="Configurações do canal"
            aria-label="Configurações do canal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </NuxtLink>
          <button
            type="button"
            class="text-[var(--twitch-muted)] hover:text-white"
            @click="logout"
          >
            Sair
          </button>
        </template>
        <NuxtLink v-else to="/login" class="text-[var(--twitch-muted)] hover:text-white">Entrar</NuxtLink>
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
const auth = useCookie<{ accessToken: string; account_id: string; email: string; name: string } | null>('auth')

function logout() {
  auth.value = null
  navigateTo('/')
}
</script>

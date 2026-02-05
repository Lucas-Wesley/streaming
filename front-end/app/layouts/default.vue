<template>
  <div class="flex flex-col min-h-screen bg-[var(--twitch-bg)]">
    <header class="h-14 flex items-center px-4 bg-[var(--twitch-sidebar)] border-b border-[var(--twitch-border)] shrink-0">
      <NuxtLink to="/" class="text-2xl font-bold text-[var(--twitch-purple)] mr-8">Streaming</NuxtLink>
      <nav class="flex items-center gap-6 text-[var(--twitch-text)]">
        <NuxtLink to="/" class="font-semibold hover:text-[var(--twitch-purple)]">Seguindo</NuxtLink>
        <NuxtLink to="/" class="hover:text-[var(--twitch-purple)]">Descobrir</NuxtLink>
      </nav>
      <div class="ml-auto flex items-center gap-4">
        <template v-if="authToken">
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
const authToken = useCookie('auth_token')

function logout() {
  authToken.value = null
  navigateTo('/')
}
</script>

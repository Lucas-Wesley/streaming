<template>
  <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-[var(--twitch-card)] rounded-lg border border-[var(--twitch-border)] p-6">
        <h1 class="text-2xl font-bold text-center mb-6 text-[var(--twitch-text)]">
          {{ isSignup ? 'Criar conta' : 'Entrar' }}
        </h1>

        <div class="flex rounded-lg bg-[var(--twitch-sidebar)] p-1 mb-6">
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
            :class="!isSignup ? 'bg-[var(--twitch-card)] text-white' : 'text-[var(--twitch-muted)] hover:text-white'"
            @click="isSignup = false; errorMessage = ''"
          >
            Entrar
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
            :class="isSignup ? 'bg-[var(--twitch-card)] text-white' : 'text-[var(--twitch-muted)] hover:text-white'"
            @click="isSignup = true; errorMessage = ''"
          >
            Cadastrar
          </button>
        </div>

        <form @submit.prevent="submit" class="space-y-4">
          <div v-if="isSignup">
            <label for="name" class="block text-sm font-medium text-[var(--twitch-muted)] mb-1">Nome completo</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              placeholder="Nome e sobrenome"
              class="w-full px-4 py-2.5 rounded bg-[var(--twitch-bg)] border border-[var(--twitch-border)] text-[var(--twitch-text)] placeholder-[var(--twitch-muted)] focus:outline-none focus:border-[var(--twitch-purple)]"
            />
            <p class="mt-1 text-xs text-[var(--twitch-muted)]">Ex: Maria Silva</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-[var(--twitch-muted)] mb-1">E-mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="w-full px-4 py-2.5 rounded bg-[var(--twitch-bg)] border border-[var(--twitch-border)] text-[var(--twitch-text)] placeholder-[var(--twitch-muted)] focus:outline-none focus:border-[var(--twitch-purple)]"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-[var(--twitch-muted)] mb-1">Senha</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded bg-[var(--twitch-bg)] border border-[var(--twitch-border)] text-[var(--twitch-text)] placeholder-[var(--twitch-muted)] focus:outline-none focus:border-[var(--twitch-purple)]"
            />
            <p v-if="isSignup" class="mt-1 text-xs text-[var(--twitch-muted)]">
              Mín. 8 caracteres, uma maiúscula, uma minúscula e um número.
            </p>
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 rounded font-semibold bg-[var(--twitch-purple)] text-white hover:bg-[#772ce8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Aguarde...' : (isSignup ? 'Cadastrar' : 'Entrar') }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm text-[var(--twitch-muted)]">
          <NuxtLink to="/" class="hover:text-[var(--twitch-purple)]">Voltar ao início</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signin, signup } from '../../utils/api'

definePageMeta({ layout: 'default' })

const isSignup = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const auth = useCookie<{ accessToken: string; account_id: string; email: string; name: string } | null>('auth')

function setAuthCookie(data: { accessToken: string; account_id?: string; email?: string; name?: string }) {
  auth.value = {
    accessToken: data.accessToken,
    account_id: data.account_id ?? '',
    email: data.email ?? '',
    name: data.name ?? ''
  }
}

async function submit() {
  errorMessage.value = ''
  loading.value = true
  try {
    if (isSignup.value) {
      const data = await signup({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value
      })
      if (data?.accessToken) {
        setAuthCookie(data)
        await navigateTo('/')
      }
    } else {
      const data = await signin({
        email: email.value.trim(),
        password: password.value
      })
      if (data?.accessToken) {
        setAuthCookie(data)
        await navigateTo('/')
      }
    }
  } catch (e: any) {
    const data = e?.data
    errorMessage.value = data?.error ?? e?.message ?? 'Ocorreu um erro. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

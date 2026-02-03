<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Streaming</h1>

      <nav class="flex items-center gap-4">
        <ul class="flex items-center gap-4">
          <li>
            <NuxtLink to="/login">Login</NuxtLink>
          </li>
        </ul>
      </nav>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  
})
</script>

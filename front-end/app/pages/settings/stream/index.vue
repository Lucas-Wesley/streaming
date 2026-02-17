<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

onMounted(() => {
  if (import.meta.client) {
    navigateTo('/settings')
  }
})
</script>

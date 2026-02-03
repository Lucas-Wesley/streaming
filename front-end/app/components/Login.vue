<template>
  <form class="w-1/2">
    <h2 class="text-xl font-semibold mb-4">Login</h2>
    <div class="mb-4">
      <label class="block text-gray-700 font-bold mb-2" for="email">Email</label>
      <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight
      focus:outline-none focus:shadow-outline" v-model="form.email" id="email" type="email" placeholder="Email">
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 font-bold mb-2" for="password">Senha</label>
      <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight
      focus:outline-none focus:shadow-outline" v-model="form.password" id="password" type="password" placeholder="Password">
    </div>
    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Login</button>
  </form>
</template>

<script setup lang="ts">
const form = ref({
  email: '',
  password: ''
});

</script>
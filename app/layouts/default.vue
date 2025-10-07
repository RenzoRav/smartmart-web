<script setup>
</script>

<template>
  <div class="min-h-screen text-gray-800 bg-white">
    <div class="flex">
      <AppSidebar />
      <main class="flex-1 p-6 bg-white">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
html,
body {
  background-color: #fff;
  color: #222;
}
</style>

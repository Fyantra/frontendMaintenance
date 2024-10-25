<template>
  <span v-if="description">{{ description }}</span
  ><!-- N`affiche rien si... -->
  <span v-else></span>
</template>

<script setup lang="ts">
defineProps({
  description: {
    type: String,
    required: false,
  },
});
</script>

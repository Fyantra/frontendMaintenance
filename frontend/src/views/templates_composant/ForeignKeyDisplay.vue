<template>
    <span v-if="isDeleted || !description"></span><!-- N`affiche rien si... -->
    <span v-else>{{ description }}</span>
</template>

<script setup lang="ts">
defineProps({
  description: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
  },
});
</script>

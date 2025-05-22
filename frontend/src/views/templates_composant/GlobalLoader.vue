<template>
  <div v-if="loading" class="global-loader">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import { useLoadingStore } from "@/stores/loadingStore";
import { computed } from "vue";

const loadingStore = useLoadingStore();
const loading = computed(() => loadingStore.loading);
</script>

<style scoped>
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.807);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

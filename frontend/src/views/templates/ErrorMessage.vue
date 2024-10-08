<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

defineProps({
  errorMessage: {
    type: String,
    required: true,
  },
  error401Message: {
    type: String,
    required: false,
  },
  clearError: {
    type: Function,
    required: true,
  },
});

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<template>
  <div class="col-12 mb-4">
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <span class="fe fe-alert-triangle fe-16 mr-2"></span>
      Une erreur est survenue: "{{ errorMessage }}"
      <button
        v-if="error401Message"
        id="reconnect"
        type="button"
        class="btn btn-outline-warning btn-sm"
        @click="handleLogout"
      >
        Se reconnecter ici
      </button>
      <button type="button" class="close" @click="clearError" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>

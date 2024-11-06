<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";

const props = defineProps({
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

// Référence pour le message d'erreur
const errorRef = ref<HTMLElement | null>(null);

const clearErrorAfterDelay = () => {
  setTimeout(() => {
    props.clearError();
  }, 10000); // 10 secondes
};

// Exécuter au montage du composant
onMounted(() => {
  if (errorRef.value) {
    // Scroll jusqu'au message d'erreur
    errorRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest", // Positionne horizontalement de façon la plus proche
    });
  }

  if (!props.error401Message) {
    clearErrorAfterDelay();
  }
});

// Utiliser un watcher pour relancer le delai si le message change
watch(
  () => props.errorMessage,
  (newMessage) => {
    if (newMessage) {
      clearErrorAfterDelay();
    }
  }
);
</script>

<template>
  <div class="col-14 mb-4" ref="errorRef">
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

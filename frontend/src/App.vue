<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import SideBar from "./views/templates/SideBar.vue";
import { useAuthStore } from "@/stores/authStore";
import { computed, onMounted } from "vue";
import GlobalLoader from "./views/templates_composant/GlobalLoader.vue";

const userStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => !!userStore.accessToken);

// Vérifier l'authentification au moment du montage du composant
const publicRoutes = ["/login", "/inscription"];

onMounted(async () => {
  const tokenValid = await userStore.checkAuth();
  if (!tokenValid && !publicRoutes.includes(router.currentRoute.value.path)) {
    router.push("/login");
  }
});
</script>

<template>
  <div v-if="isAuthenticated">
    <SideBar />
    <div class="wrapper">
      <main role="main" class="main-content">
        <div class="container-fluid">
          <GlobalLoader />
          <RouterView />
        </div>
      </main>
    </div>
  </div>

  <div v-else>
    <RouterView />
  </div>
</template>

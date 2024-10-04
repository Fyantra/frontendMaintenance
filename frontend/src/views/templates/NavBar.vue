<script lang="ts">
import { defineComponent, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import ThemeSwitcher from "./ThemeSwitcher.vue";

export default defineComponent({
  name: "NavBar",
  components: {
    ThemeSwitcher,
  },

  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const user = computed(() => authStore.user);
    // console.log("Utilisateur connecté:", user.value);

    const toggleSidebar = () => {
      const body = document.body;

      if (body.classList.contains("collapsed")) {
        body.classList.remove("collapsed");
      } else {
        body.classList.add("collapsed");
      }
    };

    const handleLogout = () => {
      authStore.logout();
      router.push("/login"); // Redirige vers la page de login
    };

    return {
      user,
      toggleSidebar,
      handleLogout,
    };
  },
});
</script>

<template>
  <nav class="topnav navbar navbar-light">
    <button
      @click="toggleSidebar"
      type="button"
      class="navbar-toggler text-muted mt-2 p-0 mr-3"
    >
      <i class="fe fe-menu navbar-toggler-icon"></i>
    </button>
    <form class="form-inline mr-auto searchform text-muted">
      <input
        class="form-control mr-sm-2 bg-transparent border-0 pl-4 text-muted"
        type="search"
        placeholder="Type something..."
        aria-label="Search"
      />
    </form>

    <ul class="nav">
      <li class="nav-item">
        <ThemeSwitcher />
      </li>

      <li class="nav-item">
        <a
          class="nav-link text-muted my-2"
          href="./#"
          data-toggle="modal"
          data-target=".modal-shortcut"
        >
          <span class="fe fe-grid fe-16"></span>
        </a>
      </li>
      <li class="nav-item nav-notif">
        <a
          class="nav-link text-muted my-2"
          href="./#"
          data-toggle="modal"
          data-target=".modal-notif"
        >
          <span class="fe fe-bell fe-16"></span>
          <span class="dot dot-md bg-success"></span>
        </a>
      </li>
      <li class="nav-item dropdown">
        <a
          class="nav-link dropdown-toggle text-muted pr-0"
          href="#"
          id="navbarDropdownMenuLink"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span class="avatar avatar-sm mt-2">
            <i class="fe fe-user fe-16"></i>
          </span>
          <b v-if="user">{{ user.role }} {{ user.first_name }}</b>
          <b v-else>Utilisateur inconnu</b>
        </a>
        <div
          class="dropdown-menu dropdown-menu-right"
          aria-labelledby="navbarDropdownMenuLink"
        >
          <a class="dropdown-item" href="#">Profile</a>
          <a class="dropdown-item" href="#">Settings</a>
          <a id="decon" class="dropdown-item" href="#" @click="handleLogout"
            >Deconnexion</a
          >
        </div>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.fe-user {
  font-size: 28px;
}

#decon {
  color: red;
}
</style>

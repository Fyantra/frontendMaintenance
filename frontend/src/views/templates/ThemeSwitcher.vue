<template>
  <div>
    <a @click="switchTheme" class="nav-link text-muted my-2" href="#" id="modeSwitcher">
      <i class="fe" :class="themeMode === 'dark' ? 'fe-sun' : 'fe-moon'"></i>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "ThemeSwitcher",
  setup() {
    const lightTheme = ref<HTMLLinkElement | null>(null);
    const darkTheme = ref<HTMLLinkElement | null>(null);
    const themeMode = ref<string>("dark");

    const switchTheme = () => {
      if (lightTheme.value && darkTheme.value) {
        if (darkTheme.value.disabled) {
          // Activer le thème sombre et désactiver le thème clair
          darkTheme.value.disabled = false;
          lightTheme.value.disabled = true;
          themeMode.value = "dark";
        } else {
          // Activer le thème clair et désactiver le thème sombre
          darkTheme.value.disabled = true;
          lightTheme.value.disabled = false;
          themeMode.value = "light";
        }
      }
    };

    return {
      lightTheme,
      darkTheme,
      themeMode,
      switchTheme,
    };
  },
  mounted() {
    // Récupérer les éléments link par leurs ID
    this.lightTheme = document.querySelector("#lightTheme");
    this.darkTheme = document.querySelector("#darkTheme");
  },
});
</script>

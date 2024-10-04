<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const authStore = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = "Tous les champs doivent être remplis";
    return;
  }

  try {
    const endpoint: string = "login/";
    const apiUrl = `${import.meta.env.VITE_APP_API_BASE_URL}${endpoint}`;
    const response = await axios.post(
      apiUrl,
      {
        username: username.value,
        password: password.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Envoie les cookies avec la requête
      }
    );

    const data = response.data;

    // Stocker l'utilisateur et le token dans Pinia
    authStore.login(data.user, data.access);

    // Rediriger vers la page d'accueil
    router.push({ name: "home" });
  } catch (error) {
    errorMessage.value = "Nom d'utilisateur ou mot de passe incorrect";
  }
};
</script>

<template>
  <div class="wrapper vh-100">
    <div class="row align-items-center h-100">
      <form
        class="col-lg-3 col-md-4 col-10 mx-auto text-center"
        @submit.prevent="handleSubmit"
      >
        <div class="w-100 mb-4 d-flex logo-container">
          <a class="navbar-brand mx-auto mt-2 flex-fill text-center logo-link" href="#">
            AKANJO MAINTENANCE
          </a>
        </div>
        <h1 class="h6 mb-3">Connectez-vous!</h1>
        <div class="form-group">
          <label for="inputUserName" class="sr-only">Votre nom</label>
          <input
            type="text"
            id="inputUserName"
            v-model="username"
            class="form-control form-control-lg required"
            placeholder="Entrer votre nom"
          />
        </div>
        <div class="form-group">
          <label for="inputPassword" class="sr-only">Votre mot de passe</label>
          <input
            type="password"
            id="inputPassword"
            v-model="password"
            class="form-control form-control-lg"
            placeholder="Entrer votre mot de passe"
            required
          />
        </div>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          <span class="fe fe-minus-circle fe-16 mr-2"></span>{{ errorMessage }}
        </div>
        <button class="btn btn-lg btn-primary btn-block" type="submit">Valider</button>

        <p class="mt-5 mb-3 text-muted">
          Vous n`avez pas de compte?
          <RouterLink to="/inscription">S'inscrire ici</RouterLink>
        </p>
        <p class="mt-5 mb-3 text-muted">© 2024</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.logo-container {
  /* display: flex; */
  justify-content: center;
  align-items: center;
  height: 70px;
  background: linear-gradient(135deg, #1b68ff, #17a2b8);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.logo-container:hover {
  transform: scale(1.05); /* Agrandir légèrement au survol */
}

/* Lien du logo */
.logo-link {
  font-family: "Poppins", sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
}

.logo-link::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 3px;
  bottom: -5px;
  left: 0;
  background-color: #fff;
  visibility: hidden;
  transform: scaleX(0);
  transition: all 0.3s ease-in-out;
}

.logo-link:hover {
  color: #ffc107;
  text-shadow: 2px 2px 15px rgba(255, 193, 7, 0.7);
}

.logo-link:hover::before {
  visibility: visible;
  transform: scaleX(1);
}
</style>

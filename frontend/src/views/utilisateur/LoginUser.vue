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
  <div class="login-wrapper vh-100">
    <div class="row align-items-center h-100">
      <form
        class="col-lg-4 col-md-6 col-10 mx-auto text-center login-form"
        @submit.prevent="handleSubmit"
      >
        <!-- Logo et Titre -->
        <div class="w-100 mb-4 d-flex logo-container">
          <a class="navbar-brand mx-auto mt-2 flex-fill text-center logo-link" href="#">
            AKANJO MAINTENANCE
          </a>
        </div>

        <h1 class="h5 mb-4 text-light">Connectez-vous!</h1>

        <!-- Champs de connexion -->
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

        <div class="form-group mt-3">
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

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
          <span class="fe fe-minus-circle fe-16 mr-2"></span>{{ errorMessage }}
        </div>

        <!-- Bouton de validation -->
        <button class="btn btn-lg btn-primary btn-block mt-4" type="submit">
          <i class="bi bi-box-arrow-in-right me-2"></i> Valider
        </button>

        <!-- Lien d'inscription -->
        <p class="mt-5 mb-3 text-muted">
          Vous n'avez pas de compte?
          <RouterLink to="/inscription" class="text-info">S'inscrire ici</RouterLink>
        </p>

        <!-- Footer -->
        <p class="mt-3 mb-0 text-light">&copy; 2024</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Arrière-plan général */
.login-wrapper {
  background-image: url("https://img.freepik.com/photos-gratuite/homme-installe-systeme-chauffage-dans-maison-verifie-tuyaux-cle-anglaise_169016-52877.jpg?t=st=1731351411~exp=1731355011~hmac=b7005a6ef3cd45f1805f10e660e52900675016ef94aa1943bc5c713176304c54&w=1060");
  background-size: cover;
  background-position: center;
  position: relative;
}

.login-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* Couche sombre */
}

/* Style du formulaire */
.login-form {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

/* Logo */
.logo-container {
  justify-content: center;
  align-items: center;
  height: 70px;
  background: linear-gradient(135deg, #1b68ff, #17a2b8);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.logo-link {
  font-family: "Poppins", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.logo-link:hover {
  color: #ffc107;
  text-shadow: 2px 2px 15px rgba(255, 193, 7, 0.7);
}

/* Champ de saisie */
.form-control {
  border-radius: 10px;
  padding: 1.25rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
}

.form-control:focus {
  border-color: #1b68ff;
  box-shadow: 0 0 8px rgba(27, 104, 255, 0.5);
}

/* Bouton de validation */
.btn-primary {
  background: linear-gradient(135deg, #1b68ff, #17a2b8);
  border: none;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.3s;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Lien d'inscription */
.text-info {
  color: #17a2b8 !important;
  text-decoration: underline;
}

.text-info:hover {
  color: #1b68ff !important;
}

/* Texte sous le bouton */
.text-muted {
  color: rgba(255, 255, 255, 0.8);
}
</style>

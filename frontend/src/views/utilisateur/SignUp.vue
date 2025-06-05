<script setup lang="ts">
import { ref, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const firstName = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const role = ref("responsable"); // Par défaut
const errorMessages = ref<Record<string, string>>({});
const successMessage = ref("");
const router = useRouter();

// Validation des champ
watch(firstName, (value) => {
  if (!value.trim()) {
    errorMessages.value.firstName = "Le nom est obligatoire.";
  } else {
    delete errorMessages.value.firstName;
  }
});

watch(username, (value) => {
  if (!value.trim()) {
    errorMessages.value.username = "Le nom d'utilisateur est obligatoire.";
  } else {
    delete errorMessages.value.username;
  }
});

watch(password, (value) => {
  if (!value.trim()) {
    errorMessages.value.password = "Le mot de passe est obligatoire.";
  } else if (value.length < 6) {
    errorMessages.value.password = "Le mot de passe doit contenir au moins 6 caractères.";
  } else {
    delete errorMessages.value.password;
  }
});

watch(confirmPassword, (value) => {
  if (value !== password.value) {
    errorMessages.value.confirmPassword = "Les mots de passe ne correspondent pas.";
  } else {
    delete errorMessages.value.confirmPassword;
  }
});

const handleSubmit = async () => {
  if (Object.keys(errorMessages.value).length > 0) {
    return;
  }

  try {
    const apiUrl = `${import.meta.env.VITE_APP_API_BASE_URL}signup/`;
    const response = await axios.post(
      apiUrl,
      {
        first_name: firstName.value,
        username: username.value,
        email: email.value,
        password: password.value,
        role: role.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    successMessage.value =
      "Compte créé avec succès ! Vous serez redirigé vers la page de connexion.";
    setTimeout(() => router.push("/login"), 2000);
  } catch (error) {
    errorMessages.value.global = "Une erreur est survenue lors de l'inscription.";
  }
};
</script>

<template>
  <div class="wrapper bg-gradient-primary d-flex align-items-center">
    <div class="container">
      <div class="registration-card mx-auto p-4 p-md-5 shadow-lg bg-white rounded-4">
        <form @submit.prevent="handleSubmit">
          <div class="text-center mb-4">
            <div class="logo-container mb-3">
              <a class="navbar-brand logo-link" href="#"> AKANJO MAINTENANCE </a>
            </div>
            <h2 class="form-title">Inscription</h2>
          </div>

          <div class="form-group">
            <label for="firstName">Votre nom*</label>
            <input
              type="text"
              v-model="firstName"
              id="firstName"
              class="form-control input-field"
              required
            />
            <small v-if="errorMessages.firstName" class="text-danger">{{
              errorMessages.firstName
            }}</small>
          </div>

          <div class="form-group">
            <label for="firstName">Votre prénom*</label>
            <input
              type="text"
              v-model="firstName"
              id="firstName"
              class="form-control input-field"
              required
            />
            <small v-if="errorMessages.firstName" class="text-danger">{{
              errorMessages.firstName
            }}</small>
          </div>

          <div class="form-group">
            <label for="username">Nom d'utilisateur*</label>
            <input
              type="text"
              v-model="username"
              id="username"
              class="form-control input-field"
              required
            />
            <small v-if="errorMessages.username" class="text-danger">{{
              errorMessages.username
            }}</small>
          </div>

          <div class="form-group">
            <label for="inputEmail4">Email</label>
            <input
              type="email"
              v-model="email"
              class="form-control input-field"
              id="inputEmail4"
            />
          </div>

          <hr class="my-4" />
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="form-group">
                <label for="inputPassword5">Mot de passe*</label>
                <input
                  type="password"
                  v-model="password"
                  class="form-control input-field"
                  id="inputPassword5"
                  required
                />
                <small v-if="errorMessages.password" class="text-danger">{{
                  errorMessages.password
                }}</small>
              </div>
              <div class="form-group">
                <label for="inputPassword6">Confirmer le mot de passe*</label>
                <input
                  type="password"
                  v-model="confirmPassword"
                  class="form-control input-field"
                  id="inputPassword6"
                  required
                />
                <small v-if="errorMessages.confirmPassword" class="text-danger">{{
                  errorMessages.confirmPassword
                }}</small>
              </div>
            </div>

            <div class="form-group ml-5">
              <p class="fw-semibold mb-2">Votre rôle*</p>
              <div class="role-options">
                <label class="role-option">
                  <input type="radio" value="responsable" v-model="role" />
                  <span>Responsable</span>
                </label>
                <label class="role-option">
                  <input type="radio" value="technicien" v-model="role" />
                  <span>Technicien</span>
                </label>
                <label class="role-option">
                  <input type="radio" value="chef" v-model="role" />
                  <span>Chef</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="errorMessages.global" class="alert alert-danger" role="alert">
            {{ errorMessages.global }}
          </div>
          <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
            {{ successMessage }}
          </div>

          <button class="btn btn-lg btn-primary w-100 mt-3 shadow" type="submit">
            Créer mon compte
          </button>

          <p class="mt-4 text-center text-muted">
            Vous avez déjà un compte ?
            <RouterLink to="/login" class="text-primary fw-bold"
              >Se connecter ici</RouterLink
            >
          </p>
          <p class="mt-2 text-muted text-center">© {{ new Date().getFullYear() }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  font-family: "Poppins", sans-serif;
  background: linear-gradient(to right, #1e3c72, #2a5298);
  padding: 30px 0;
}

.registration-card {
  max-width: 800px;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-weight: 700;
  font-size: 28px;
}

.input-field {
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.input-field:focus {
  border-color: #17a2b8;
  box-shadow: 0 0 5px rgba(23, 162, 184, 0.5);
}

.logo-container {
  background: linear-gradient(135deg, #1b68ff, #17a2b8);
  border-radius: 20px;
  padding: 15px;
  text-align: center;
}

.logo-link {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.logo-link:hover {
  color: #ffc107;
  text-shadow: 0 3px 12px rgba(255, 193, 7, 0.6);
}

.role .form-check-input {
  margin-top: 0.3rem;
}

.role .form-check-label {
  margin-left: 0.5rem;
}

.btn-primary {
  background-color: #1b68ff;
  border-color: #1b68ff;
  border-radius: 0.6rem;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #155edb;
  border-color: #155edb;
}

.text-primary {
  color: #1b68ff !important;
}

.fw-bold {
  font-weight: 600;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.role-option {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border: 2px solid transparent;
  border-radius: 12px;
  background-color: #f1f1f1;
  transition: background 0.3s, border 0.3s;
  cursor: pointer;
  font-weight: 500;
}

.role-option:hover {
  background-color: #e7f3ff;
}

.role-option input[type="radio"] {
  display: none;
}

.role-option input[type="radio"]:checked + span {
  color: #1b68ff;
  font-weight: 600;
}

.role-option input[type="radio"]:checked ~ .role-option {
  border-color: #1b68ff;
}
</style>

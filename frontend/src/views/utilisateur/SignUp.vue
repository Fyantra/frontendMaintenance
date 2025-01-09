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
  <div class="wrapper vh-100">
    <div class="row align-items-center h-100">
      <form class="col-lg-6 col-md-8 col-10 mx-auto" @submit.prevent="handleSubmit">
        <div class="mx-auto text-center my-4">
          <div class="w-100 mb-4 d-flex logo-container">
            <a class="navbar-brand mx-auto mt-2 flex-fill text-center logo-link" href="#">
              AKANJO MAINTENANCE
            </a>
          </div>
          <h2 class="my-3">Inscription</h2>
        </div>

        <div class="form-group">
          <label for="firstName">Votre nom*</label>
          <input
            type="text"
            v-model="firstName"
            id="firstName"
            class="form-control"
            required
          />
          <small v-if="errorMessages.firstName" class="text-danger">
            {{ errorMessages.firstName }}
          </small>
        </div>

        <div class="form-group">
          <label for="username">Votre nom d'utilisateur*</label>
          <input
            type="text"
            v-model="username"
            id="username"
            class="form-control"
            required
          />
          <small v-if="errorMessages.username" class="text-danger">
            {{ errorMessages.username }}
          </small>
        </div>

        <div class="form-group">
          <label for="inputEmail4">Email</label>
          <input type="email" v-model="email" class="form-control" id="inputEmail4" />
        </div>

        <hr class="my-4" />
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="form-group">
              <label for="inputPassword5">Votre mot de passe*</label>
              <input
                type="password"
                v-model="password"
                class="form-control"
                id="inputPassword5"
                required
              />
              <small v-if="errorMessages.password" class="text-danger">
                {{ errorMessages.password }}
              </small>
            </div>
            <div class="form-group">
              <label for="inputPassword6">Confirmer votre mot de passe*</label>
              <input
                type="password"
                v-model="confirmPassword"
                class="form-control"
                id="inputPassword6"
                required
              />
              <small v-if="errorMessages.confirmPassword" class="text-danger">
                {{ errorMessages.confirmPassword }}
              </small>
            </div>
          </div>

          <div class="col-md-6 mb-20 role">
            <div class="card shadow">
              <div class="card-body">
                <p class="mb-2"><strong>Votre role*</strong></p>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    id="customRadio1"
                    name="customRadio"
                    class="custom-control-input"
                    checked
                    value="responsable"
                    v-model="role"
                  />
                  <label class="custom-control-label" for="customRadio1"
                    >Responsable</label
                  >
                </div>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    id="customRadio2"
                    name="customRadio"
                    class="custom-control-input"
                    value="technicien"
                    v-model="role"
                  />
                  <label class="custom-control-label" for="customRadio2"
                    >Technicien</label
                  >
                </div>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    name="customRadio"
                    id="customRadio3"
                    class="custom-control-input"
                    value="chef"
                    v-model="role"
                  />
                  <label class="custom-control-label" for="customRadio3">Chef</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorMessages.global" class="alert alert-danger" role="alert">
          {{ errorMessages.global }}
        </div>
        <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
          {{ successMessage }}
        </div>

        <button class="btn btn-lg btn-primary btn-block" type="submit">Valider</button>

        <p class="mt-5 mb-3 text-muted">
          Vous avez déjà un compte?
          <RouterLink to="/login" class="text-info">Se connecter ici</RouterLink>
        </p>

        <p class="mt-5 mb-3 text-muted text-center">© {{ new Date().getFullYear() }}</p>
      </form>
    </div>
  </div>
</template>

<style>
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

.role {
  margin-top: 3%;
}

.text-info {
  color: #17a2b8 !important;
  text-decoration: underline;
}

/* Texte sous le bouton */
.text-muted {
  color: rgba(255, 255, 255, 0.8);
}
</style>

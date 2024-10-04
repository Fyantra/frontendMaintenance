<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from "vue";
import { useCrud } from "@/composables/useCrud";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import SectionNavigation from "../templates/SectionNavigation.vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

interface Marque {
  id: number;
  nom_marque: string;
  date_creation: Date | string;
}

const form = reactive<Marque>({
  //doit suivre les proprietes de marque
  id: 0,
  nom_marque: "",
  date_creation: "",
});

// Définir les règles de validation
const validation = {
  nom_marque: { required },
};

// Utilisation de Vuelidate avec les règles de validation
const v$ = useVuelidate(validation, form);

const nom_marque = ref<string>("");

const {
  items,
  errorMessage,
  error401Message,
  initializeDataTable,
  addItem,
  deleteItem,
  updateItem,
} = useCrud<Marque>("machine/marques/", v$);

const selectedItem = ref<Marque | null>(null); // Élément sélectionné pour la modification

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

//Pour la deconnexion en cas d`erreur 401
const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

//Ajouter un nouveau item
const submitForm = async () => {
  v$.value.$touch(); // Marquer les champs comme touchés pour la validation
  if (!v$.value.$invalid) {
    await addItem({ nom_marque: form.nom_marque });
    nom_marque.value = ""; // Réinitialiser le formulaire
    $("#addModal").modal("hide");
  } else {
    console.error("Formulaire invalide");
  }
};

// Fonction pour soumettre la mise à jour
const submitUpdateForm = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid && selectedItem.value) {
    await updateItem(selectedItem.value.id, { nom_marque: form.nom_marque });
    selectedItem.value = null; // Réinitialiser après la mise à jour
    nom_marque.value = "";
    $("#updateModal").modal("hide");
  } else {
    console.error("Formulaire de mise à jour invalide");
  }
};

// Ouvrir le modal de modification
const openUpdateModal = (item: Marque) => {
  form.id = item.id;
  form.nom_marque = item.nom_marque;
  selectedItem.value = item; // Stocker l'élément à mettre à jour
};

// Charger les données au montage
onMounted(async () => {
  initializeDataTable();
});

onBeforeUnmount(() => {
  // Détruire le DataTable avant le démontage du composant pour éviter les fuites de mémoire
  $("#datatable-1").DataTable().destroy(true);
});
</script>

<template>
  <SectionNavigation />

  <div class="row">
    <div class="col-md-8">
      <h2 class="page-title">Marques de machine</h2>
    </div>

    <button
      type="button"
      data-toggle="modal"
      data-target=".modal-full"
      class="btn mb-2 btn-primary"
      style="width: 22%"
    >
      <span class="fe fe-plus fe-16 mr-2"></span>Ajouter une marque
    </button>
  </div>

  <p>Voici les différents marques disponibles.</p>

  <!-- Formulaire d'ajout de modèle -->
  <div
    class="modal fade modal-full"
    tabindex="-1"
    id="addModal"
    role="dialog"
    aria-labelledby="mySmallModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <div class="row">
            <div class="col-md-12">
              <div class="card shadow mb-4">
                <div class="card-header">
                  <strong class="card-title">Ajout de marque</strong>
                </div>
                <div class="card-body">
                  <form class="form-inline" @submit.prevent="submitForm">
                    <label class="sr-only" for="inlineFormInputName2"
                      >Nom de la marque</label
                    >
                    <input
                      type="text"
                      v-model="form.nom_marque"
                      class="form-control mb-2 mr-sm-2"
                      id="inlineFormInputName2"
                      placeholder="Piqueuse Juki"
                      style="width: 60%"
                      :class="{
                        'is-invalid': v$.nom_marque.$invalid && v$.nom_marque.$dirty,
                      }"
                    />
                    <span v-if="v$.nom_marque.$error" class="error">
                      Nom de marque requis.
                    </span>
                    <button type="submit" class="btn btn-primary mb-2">Valider</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Afficher les messages d`erreur-->
  <div v-if="errorMessage" class="col-12 mb-4">
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong style="color: red">Une erreur est survenue: </strong> "{{ errorMessage }}"
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

  <!-- Liste des modèles -->
  <div class="col-md-14 my-4">
    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title">Liste des marques</h5>
        <table id="datatable-1" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom du marque</th>
              <th>Date de création</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.nom_marque }}</td>
              <td>{{ new Date(item.date_creation).toLocaleDateString() }}</td>
              <td>
                <div class="dropdown">
                  <button
                    class="btn btn-sm dropdown-toggle"
                    type="button"
                    id="dr1"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span class="text-muted sr-only">Action</span>
                  </button>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dr1">
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="openUpdateModal(item)"
                      data-toggle="modal"
                      data-target="#updateModal"
                      >Modifier</a
                    >
                    <a class="dropdown-item" href="#" @click="deleteItem(item.id)"
                      >Supprimer</a
                    >
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal de mise à jour -->
  <div
    class="modal fade"
    id="updateModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="updateModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateModalLabel">Modifier la marque</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUpdateForm">
            <div class="form-group">
              <label for="nom-marque" class="col-form-label">Nom de la marque:</label>
              <input
                type="text"
                v-model="form.nom_marque"
                class="form-control"
                id="nom-marque"
                :class="{ 'is-invalid': v$.nom_marque.$invalid && v$.nom_marque.$dirty }"
              />
              <span v-if="v$.nom_marque.$error" class="error">Nom de marque requis.</span>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary">
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.is-invalid {
  border: 1px solid red;
}
.error {
  color: red;
  font-size: 12px;
}
#reconnect {
  margin-left: 3%;
}
</style>

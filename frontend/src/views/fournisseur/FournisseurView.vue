<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from "vue";
import { useCrud } from "@/composables/useCrud";
import useVuelidate from "@vuelidate/core";
import { email, required } from "@vuelidate/validators";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates/ErrorMessage.vue";
import { Fournisseur } from "@/types/FournisseurType";

const form = reactive<Fournisseur>({
  //doit suivre les proprietes de marque
  id: 0,
  nom_fournisseur: "",
  email: "",
  telephone: "",
  date_creation: null,
});

// Définir les règles de validation
const validation = {
  nom_fournisseur: { required },
  email: { email },
};

// Utilisation de Vuelidate avec les règles de validation
const v$ = useVuelidate(validation, form);

const {
  items,
  errorMessage,
  error401Message,
  initializeDataTable,
  addItem,
  deleteItem,
  updateItem,
} = useCrud<Fournisseur>("fournisseur/fournisseurs/", v$);

const selectedItem = ref<Fournisseur | null>(null); // Élément sélectionné pour la modification

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

//Ajouter un nouveau item
const submitForm = async () => {
  v$.value.$touch(); // Marquer les champs comme touchés pour la validation
  if (!v$.value.$invalid) {
    await addItem({
      nom_fournisseur: form.nom_fournisseur,
      email: form.email,
      telephone: form.telephone,
    });
    $("#addModal").modal("hide");
  } else {
    console.error("Formulaire invalide");
  }
};

// Fonction pour soumettre la mise à jour
const submitUpdateForm = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid && selectedItem.value) {
    await updateItem(selectedItem.value.id, {
      nom_fournisseur: form.nom_fournisseur,
      email: form.email,
      telephone: form.telephone,
    });
    selectedItem.value = null; // Réinitialiser après la mise à jour
    $("#updateModal").modal("hide");
  } else {
    console.error("Formulaire de mise à jour invalide");
  }
};

// Ouvrir le modal de modification
const openUpdateModal = (item: Fournisseur) => {
  form.id = item.id;
  form.nom_fournisseur = item.nom_fournisseur;
  form.email = item.email;
  form.telephone = item.telephone;
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
      <h2 class="page-title">Fournisseur</h2>
    </div>

    <button
      type="button"
      data-toggle="modal"
      data-target="#addModal"
      class="btn mb-2 btn-primary"
      style="width: 22%"
    >
      <span class="fe fe-plus fe-16 mr-2"></span>Ajouter un fournisseur
    </button>
  </div>

  <p>Voici les différents fournisseurs disponibles.</p>

  <!-- Formulaire d'ajout de fournisseur -->
  <div
    class="modal fade"
    id="addModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="addModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addModalLabel">Ajout de fournisseur</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="nom-marque" class="col-form-label">Nom du fournisseur:</label>
              <input
                type="text"
                v-model="form.nom_fournisseur"
                class="form-control"
                id="nom-marque"
                :class="{
                  'is-invalid': v$.nom_fournisseur.$invalid && v$.nom_fournisseur.$dirty,
                }"
              />
              <span v-if="v$.nom_fournisseur.$error" class="error"
                >Nom de fournisseur requis.</span
              >
            </div>
            <div class="form-group">
              <label for="email" class="col-form-label">Email:</label>
              <input
                type="email"
                v-model="form.email"
                class="form-control"
                id="email"
                :class="{ 'is-invalid': v$.email.$invalid && v$.email.$dirty }"
              />
              <span v-if="v$.email.$error" class="error">Email invalide.</span>
            </div>

            <div class="form-group">
              <label for="telephone" class="col-form-label">Telephone:</label>
              <input
                type="text"
                v-model="form.telephone"
                class="form-control"
                id="telephone"
              />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary">Ajouter</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Afficher les messages d`erreur-->
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />

  <!-- Liste des modèles -->
  <div class="col-md-14 my-4">
    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title">Liste des fournisseurs</h5>
        <table id="datatable-1" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom du fournisseur</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Date de création</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.nom_fournisseur }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.telephone }}</td>
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
          <h5 class="modal-title" id="updateModalLabel">Modifier le fournisseur</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUpdateForm">
            <div class="form-group">
              <label for="nom-marque" class="col-form-label">Nom du fournisseur:</label>
              <input
                type="text"
                v-model="form.nom_fournisseur"
                class="form-control"
                id="nom-marque"
                :class="{
                  'is-invalid': v$.nom_fournisseur.$invalid && v$.nom_fournisseur.$dirty,
                }"
              />
              <span v-if="v$.nom_fournisseur.$error" class="error"
                >Nom de fournisseur requis.</span
              >
            </div>
            <div class="form-group">
              <label for="email" class="col-form-label">Email:</label>
              <input
                type="email"
                v-model="form.email"
                class="form-control"
                id="email"
                :class="{ 'is-invalid': v$.email.$invalid && v$.email.$dirty }"
              />
              <span v-if="v$.email.$error" class="error">Email invalide.</span>
            </div>

            <div class="form-group">
              <label for="telephone" class="col-form-label">Telephone:</label>
              <input
                type="text"
                v-model="form.telephone"
                class="form-control"
                id="telephone"
              />
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

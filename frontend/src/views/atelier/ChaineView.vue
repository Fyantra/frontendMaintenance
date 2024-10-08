<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from "vue";
import { useCrud } from "@/composables/useCrud";
import { useFindById } from "@/composables/useFindById";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates/ErrorMessage.vue";
import { Chaine, Atelier } from "@/types/AtelierType";

const form = reactive<Chaine>({
  id: 0,
  nom_chaine: "",
  date_creation: null,
  atelier: null,
});

// Définir les règles de validation
const validation = {
  nom_chaine: { required },
  atelier: { required },
};

// Utilisation de Vuelidate avec les règles de validation
const v$ = useVuelidate(validation, form);

const ateliers = useCrud<Atelier>("atelier/ateliers/", v$);
const chaines = useCrud<Chaine>("atelier/chaines/", v$);

//recuperer la valeur des foreign key par l`ID
const { findById: findAtelier } = useFindById(ateliers.items);

const errorMessage = chaines.errorMessage;
const error401Message = chaines.error401Message;

const selectedItem = ref<Chaine | null>(null); // Élément sélectionné pour la modification

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

//Ajouter un nouveau item
const submitForm = async () => {
  v$.value.$touch(); // Marquer les champs comme touchés pour la validation
  if (!v$.value.$invalid) {
    await chaines.addItem({
      nom_chaine: form.nom_chaine,
      atelier: form.atelier,
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
    await chaines.updateItem(selectedItem.value.id, {
      nom_chaine: form.nom_chaine,
      atelier: form.atelier,
    });
    selectedItem.value = null; // Réinitialiser après la mise à jour
    $("#updateModal").modal("hide");
  } else {
    console.error("Formulaire de mise à jour invalide");
  }
};

// Ouvrir le modal de modification
const openUpdateModal = (item: Chaine) => {
  form.id = item.id;
  form.nom_chaine = item.nom_chaine;
  form.atelier = item.atelier;
  selectedItem.value = item;
};

// Charger les données au montage
onMounted(async () => {
  await Promise.all([chaines.initializeDataTable(), ateliers.fetchItems()]);
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
      <h2 class="page-title">Chaîne</h2>
    </div>

    <button
      type="button"
      data-toggle="modal"
      data-target="#addModal"
      class="btn mb-2 btn-primary"
      style="width: 22%"
    >
      <span class="fe fe-plus fe-16 mr-2"></span>Ajouter une chaîne
    </button>
  </div>

  <p>Voici les différentes chaînes disponibles.</p>

  <!-- Formulaire d'ajout d`atelier -->
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
          <h5 class="modal-title" id="addModalLabel">Ajout de chaîne</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="chaine" class="col-form-label">Nom de la chaine:</label>
              <input
                type="text"
                v-model="form.nom_chaine"
                class="form-control"
                id="chaine"
                :class="{
                  'is-invalid': v$.nom_chaine.$invalid && v$.nom_chaine.$dirty,
                }"
              />
              <span v-if="v$.nom_chaine.$error" class="error">Nom de chaine requis.</span>
            </div>

            <div class="form-group mb-3">
              <label for="atelier">Atelier correspondant:</label>
              <select
                v-model="form.atelier"
                class="custom-select"
                id="atelier"
                :class="{ 'is-invalid': v$.atelier.$invalid && v$.atelier.$dirty }"
              >
                <option selected disabled>Sélectionnez un atelier</option>
                <option
                  v-for="atelier in ateliers.items.value"
                  :key="atelier.id"
                  :value="atelier.id"
                >
                  {{ atelier.nom_atelier }}
                </option>
              </select>
              <span v-if="v$.atelier.$error" class="error">Atelier requis.</span>
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
        <h5 class="card-title">Liste des chaines</h5>
        <table id="datatable-1" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom de la chaine</th>
              <th>Atelier correspondant</th>
              <th>Date de création</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in chaines.items.value" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.nom_chaine }}</td>
              <td>
                {{ findAtelier(item.atelier, "nom_atelier") }}
              </td>
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
                    <a class="dropdown-item" href="#" @click="chaines.deleteItem(item.id)"
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
          <h5 class="modal-title" id="updateModalLabel">Modifier l'atelier</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUpdateForm">
            <div class="form-group">
              <label for="chaine" class="col-form-label">Nom de la chaine:</label>
              <input
                type="text"
                v-model="form.nom_chaine"
                class="form-control"
                id="chaine"
                :class="{
                  'is-invalid': v$.nom_chaine.$invalid && v$.nom_chaine.$dirty,
                }"
              />
              <span v-if="v$.nom_chaine.$error" class="error">Nom de chaine requis.</span>
            </div>

            <div class="form-group mb-3">
              <label for="atelier">Atelier correspondant:</label>
              <select
                v-model="form.atelier"
                class="custom-select"
                id="atelier"
                :class="{ 'is-invalid': v$.atelier.$invalid && v$.atelier.$dirty }"
              >
                <option selected disabled>Sélectionnez un atelier</option>
                <option
                  v-for="atelier in ateliers.items.value"
                  :key="atelier.id"
                  :value="atelier.id"
                >
                  {{ atelier.nom_atelier }}
                </option>
              </select>
              <span v-if="v$.atelier.$error" class="error">Atelier requis.</span>
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

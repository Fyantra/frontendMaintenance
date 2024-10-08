<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from "vue";
import { useCrud } from "@/composables/useCrud";
import { useFindById } from "@/composables/useFindById";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates/ErrorMessage.vue";
import { Endroit, Responsable, Atelier } from "@/types/AtelierType";

const form = reactive<Atelier>({
  id: 0,
  nom_atelier: "",
  date_creation: null,
  endroit: null,
  responsable: null,
});

// Définir les règles de validation
const validation = {
  nom_atelier: { required },
  endroit: { required },
  responsable: { required },
};

// Utilisation de Vuelidate avec les règles de validation
const v$ = useVuelidate(validation, form);

const ateliers = useCrud<Atelier>("atelier/ateliers/", v$);
const endroits = useCrud<Endroit>("atelier/endroits/", v$);
const responsables = useCrud<Responsable>("atelier/responsables/", v$);

//recuperer la valeur des foreign key par l`ID
const { findById: findEndroit } = useFindById(endroits.items);
const { findById: findResponsable } = useFindById(responsables.items);

const errorMessage = ateliers.errorMessage;
const error401Message = ateliers.error401Message;

const selectedItem = ref<Atelier | null>(null); // Élément sélectionné pour la modification

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

//Ajouter un nouveau item
const submitForm = async () => {
  v$.value.$touch(); // Marquer les champs comme touchés pour la validation
  if (!v$.value.$invalid) {
    await ateliers.addItem({
      nom_atelier: form.nom_atelier,
      endroit: form.endroit,
      responsable: form.responsable,
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
    await ateliers.updateItem(selectedItem.value.id, {
      nom_atelier: form.nom_atelier,
      endroit: form.endroit,
      responsable: form.responsable,
    });
    selectedItem.value = null; // Réinitialiser après la mise à jour
    $("#updateModal").modal("hide");
  } else {
    console.error("Formulaire de mise à jour invalide");
  }
};

// Ouvrir le modal de modification
const openUpdateModal = (item: Atelier) => {
  form.id = item.id;
  form.nom_atelier = item.nom_atelier;
  form.endroit = item.endroit;
  form.responsable = item.responsable;
  selectedItem.value = item;
};

// Charger les données au montage
onMounted(async () => {
  await Promise.all([
    ateliers.initializeDataTable(),
    endroits.fetchItems(),
    responsables.fetchItems(),
  ]);
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
      <h2 class="page-title">Atelier</h2>
    </div>

    <button
      type="button"
      data-toggle="modal"
      data-target="#addModal"
      class="btn mb-2 btn-primary"
      style="width: 22%"
    >
      <span class="fe fe-plus fe-16 mr-2"></span>Ajouter un atelier
    </button>
  </div>

  <p>Voici les différents ateliers disponibles.</p>

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
          <h5 class="modal-title" id="addModalLabel">Ajout d'atelier</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="atelier" class="col-form-label">Nom de l`atelier`:</label>
              <input
                type="text"
                v-model="form.nom_atelier"
                class="form-control"
                id="atelier"
                :class="{
                  'is-invalid': v$.nom_atelier.$invalid && v$.nom_atelier.$dirty,
                }"
              />
              <span v-if="v$.nom_atelier.$error" class="error"
                >Nom d`atelier requis.</span
              >
            </div>

            <div class="form-group mb-3">
              <label for="endroit">Endroit:</label>
              <select
                v-model="form.endroit"
                class="custom-select"
                id="endroit"
                :class="{ 'is-invalid': v$.endroit.$invalid && v$.endroit.$dirty }"
              >
                <option selected disabled>Sélectionnez un endroit</option>
                <option
                  v-for="endroit in endroits.items.value"
                  :key="endroit.id"
                  :value="endroit.id"
                >
                  {{ endroit.nom_endroit }}
                </option>
              </select>
              <span v-if="v$.endroit.$error" class="error">Endroit requis.</span>
            </div>

            <div class="form-group mb-3">
              <label for="responsable">Responsable:</label>
              <select
                v-model="form.responsable"
                class="custom-select"
                id="responsable"
                :class="{
                  'is-invalid': v$.responsable.$invalid && v$.responsable.$dirty,
                }"
              >
                <option selected disabled>Sélectionnez le responsable</option>
                <option
                  v-for="responsable in responsables.items.value"
                  :key="responsable.id"
                  :value="responsable.id"
                >
                  {{ responsable.nom_responsable }}
                </option>
              </select>
              <span v-if="v$.responsable.$error" class="error">Responsable requis.</span>
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
        <h5 class="card-title">Liste des ateliers</h5>
        <table id="datatable-1" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom de l'atelier</th>
              <th>Endroit</th>
              <th>Responsable</th>
              <th>Date de création</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ateliers.items.value" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.nom_atelier }}</td>
              <td>
                {{ findEndroit(item.endroit, "nom_endroit") }}
              </td>
              <td>
                {{ findResponsable(item.responsable, "nom_responsable") }}
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
                    <a
                      class="dropdown-item"
                      href="#"
                      @click="ateliers.deleteItem(item.id)"
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
              <label for="atelier" class="col-form-label">Nom de l`atelier`:</label>
              <input
                type="text"
                v-model="form.nom_atelier"
                class="form-control"
                id="atelier"
                :class="{
                  'is-invalid': v$.nom_atelier.$invalid && v$.nom_atelier.$dirty,
                }"
              />
              <span v-if="v$.nom_atelier.$error" class="error"
                >Nom d`atelier requis.</span
              >
            </div>
            <div class="form-group mb-3">
              <label for="endroit">Endroit:</label>
              <select
                v-model="form.endroit"
                class="custom-select"
                id="endroit"
                :class="{ 'is-invalid': v$.endroit.$invalid && v$.endroit.$dirty }"
              >
                <option value="sfksdnkjfs" selected disabled>
                  Sélectionnez un endroit
                </option>
                <option
                  v-for="endroit in endroits.items.value"
                  :key="endroit.id"
                  :value="endroit.id"
                >
                  {{ endroit.nom_endroit }}
                </option>
              </select>
              <span v-if="v$.endroit.$error" class="error">Endroit requis.</span>
            </div>

            <div class="form-group mb-3">
              <label for="responsable">Responsable:</label>
              <select
                v-model="form.responsable"
                class="custom-select"
                id="responsable"
                :class="{
                  'is-invalid': v$.responsable.$invalid && v$.responsable.$dirty,
                }"
              >
                <option selected disabled>Sélectionnez le responsable</option>
                <option
                  v-for="responsable in responsables.items.value"
                  :key="responsable.id"
                  :value="responsable.id"
                >
                  {{ responsable.nom_responsable }}
                </option>
              </select>
              <span v-if="v$.responsable.$error" class="error">Responsable requis.</span>
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

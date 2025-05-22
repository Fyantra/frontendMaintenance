<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from "vue";
import { useCrud } from "@/composables/useCrud";
import useVuelidate from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { Responsable } from "@/types/AtelierType";

const form = reactive<Responsable>({
  //doit suivre les proprietes de Endroit
  id: 0,
  nom_responsable: "",
  email: "",
  date_creation: null,
});

// Définir les règles de validation
const validation = {
  nom_responsable: { required },
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
} = useCrud<Responsable>("atelier/responsables/", v$);

const selectedItem = ref<Responsable | null>(null); // Élément sélectionné pour la modification

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const image = ref<string | null>(null); // Aperçu de l'image
const fileInput = ref<HTMLInputElement | null>(null);

//Ajouter un nouveau responsable
const submitForm = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    const formData = new FormData();
    formData.append("nom_responsable", form.nom_responsable);
    formData.append("email", form.email || "");
    formData.append("telephone", form.telephone || "");
    formData.append("responsabilite", form.responsabilite || "");
    if (fileInput.value?.files?.[0]) {
      formData.append("photo", fileInput.value.files[0]); // Ajouter l'image
    }
    await addItem(formData);
    initializeDataTable();
    ($("#addModal") as any).modal("hide");
  } else {
    console.error("Formulaire invalide");
  }
};

// Fonction pour soumettre la mise à jour
const submitUpdateForm = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid && selectedItem.value) {
    const formData = new FormData();
    formData.append("nom_responsable", form.nom_responsable);
    formData.append("email", form.email || "");
    formData.append("telephone", form.telephone || "");
    formData.append("responsabilite", form.responsabilite || "");
    if (fileInput.value?.files?.[0]) {
      formData.append("photo", fileInput.value.files[0]); // Ajouter l'image si une nouvelle a été sélectionnée
    }
    await updateItem(selectedItem.value.id, formData);
    initializeDataTable();
    selectedItem.value = null;
    ($("#updateModal") as any).modal("hide");
  } else {
    console.error("Formulaire de mise à jour invalide");
  }
};

// Ouvrir le modal de modification
const openUpdateModal = (item: Responsable) => {
  form.id = item.id;
  form.nom_responsable = item.nom_responsable;
  form.responsabilite = item.responsabilite;
  form.email = item.email;
  form.telephone = item.telephone;
  image.value = item.photo;
  selectedItem.value = item; // Stocker l'élément à mettre à jour
};

// Gestion de l'upload de fichier
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      image.value = e.target?.result as string; // Affichage en base64
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  image.value = null;
  if (fileInput.value) {
    fileInput.value.files = null;
  }
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
      <h2 class="page-title">Responsable</h2>
    </div>

    <button
      type="button"
      data-toggle="modal"
      data-target="#addModal"
      class="btn mb-2 btn-primary"
      style="width: 22%"
    >
      <span class="fe fe-plus fe-16 mr-2"></span>Ajouter un(e) responsable
    </button>
  </div>

  <p>Voici la liste des responsables disponibles.</p>

  <!-- Formulaire d'ajout de responsable -->
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
          <h5 class="modal-title" id="addModalLabel">Ajout de responsable</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="d-flex justify-content-center">
              <div class="card shadow mb-4">
                <div class="card-header"><strong>Image du responsable</strong></div>
                <div class="card-body">
                  <span
                    v-if="image"
                    class="circle circle-sm bg-danger justify-content-center"
                    style="float: right"
                    @click="removeImage"
                  >
                    <i class="material-icons notranslate text-white">delete</i>
                  </span>
                  <div
                    style="width: auto; padding: 9px"
                    id="drag-drop-area"
                    class="upload-frame"
                    @dragover.prevent
                    @click="triggerFileInput"
                  >
                    <div v-if="!image" class="default-message text-center">
                      <i class="fe fe-user-plus"></i>
                      <p>Glisser ou deposer votre image ici</p>
                    </div>
                    <div v-else class="uploaded-image">
                      <img :src="image" alt="Pièce détachée" class="img-fluid" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    @change="handleFileUpload"
                    class="d-none"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="nom_responsable" class="col-form-label"
                >Nom du responsable:</label
              >
              <input
                type="text"
                v-model="form.nom_responsable"
                class="form-control"
                id="nom_responsable"
                :class="{
                  'is-invalid': v$.nom_responsable.$invalid && v$.nom_responsable.$dirty,
                }"
              />
              <span v-if="v$.nom_responsable.$error" class="error"
                >Nom de responsable requis.</span
              >
            </div>
            <div class="form-group">
              <label for="responsabilite" class="col-form-label">Responsabilité:</label>
              <input
                type="text"
                v-model="form.responsabilite"
                class="form-control"
                id="responsabilite"
              />
            </div>
            <div class="form-group">
              <label for="email" class="col-form-label">Email:</label>
              <input
                type="text"
                v-model="form.email"
                class="form-control"
                id="email"
                :class="{
                  'is-invalid': v$.email.$invalid && v$.email.$dirty,
                }"
              />
              <span v-if="v$.email.$error" class="error">Entrer un email valide.</span>
            </div>
            <div class="form-group">
              <label for="telephone" class="col-form-label">Téléphone:</label>
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

  <!-- Liste des responsables -->
  <div class="col-md-14 my-4">
    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title">Liste des responsables</h5>
        <table id="datatable-1" class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Nom responsable</th>
              <th>Responsabilité</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Date de création</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.id }}</td>
              <td>
                <div class="avatar avatar-md">
                  <img
                    v-if="item.photo"
                    :src="item.photo"
                    alt="image"
                    class="avatar-img rounded-circle"
                  />
                  <i v-else class="fe fe-24 fe-user"></i>
                </div>
              </td>
              <td>{{ item.nom_responsable }}</td>
              <td>{{ item.responsabilite }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.telephone }}</td>
              <td :data-order="item.date_creation">
                {{ new Date(item.date_creation).toLocaleDateString() }}
              </td>
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
          <h5 class="modal-title" id="updateModalLabel">Modifier un responsable</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUpdateForm">
            <div class="d-flex justify-content-center">
              <div class="card shadow mb-4">
                <div class="card-header"><strong>Image du responsable</strong></div>
                <div class="card-body">
                  <span
                    v-if="image"
                    class="circle circle-sm bg-danger justify-content-center"
                    style="float: right"
                    @click="removeImage"
                  >
                    <i class="material-icons notranslate text-white">delete</i>
                  </span>
                  <div
                    style="width: auto; padding: 9px"
                    id="drag-drop-area"
                    class="upload-frame"
                    @dragover.prevent
                    @click="triggerFileInput"
                  >
                    <div v-if="!image" class="default-message text-center">
                      <i class="fe fe-user-plus"></i>
                      <p>Glisser ou deposer votre image ici</p>
                    </div>
                    <div v-else class="uploaded-image">
                      <img :src="image" alt="Pièce détachée" class="img-fluid" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    @change="handleFileUpload"
                    class="d-none"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="nom_responsable" class="col-form-label"
                >Nom du responsable:</label
              >
              <input
                type="text"
                v-model="form.nom_responsable"
                class="form-control"
                id="nom_responsable"
                :class="{
                  'is-invalid': v$.nom_responsable.$invalid && v$.nom_responsable.$dirty,
                }"
              />
              <span v-if="v$.nom_responsable.$error" class="error"
                >Nom de responsable requis.</span
              >
            </div>
            <div class="form-group">
              <label for="responsabilite" class="col-form-label">Responsabilité:</label>
              <input
                type="text"
                v-model="form.responsabilite"
                class="form-control"
                id="responsabilite"
              />
            </div>
            <div class="form-group">
              <label for="email" class="col-form-label">Email:</label>
              <input
                type="text"
                v-model="form.email"
                class="form-control"
                id="email"
                :class="{
                  'is-invalid': v$.email.$invalid && v$.email.$dirty,
                }"
              />
              <span v-if="v$.email.$error" class="error">Entrer un email valide.</span>
            </div>
            <div class="form-group">
              <label for="telephone" class="col-form-label">Téléphone:</label>
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

.circle {
  cursor: pointer;
}

.default-message {
  color: #6c757d;
}

.default-message i {
  font-size: 48px;
}

.uploaded-image img {
  width: 8rem;
  height: 8rem;
  border-radius: 10px;
}
</style>

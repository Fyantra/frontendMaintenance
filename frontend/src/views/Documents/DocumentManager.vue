<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { Document } from "@/types/DocumentType";
import { useCrud } from "@/composables/useCrud";
import { formatDateTime } from "@/composables/useFonction";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";

const props = defineProps({
  modelType: {
    type: String,
    required: true,
    validator: (value: string) => ["machine", "piece-detachee", "tache"].includes(value),
  },
  modelId: {
    type: [Number, String],
    required: true,
  },
});

// Configuration des endpoints
const baseEndpoints = computed(() => {
  return {
    machine: "machine/machines/",
    "piece-detachee": "piece/piecedetachees/",
    tache: "tache/taches/",
  };
});

// Initialisation de useCrud
const {
  items: documents,
  actionItemApi,
  error401Message,
  errorMessage,
} = useCrud<Document>(`${baseEndpoints.value[props.modelType]}`);

// Etat
const loading = ref(false);
const addingDocument = ref(false);
const isDragover = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Nouveaux documents
const newLink = ref({
  name: "",
  url: "",
});

const newFile = ref({
  name: "",
  description: "",
  file: null as File | null,
});

// Charger les documents
const fetchDocuments = async () => {
  try {
    loading.value = true;
    // Utilisation de actionItemApi pour la route spécifique
    const response = await actionItemApi(
      props.modelId as number,
      "list_documents",
      "get"
    );
    documents.value = response;
  } catch (error) {
    console.error("Erreur API:", error);
  } finally {
    loading.value = false;
  }
};

// Ajouter un document (lien ou fichier)
const addDocument = async (documentData: FormData | object) => {
  try {
    addingDocument.value = true;
    await actionItemApi(props.modelId as number, "add_document", "post", documentData);

    await fetchDocuments();
  } catch (error) {
    console.error("Erreur API:", error);
  } finally {
    addingDocument.value = false;
  }
};

const addLink = async () => {
  const linkData = {
    name: newLink.value.name,
    document_type: "link",
    link: newLink.value.url,
  };

  await addDocument(linkData);
  resetLinkForm();
  $("#addLinkModal").modal("hide");
};

// Ajouter un fichier
const addFile = async () => {
  if (!newFile.value.file) return;

  const formData = new FormData();
  formData.append("name", newFile.value.name);
  formData.append("document_type", "file");
  formData.append("file", newFile.value.file);

  if (newFile.value.description) {
    formData.append("description", newFile.value.description);
  }

  await addDocument(formData);
  resetFileForm();
  $("#addFileModal").modal("hide");
};

// Supprimer un document
const deleteDocument = async (documentId: number) => {
  try {
    await actionItemApi(
      props.modelId as number,
      `delete_document/${documentId}`,
      "delete"
    );
    await fetchDocuments();
  } catch (error) {
    console.error("Erreur API:", error);
  }
};

// Confirmation de suppression
const confirmDeleteDocument = (documentId: number) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
    deleteDocument(documentId);
  }
};

// Gestion des fichiers
const handleDragOver = () => {
  isDragover.value = true;
};

const handleDragLeave = () => {
  isDragover.value = false;
};

const handleDrop = (e: DragEvent) => {
  isDragover.value = false;
  if (e.dataTransfer?.files.length) {
    newFile.value.file = e.dataTransfer.files[0];
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.length) {
    newFile.value.file = target.files[0];
  }
};

// Réinitialiser les formulaires
const resetLinkForm = () => {
  newLink.value = { name: "", url: "" };
};

const resetFileForm = () => {
  newFile.value = { name: "", description: "", file: null };
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const truncateLink = (link: string, maxLength = 40) => {
  return link.length > maxLength ? link.substring(0, maxLength) + "..." : link;
};

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

// Initialisation
onMounted(fetchDocuments);
</script>

<template>
  <div class="document-manager">
    <ErrorMessage
      v-if="errorMessage"
      :errorMessage="errorMessage"
      :error401Message="error401Message"
      :clearError="clearError"
    />
    <!-- Boutons d'ajout -->
    <div class="d-flex justify-content-end mb-3">
      <button
        type="button"
        data-toggle="modal"
        data-target="#addLinkModal"
        class="btn btn-primary mr-2"
      >
        <i class="fe fe-link fe-16 mr-2"></i>Ajouter un lien
      </button>
      <button
        type="button"
        data-toggle="modal"
        data-target="#addFileModal"
        class="btn btn-primary"
      >
        <i class="fe fe-file fe-16 mr-2"></i>Ajouter un document
      </button>
    </div>

    <!-- Liste des documents -->
    <div class="row">
      <template v-if="loading">
        <div class="col-12 text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Chargement...</span>
          </div>
        </div>
      </template>

      <template v-else-if="documents?.length === 0">
        <div class="col-12 text-center my-4">
          <p class="text-muted">Aucun document disponible</p>
        </div>
      </template>

      <template v-else>
        <div v-for="document in documents" :key="document?.id" class="col-md-12 mb-4">
          <!-- Affichage Fichier -->
          <div v-if="document.document_type === 'file'" class="card shadow h-100">
            <div class="card-body file-list">
              <div class="d-flex align-items-center">
                <div class="circle circle-md bg-secondary">
                  <i class="fe fe-file fe-16 text-white"></i>
                </div>
                <div class="flex-fill ml-4 fname">
                  <strong>{{ document.file_name }} </strong>
                  <strong v-if="document.name">: {{ document.name }}</strong
                  ><br />
                  <span class="badge badge-light text-muted">
                    {{ formatDateTime(document.created_at) }}
                  </span>
                  -
                  <span class="badge badge-light text-muted">
                    {{ formatFileSize(document.file_size) }}
                  </span>
                  <p v-if="document.description" class="mt-2">
                    &#10148; {{ document.description }}
                  </p>
                </div>
                <div class="mr-3">
                  <a
                    v-if="props.modelType !== 'tache'"
                    :href="document.file_url"
                    class="btn btn-sm btn-outline-success"
                    target="_blank"
                  >
                    Prévisualiser
                  </a>
                </div>
                <div class="mr-3">
                  <a
                    v-if="props.modelType !== 'tache'"
                    :href="document.download_url"
                    class="btn btn-sm btn-outline-primary"
                    :download="document.file_name || document.name"
                  >
                    <i class="fe fe-download fe-12 mr-1"></i>Télécharger
                  </a>
                </div>
                <div class="file-action">
                  <button
                    type="button"
                    class="btn btn-link dropdown-toggle more-vertical p-0 text-muted mx-auto"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span class="text-muted sr-only">Action</span>
                  </button>
                  <div class="dropdown-menu m-2">
                    <a
                      v-if="props.modelType === 'tache'"
                      :href="document.file_url"
                      class="dropdown-item"
                      target="_blank"
                      ><i class="fe fe-navigation fe-12 mr-4"></i>
                      Prévisualiser
                    </a>
                    <a
                      class="dropdown-item text-danger"
                      href="#"
                      @click.prevent="confirmDeleteDocument(document.id)"
                    >
                      <i class="fe fe-delete fe-12 mr-4"></i>Supprimer
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Affichage Lien -->
          <div v-else class="card shadow h-100">
            <div class="card-body file-list">
              <div class="d-flex align-items-center">
                <div class="circle circle-md bg-secondary">
                  <i class="fe fe-link fe-16 text-white"></i>
                </div>
                <div class="flex-fill ml-4 fname">
                  <strong>{{ document.name }}</strong> <br />
                  <a :href="document.link" class="lien">
                    {{ truncateLink(document.link) }} </a
                  ><br />
                  <span class="badge badge-light text-muted">
                    {{ formatDateTime(document.created_at) }}
                  </span>
                </div>
                <div class="mr-3">
                  <a
                    v-if="props.modelType !== 'tache'"
                    :href="document.link"
                    class="btn btn-sm btn-outline-success"
                    target="_blank"
                  >
                    Ouvrir dans un nouvel onglet
                  </a>
                </div>
                <div class="file-action">
                  <button
                    type="button"
                    class="btn btn-link dropdown-toggle more-vertical p-0 text-muted mx-auto"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span class="text-muted sr-only">Action</span>
                  </button>
                  <div class="dropdown-menu m-2">
                    <a
                      v-if="props.modelType === 'tache'"
                      :href="document.link"
                      class="dropdown-item"
                      target="_blank"
                    >
                      <i class="fe fe-maximize-2 fe-12 mr-4"></i>Ouvrir dans un nouvel
                      onglet
                    </a>
                    <a
                      class="dropdown-item text-danger"
                      href="#"
                      @click.prevent="confirmDeleteDocument(document.id)"
                    >
                      <i class="fe fe-delete fe-12 mr-4"></i>Supprimer
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Ajout Lien -->
    <div
      class="modal fade"
      id="addLinkModal"
      tabindex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ajout de lien</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addLink">
              <div class="form-group">
                <label class="col-form-label">Nom du lien:</label>
                <input type="text" class="form-control" v-model="newLink.name" required />
              </div>
              <div class="form-group">
                <label class="col-form-label">URL du lien:</label>
                <input
                  type="url"
                  class="form-control"
                  v-model="newLink.url"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" :disabled="addingDocument">
                  <span
                    v-if="addingDocument"
                    class="spinner-border spinner-border-sm"
                  ></span>
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajout Fichier -->
    <div
      class="modal fade"
      id="addFileModal"
      tabindex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ajout de fichier</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addFile">
              <div class="form-group">
                <label class="col-form-label">Nom du fichier:</label>
                <input type="text" class="form-control" v-model="newFile.name" required />
              </div>
              <div class="form-group">
                <label class="col-form-label">Description:</label>
                <input type="text" class="form-control" v-model="newFile.description" />
              </div>
              <div class="d-flex justify-content-center">
                <div class="card shadow mb-4 w-100">
                  <div class="card-header"><strong>Fichier</strong></div>
                  <div class="card-body">
                    <div
                      class="upload-frame"
                      :class="{ 'is-dragover': isDragover }"
                      @dragover.prevent="handleDragOver"
                      @dragleave="handleDragLeave"
                      @drop.prevent="handleDrop"
                      @click="triggerFileInput"
                    >
                      <div v-if="!newFile.file" class="default-message text-center">
                        <i class="fe fe-file-plus fe-24"></i>
                        <p>
                          Glisser-déposer votre fichier ici ou cliquer pour sélectionner
                        </p>
                      </div>
                      <div v-else class="file-selected text-center">
                        <i class="fe fe-file fe-24 text-success"></i>
                        <p class="mt-2">{{ newFile.file.name }}</p>
                        <p class="text-muted small">
                          {{ formatFileSize(newFile.file.size) }}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref="fileInput"
                      class="d-none"
                      @change="handleFileChange"
                    />
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">
                  Annuler
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!newFile.file || addingDocument"
                >
                  <span
                    v-if="addingDocument"
                    class="spinner-border spinner-border-sm"
                  ></span>
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-frame {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-frame.is-dragover {
  border-color: #4e73df;
  background-color: rgba(78, 115, 223, 0.1);
}

.default-message i {
  font-size: 48px;
  color: #6c757d;
  margin-bottom: 10px;
}

.file-selected i {
  color: #28a745;
}

.lien {
  word-break: break-all;
  color: #6dc2ff;
}
</style>

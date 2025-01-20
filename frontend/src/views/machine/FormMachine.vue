<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useCrud } from "@/composables/useCrud";
import useVuelidate from "@vuelidate/core";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { required } from "@vuelidate/validators";
import { PieceDetachee } from "@/types/PieceDetacheType";
import { Machine, MachineRelation, Marque, Status, Type } from "@/types/MachineType";
import { Atelier, Chaine } from "@/types/AtelierType";
import { Fournisseur } from "@/types/FournisseurType";
import { IdentifiantStatusMachine } from "@/config/statusConfig";
import { useRoute, useRouter } from "vue-router";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

const selectedPieces = ref<PieceDetachee[]>([]);
const machinesLiees = ref<MachineRelation[]>([]);

const piecesOptions = ref<PieceDetachee[]>([]);
const machinesOptions = ref<Machine[]>([]);

const router = useRouter();
const route = useRoute();
const machineId = route.params.id; //en cas de modification

// Fonction pour ajouter une nouvelle formulaire machine liée
const addMachineLiaison = () => {
  machinesLiees.value.push({ machine_liee: null, quantite: null });
};

const form = reactive<Machine>({
  id: 0,
  nom_machine: "",
  numero_machine: "",
  numero_de_serie: "",
  type_id: null,
  atelier_id: null,
  identifiant_status_machine: IdentifiantStatusMachine.enService,
  date_creation: null,
});

const validation = {
  nom_machine: { required },
  numero_machine: { required },
  numero_de_serie: { required },
  type_id: { required },
  atelier_id: { required },
};

const v$ = useVuelidate(validation, form);

const types = useCrud<Type>("machine/types/");
const marques = useCrud<Marque>("machine/marques/");
const ateliers = useCrud<Atelier>("atelier/ateliers/");
const chaines = useCrud<Chaine>("atelier/chaines/");
const status = useCrud<Status>("machine/status/");
const fournisseurs = useCrud<Fournisseur>("fournisseur/fournisseurs/");
const piecedetachees = useCrud<PieceDetachee>("piece/piecedetachees/", v$);
const machines = useCrud<Machine>("machine/machines/", v$);
const machineRelation = useCrud<MachineRelation>("machine/machine_relation/", v$);

const filteredChaines = computed(() => {
  if (!form.atelier_id) {
    return [];
  }
  return chaines.items.value.filter((chaine) => chaine.atelier_id === form.atelier_id);
});

const errorMessage = machines.errorMessage;
const error401Message = machines.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

//Pour l`ulpoad d`image
const image = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const formError = ref<HTMLElement | null>(null);
//Ajouter un nouveau machine
const submitForm = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    const formData = new FormData();
    formData.append("nom_machine", form.nom_machine);
    formData.append("numero_machine", form.numero_machine);
    formData.append("numero_de_serie", form.numero_de_serie);
    formData.append("numero_de_moteur", String(form.numero_de_moteur || ""));
    formData.append("description", form.description || "");
    formData.append("type_id", String(form.type_id || ""));
    formData.append("marque_id", String(form.marque_id || ""));
    formData.append("atelier_id", String(form.atelier_id || ""));
    formData.append("chaine_id", String(form.chaine_id || ""));
    formData.append("date_mis_en_place", String(form.date_mis_en_place || ""));
    formData.append("date_acquisition", String(form.date_acquisition || ""));
    formData.append(
      "identifiant_status_machine",
      String(form.identifiant_status_machine)
    );
    formData.append("date_hors_service", String(form.date_hors_service || ""));
    formData.append("reference_fabricant", String(form.reference_fabricant || ""));
    formData.append("fournisseur_id", String(form.fournisseur_id || ""));
    selectedPieces.value.forEach((piece) => {
      formData.append("pieces_detachees_id", String(piece.id) || "");
    });

    if (fileInput.value?.files?.[0]) {
      // Si il y a une nouvelle image
      formData.append("image", fileInput.value.files[0] || "");
    }
    if (image.value === null) {
      formData.append("image", "");
    }

    const validMachinesLiees = machinesLiees.value.filter(
      (machine) => machine.machine_liee?.id
    );

    if (machineId) {
      // Si c'est une modification
      await machines.updateItem(Number(machineId), formData);
      for (const machine of validMachinesLiees) {
        await machineRelation.addItem({
          machine_principale: Number(machineId),
          machine_liee_id: machine?.machine_liee?.id,
          quantite: machine?.quantite,
        });
      }
      if (!errorMessage.value) {
        router.push("/detailMachine/" + machineId);
      }
    } else {
      // Si c'est un ajout
      const createdMachine = await machines.addItem(formData);
      const newMachineId = createdMachine?.id;
      for (const machine of validMachinesLiees) {
        await machineRelation.addItem({
          machine_principale: newMachineId,
          machine_liee_id: machine?.machine_liee?.id,
          quantite: machine?.quantite,
        });
      }
      if (!errorMessage.value) {
        router.push("/listeMachine");
      }
    }
  } else {
    console.error("Formulaire invalide");
    formError.value?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest", // Positionne horizontalement de façon la plus proche
    });
  }
};

// Fonction pour déclencher le clic sur le input file
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement; //acceder a la liste des fichiers
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      //lue en base64
      image.value = e.target?.result as string;
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

const machine = ref<Machine | null>(null);

onMounted(async () => {
  // Si en mode modification
  if (machineId) {
    await machines.fetchItemsById(Number(machineId));
    machine.value = machines.items.value[0];
    Object.assign(form, machine.value); // preremplir les formulaires
    image.value = machine.value.image;

    selectedPieces.value = machine?.value.pieces_detachees ?? [];
  }
  await Promise.all([
    await piecedetachees.fetchItems(),
    (piecesOptions.value = piecedetachees.items.value),
    await machines.fetchItems(),
    (machinesOptions.value = machines.items.value),
    types.fetchItems(),
    marques.fetchItems(),
    ateliers.fetchItems(),
    chaines.fetchItems(),
    status.fetchItems(),
    fournisseurs.fetchItems(),
  ]);
});
</script>

<template>
  <SectionNavigation />

  <div class="row">
    <div class="col-md-8">
      <h2 class="page-title">
        {{ machineId ? "Modification de machine" : "Créer un nouveau machine" }}
      </h2>
    </div>
  </div>

  <p>
    Utilisé dans l'industrie du textile pour la fabrication, le traitement ou l'assemblage
    de tissus et de vêtements.
  </p>

  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />

  <div class="row">
    <div class="col-md-12">
      <div class="card shadow mb-4">
        <div class="card-header">
          <strong class="card-title"></strong
          >{{ machineId ? "Modifier le machine" : "Ajouter un machine " }}
          (* champ obligatoire)
        </div>
        <div class="card-body" ref="formError">
          <form @submit.prevent="submitForm">
            <div class="d-flex justify-content-center">
              <div class="card shadow mb-4">
                <div class="card-header"><strong>Image du machine</strong></div>
                <div class="card-body">
                  <span
                    v-if="image"
                    class="circle circle-sm bg-danger justify-content-center"
                    @click="removeImage"
                    style="float: right"
                  >
                    <i class="material-icons notranslate text-white">delete</i>
                  </span>
                  <div
                    id="drag-drop-area"
                    class="upload-frame"
                    @dragover.prevent
                    @click="triggerFileInput"
                  >
                    <div v-if="!image" class="default-message text-center">
                      <i class="material-icons notranslate">handyman</i>
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
              <label for="numero_machine">Numéro de la machine*</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  id="numero_machine"
                  placeholder="1"
                  v-model="form.numero_machine"
                  :class="{
                    'is-invalid': v$.numero_machine.$invalid && v$.numero_machine.$dirty,
                  }"
                />
              </div>
              <span v-if="v$.numero_machine.$error" class="error"
                >Numéro de machine requis.</span
              >
            </div>
            <div class="form-row">
              <div class="form-group col-md-8">
                <label for="nom_machine">Nom du machine*</label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    id="nom_machine"
                    placeholder="Nom du machine"
                    v-model="form.nom_machine"
                    :class="{
                      'is-invalid': v$.nom_machine.$invalid && v$.nom_machine.$dirty,
                    }"
                  />
                </div>
                <span v-if="v$.nom_machine.$error" class="error"
                  >Nom de machine requis.</span
                >
              </div>
              <div class="form-group col-md-4">
                <label for="marque">Marque:</label>
                <select
                  id="marque"
                  class="form-control custom-select"
                  v-model="form.marque_id"
                >
                  <option selected disabled>Sélectionner une marque</option>
                  <option
                    v-for="marque in marques.items.value"
                    :key="marque.id"
                    :value="marque.id"
                  >
                    {{ marque.nom_marque }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="num_serie">Numéro de série*</label>
                <input
                  type="text"
                  class="form-control"
                  id="num_serie"
                  placeholder="8 DOMA 04475"
                  v-model="form.numero_de_serie"
                  :class="{
                    'is-invalid':
                      v$.numero_de_serie.$invalid && v$.numero_de_serie.$dirty,
                  }"
                />
                <span v-if="v$.numero_de_serie.$error" class="error"
                  >Numéro de série requis.</span
                >
              </div>
              <div class="form-group col-md-6">
                <label for="num_moteur">Numéro de moteur</label>
                <input
                  type="text"
                  class="form-control"
                  id="num_moteur"
                  placeholder=""
                  v-model="form.numero_de_moteur"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="type">Type*:</label>
              <select
                id="type"
                class="form-control custom-select"
                v-model="form.type_id"
                :class="{ 'is-invalid': v$.type_id.$invalid && v$.type_id.$dirty }"
              >
                <option selected disabled>Sélectionner un type</option>
                <option v-for="type in types.items.value" :key="type.id" :value="type.id">
                  {{ type.nom_type }}
                </option>
              </select>
              <span v-if="v$.type_id.$error" class="error">Type requis.</span>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                class="form-control"
                id="description"
                v-model="form.description"
                rows="4"
              ></textarea>
            </div>

            <div class="form-row">
              <div
                class="form-group"
                :class="[filteredChaines.length > 0 ? 'col-md-6' : 'col-md-12']"
              >
                <label for="atelier">Atelier*:</label>
                <select
                  id="atelier"
                  class="form-control custom-select"
                  v-model="form.atelier_id"
                  :class="{
                    'is-invalid': v$.atelier_id.$invalid && v$.atelier_id.$dirty,
                  }"
                >
                  <option selected disabled>Sélectionner un atelier</option>
                  <option
                    v-for="atelier in ateliers.items.value"
                    :key="atelier.id"
                    :value="atelier.id"
                  >
                    {{ atelier.nom_atelier }}
                  </option>
                </select>
                <span v-if="v$.atelier_id.$error" class="error">Atelier requis.</span>
              </div>
              <div
                v-if="form.atelier_id && filteredChaines.length > 0"
                class="form-group col-md-6"
              >
                <label for="chaine">Chaine:</label>
                <select
                  id="chaine"
                  class="form-control custom-select"
                  v-model="form.chaine_id"
                >
                  <option selected disabled>Sélectionner le chaine correspondant</option>
                  <option
                    v-for="chaine in filteredChaines"
                    :key="chaine.id"
                    :value="chaine.id"
                  >
                    {{ chaine.nom_chaine }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="date_acquisition">Date d'acquisition</label>
                <input
                  class="form-control"
                  id="date_acquisition"
                  type="date"
                  v-model="form.date_acquisition"
                />
              </div>
              <div class="form-group col-md-6">
                <label for="date_mis_en_place">Date de mis en place</label>
                <input
                  class="form-control"
                  id="date_mis_en_place"
                  type="date"
                  v-model="form.date_mis_en_place"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="status">Statut*</label>
                <select
                  id="status"
                  class="form-control custom-select"
                  v-model="form.identifiant_status_machine"
                >
                  <option selected disabled>Sélectionner le statut</option>
                  <option
                    v-for="status in status.items.value"
                    :key="status.id"
                    :value="status.identifiant"
                  >
                    {{ status.nom_status }}
                  </option>
                </select>
              </div>
              <div class="form-group col-md-6">
                <label for="date_hors_service">Date hors service</label>
                <input
                  class="form-control"
                  id="date_hors_service"
                  type="date"
                  v-model="form.date_hors_service"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="reference">Référence fabricant</label>
                <input
                  type="text"
                  class="form-control"
                  id="reference"
                  v-model="form.reference_fabricant"
                />
              </div>
              <div class="form-group col-md-6">
                <label for="fournisseur">Fournisseur:</label>
                <select
                  id="fournisseur5"
                  class="form-control"
                  v-model="form.fournisseur_id"
                >
                  <option selected disabled>Sélectionner un fournisseur</option>
                  <option
                    v-for="fournisseur in fournisseurs.items.value"
                    :key="fournisseur.id"
                    :value="fournisseur.id"
                  >
                    {{ fournisseur.nom_fournisseur }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="piecedetache">Pièce détachée liée(s):</label>
              <multiselect
                v-model="selectedPieces"
                :options="piecesOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Sélectionnez le(s) pièce(s) détachée(s)"
                label="nom_piecedetache"
                track-by="id"
                id="piecedetache"
              >
                <template #option="{ option }">
                  <div class="option-item">
                    <img :src="option.image" alt="image" class="option-icon" />
                    <span>{{ option.nom_piecedetache }}</span>
                  </div>
                </template>
              </multiselect>
            </div>

            <p style="font-style: italic">
              Ajouter un machine liée
              <span
                class="circle circle-sm bg-danger justify-content-center text-white ml-2"
                @click="addMachineLiaison"
              >
                <i class="fe fe-plus-circle fe-16"></i>
              </span>
            </p>

            <div
              class="form-row mb-2"
              v-for="(machine, index) in machinesLiees"
              :key="index"
            >
              <div class="form-group col-md-8">
                <label for="machine_liee">Machine liée</label>
                <multiselect
                  v-model="machine.machine_liee"
                  :options="machinesOptions"
                  :close-on-select="false"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Sélectionnez les options"
                  label="nom_machine"
                  track-by="id"
                  id="machine_liee"
                >
                  <template #option="{ option }">
                    <div class="option-item">
                      <img :src="option.image" alt="image" class="option-icon" />
                      <span>{{ option.nom_machine }}</span>
                    </div>
                  </template>
                </multiselect>
              </div>
              <div class="form-group col-md-4">
                <label for="quantite">Quantite</label>
                <input
                  style="height: 40px"
                  type="number"
                  :min="0"
                  v-model="machine.quantite"
                  class="form-control"
                  id="quantite"
                  placeholder="1"
                />
              </div>
            </div>

            <button v-if="machineId" type="submit" class="btn mb-2 mt-4 btn-primary">
              <span class="fe fe-edit-2 fe-16 mr-2"></span>Modifier le machine
            </button>
            <button v-else type="submit" class="btn mb-2 mt-4 btn-primary">
              <span class="fe fe-plus fe-16 mr-2"></span>Créer un machine
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  width: 13rem;
  height: 13rem;
  border-radius: 10px;
}

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

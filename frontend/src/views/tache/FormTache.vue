<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import useVuelidate from "@vuelidate/core";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import {
  required,
  helpers,
  minLength,
  minValue,
  maxValue,
  integer,
} from "@vuelidate/validators";
import { Machine } from "@/types/MachineType";
import { useRoute, useRouter } from "vue-router";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import { MotifTache, Tache } from "@/types/TacheType";
import { formatLocalDate, getNextHour } from "@/composables/useFonction";
import { IdentifiantStatusTache } from "@/config/statusConfig";
import { Responsable } from "@/types/AtelierType";
import { useNotificationStore } from "@/stores/notificationStore";

const notificationStore = useNotificationStore();

const selectedMachine = ref<Machine>();

const machinesOptions = ref<Machine[]>([]);

const router = useRouter();
const route = useRoute();
const tacheId = route.params.id; //en cas de modification
const machineId = ref(route.params.machineId); //insertion tache machine

const isAllDay = ref(false);

//gestion loading
const loadingButton = ref(false);

const now = new Date();
const currentDate = ref(formatLocalDate(now));
const currentTime = ref(
  `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
    2,
    "0"
  )}`
);
const nextTime = ref(getNextHour());

const form = reactive<Tache>({
  nom_tache: "",
  description: "",
  date_debut: currentDate.value,
  heure_debut: currentTime.value,
  date_fin: currentDate.value,
  heure_fin: nextTime.value,
  temps_maintenance_heure: 0,
  temps_maintenance_minute: 0,
  temps_arret_heure: 0,
  temps_arret_minute: 0,
  identifiant_status_tache: IdentifiantStatusTache.planifiee,
});

onMounted(() => {
  const query = route.query;
  if (query.date_debut) {
    form.date_debut = query.date_debut as string;
  }
  if (query.heure_debut) {
    form.heure_debut = query.heure_debut as string;
  }
  if (query.date_fin) {
    form.date_fin = query.date_fin as string;
  }
  if (query.heure_fin) {
    form.heure_fin = query.heure_fin as string;
  }
});

const validation = {
  nom_tache: {
    required: helpers.withMessage("Champ obligatoire. ", required),
    minLength: helpers.withMessage(
      "Le nom doit contenir minimum 2 caractères.",
      minLength(2)
    ),
  },
  description: {
    required: helpers.withMessage("Champ obligatoire. ", required),
    minLength: helpers.withMessage(
      "La description doit contenir minimum 5 caractères.",
      minLength(5)
    ),
  },
  date_debut: { required: helpers.withMessage("Champ obligatoire. ", required) },
  heure_debut: {
    required: !isAllDay.value
      ? helpers.withMessage("Champ obligatoire. ", required)
      : null,
  },
  date_fin: {
    required: helpers.withMessage("Champ obligatoire. ", required),
    isAfterOrEqualToDateDebut: helpers.withMessage(
      "La date de fin doit être égale ou postérieure à la date de début. ",
      (value) => !form.date_debut || value >= form.date_debut
    ),
  },
  heure_fin: {
    required: !isAllDay.value
      ? helpers.withMessage("Champ obligatoire. ", required)
      : null,
    isAfterOrEqualToHeureDebut: helpers.withMessage(
      "L'heure de fin doit être postérieure à l'heure de début.",
      (value) => {
        if (isAllDay.value || !form.date_debut || !form.date_fin) return true;
        if (form.date_debut === form.date_fin) {
          return form.heure_debut < value;
        }
        return true;
      }
    ),
  },
  temps_maintenance_heure: {
    integer: helpers.withMessage("Veuillez entrer un entier. ", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative. ",
      minValue(0)
    ),
    maxValue: helpers.withMessage(
      "Doit être inférieur ou égal à 99999. ",
      maxValue(99999)
    ),
  },
  temps_maintenance_minute: {
    integer: helpers.withMessage("Veuillez entrer un entier. ", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative. ",
      minValue(0)
    ),
    maxValue: helpers.withMessage("Doit être inférieur ou égal à 59. ", maxValue(59)),
  },
  temps_arret_heure: {
    integer: helpers.withMessage("Veuillez entrer un entier. ", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative. ",
      minValue(0)
    ),
    maxValue: helpers.withMessage(
      "Doit être inférieur ou égal à 99999. ",
      maxValue(99999)
    ),
  },
  temps_arret_minute: {
    integer: helpers.withMessage("Veuillez entrer un entier. ", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative. ",
      minValue(0)
    ),
    maxValue: helpers.withMessage("Doit être inférieur ou égal à 59. ", maxValue(59)),
  },
};

const validationMachine = { selectedMachine: { required } };
const v$ = useVuelidate(validation, form);
const v$2 = useVuelidate(validationMachine, { selectedMachine });

const machines = useCrud<Machine>("machine/machines/", v$);
const tacheCrud = useCrud<Tache>("tache/taches/", v$);
const motifTacheCrud = useCrud<MotifTache>("tache/motif_taches/", v$);

//Gestion responsable
const responsables = useCrud<Responsable>("atelier/responsables/", v$);
const selectedResponsables = ref<Responsable[]>([]);
const responsablesOptions = ref<Responsable[]>([]);

const envoyerEmail = ref(false);

const errorMessage = machines.errorMessage;
const error401Message = machines.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const formError = ref<HTMLElement | null>(null);

//Ajouter un nouveau tache
const submitForm = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    loadingButton.value = true;
    const formData = new FormData();
    formData.append("machine_id", String(selectedMachine?.value?.id));
    formData.append("nom_tache", form.nom_tache);
    formData.append("description", form.description);
    formData.append("motif_tache_id", String(form.motif_tache_id || ""));
    formData.append("date_debut", String(form.date_debut));
    formData.append("date_fin", String(form.date_fin));

    const now = new Date();
    const dateFin = new Date(form.date_fin);
    const heureFin = form.heure_fin
      ? new Date(`${form.date_fin}T${form.heure_fin}`)
      : null;

    // Mettre à jour le statut en fonction des dates
    if (!isAllDay.value && dateFin < now && heureFin && heureFin < now) {
      form.identifiant_status_tache = IdentifiantStatusTache.enRetard;
    } else {
      form.identifiant_status_tache = IdentifiantStatusTache.planifiee;
    }

    formData.append("identifiant_status_tache", String(form.identifiant_status_tache));
    formData.append("heure_debut", !isAllDay.value ? String(form.heure_debut || "") : "");
    formData.append("heure_fin", !isAllDay.value ? String(form.heure_fin || "") : "");
    formData.append("temps_maintenance_heure", String(form.temps_maintenance_heure || 0));
    formData.append(
      "temps_maintenance_minute",
      String(form.temps_maintenance_minute || 0)
    );
    formData.append("temps_arret_heure", String(form.temps_arret_heure || 0));
    formData.append("temps_arret_minute", String(form.temps_arret_minute || 0));

    selectedResponsables.value.forEach((resp) => {
      formData.append("responsable_ids", String(resp.id) || "");
    });

    formData.append("envoyer_email", envoyerEmail.value ? "t" : "f");

    if (tacheId) {
      // Si c'est une modification
      await tacheCrud.updateItem(Number(tacheId), formData);
      if (!errorMessage.value) {
        router.push("/detailTache/" + tacheId);
      }
    } else {
      // Si c'est un ajout
      const createdTache = await tacheCrud.addItem(formData);
      const newTacheId = Number(createdTache?.id);
      if (!errorMessage.value) {
        router.push("/detailTache/" + newTacheId);
      }
    }

    loadingButton.value = false;
    notificationStore.fetchNotifications();
  } else {
    console.error("Formulaire invalide");
    formError.value?.scrollIntoView({ behavior: "smooth", inline: "nearest" });
  }
};

const tache = ref<Tache | null>(null);

onMounted(async () => {
  // Si en mode modification
  if (tacheId) {
    await tacheCrud.fetchItemsById(Number(tacheId));
    tache.value = tacheCrud.items.value[0];
    Object.assign(form, tache.value); // preremplir les formulaires
    form.heure_debut = tache?.value.heure_debut
      ? tache?.value.heure_debut
      : currentTime.value;
    form.heure_fin = tache?.value.heure_fin ? tache?.value.heure_fin : nextTime.value;
    selectedMachine.value = tache?.value.machine;
    selectedResponsables.value = tache?.value.responsables ?? [];
  }

  if (machineId.value) {
    await machines.fetchItemsById(Number(machineId.value));
    selectedMachine.value = machines.items.value[0];
  }

  await Promise.all([
    await machines.fetchItems(),
    (machinesOptions.value = machines.items.value),
    await responsables.fetchItems(),
    (responsablesOptions.value = responsables.items.value),
    await motifTacheCrud.fetchItems(),
  ]);
});
</script>

<template>
  <SectionNavigation />

  <div class="row mb-4">
    <div class="col-md-8">
      <h2 class="page-title">
        {{ tacheId ? "Modification de tâche" : " Créer une nouvelle tâche" }}
      </h2>
    </div>
  </div>

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
          <strong class="card-title">
            {{ tacheId ? "Modifier la tâche" : " Ajouter une nouvelle tâche" }} (* champ
            obligatoire)
          </strong>
        </div>
        <div class="card-body" ref="formError">
          <form @submit.prevent="submitForm">
            <div class="card-body fils">
              <div class="form-group">
                <label for="machine">Equipement*:</label>
                <multiselect
                  v-model="selectedMachine"
                  :options="machinesOptions"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :class="{
                    'is-invalid': v$2.selectedMachine.$invalid,
                  }"
                  placeholder="Sélectionnez un équipement"
                  label="nom_machine"
                  search-by="numero_de_serie"
                  track-by="id"
                  id="machine"
                >
                  <template #option="{ option }">
                    <div class="option-item">
                      <img :src="option.image" alt="image" class="option-icon" />
                      <span class="mr-2">{{ option.nom_machine }}</span>
                      <span>({{ option.numero_de_serie }})</span>
                    </div>
                  </template>
                </multiselect>

                <span v-if="v$2.selectedMachine.$invalid" class="error"
                  >Selectionner un équipement.</span
                >
              </div>
            </div>

            <div class="card-body fils">
              <h4 class="card-title mb-3">A propos de la tâche</h4>
              <div class="form-group" style="margin-bottom: 2rem">
                <label for="nom_tache">Nom de la tache*</label>
                <input
                  class="form-control"
                  type="text"
                  id="nom_tache"
                  v-model="form.nom_tache"
                  :class="{
                    'is-invalid': v$.nom_tache.$invalid && v$.nom_tache.$dirty,
                  }"
                />
                <span
                  v-for="error of v$.nom_tache.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
              <div class="form-group">
                <label for="description">Description de la tache*</label>
                <textarea
                  style="height: 107px"
                  class="form-control"
                  id="description"
                  v-model="form.description"
                  :class="{
                    'is-invalid': v$.description.$invalid && v$.description.$dirty,
                  }"
                ></textarea>
                <span
                  v-for="error of v$.description.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
            </div>

            <div class="card-body fils">
              <h4 class="card-title mb-3">Planification</h4>
              <div class="custom-control custom-switch mb-3">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  v-model="isAllDay"
                  id="customSwitch1"
                />
                <label class="custom-control-label" for="customSwitch1"
                  >Toutes la journée</label
                >
              </div>
              <div class="form-row">
                <div class="form-group" :class="[isAllDay ? 'col-md-12' : 'col-md-6']">
                  <label for="date_debut">Date de début*</label>
                  <input
                    class="form-control"
                    id="date_debut"
                    v-model="form.date_debut"
                    type="date"
                    :class="{
                      'is-invalid': v$.date_debut.$invalid && v$.date_debut.$dirty,
                    }"
                  />
                  <span
                    v-for="error of v$.date_debut.$errors"
                    :key="error.$uid"
                    class="error"
                    >{{ error.$message }}</span
                  >
                </div>
                <div v-if="!isAllDay" class="form-group col-md-6">
                  <label for="heure_debut">Heure de début*</label>
                  <input
                    class="form-control"
                    id="heure_debut"
                    v-model="form.heure_debut"
                    :class="{
                      'is-invalid': v$.heure_debut.$invalid && v$.heure_debut.$dirty,
                    }"
                    type="time"
                  />
                  <div v-if="!isAllDay">
                    <span
                      v-for="error in v$.heure_debut.$errors"
                      :key="error.$uid"
                      class="error"
                    >
                      {{ error.$message }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" :class="[isAllDay ? 'col-md-12' : 'col-md-6']">
                  <label for="date_fin">Date de fin*</label>
                  <input
                    class="form-control"
                    id="date_fin"
                    v-model="form.date_fin"
                    type="date"
                    :class="{
                      'is-invalid': v$.date_fin.$invalid && v$.date_fin.$dirty,
                    }"
                  />
                  <span
                    v-for="error of v$.date_fin.$errors"
                    :key="error.$uid"
                    class="error"
                    >{{ error.$message }}</span
                  >
                </div>
                <div v-if="!isAllDay" class="form-group col-md-6">
                  <label for="heure_fin">Heure de fin*</label>
                  <input
                    class="form-control"
                    v-model="form.heure_fin"
                    :class="{
                      'is-invalid': v$.heure_fin.$invalid && v$.heure_fin.$dirty,
                    }"
                    id="heure_fin"
                    type="time"
                  />
                  <div v-if="!isAllDay">
                    <span
                      v-for="error in v$.heure_fin.$errors"
                      :key="error.$uid"
                      class="error"
                    >
                      {{ error.$message }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="temps_maintenance_heure">Temps de maintenance planifié</label>
                <div class="input-group">
                  <input
                    type="number"
                    min="0"
                    v-model="form.temps_maintenance_heure"
                    id="temps_maintenance_heure"
                    class="form-control"
                    placeholder="Estimation de temps nécessaire en heure"
                    aria-describedby="heure"
                    :class="{
                      'is-invalid':
                        v$.temps_maintenance_heure.$invalid &&
                        v$.temps_maintenance_heure.$dirty,
                    }"
                  />
                  <div class="input-group-append">
                    <span class="input-group-text" id="heure">Heure(s)</span>
                  </div>
                </div>
                <span
                  v-for="error of v$.temps_maintenance_heure.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
              <div class="form-group col-md-6">
                <label for="temps_maintenance_minute">&nbsp;</label>
                <div class="input-group">
                  <input
                    type="number"
                    min="0"
                    v-model="form.temps_maintenance_minute"
                    id="temps_maintenance_minute"
                    class="form-control"
                    placeholder="Estimation de temps nécessaire en minute"
                    aria-describedby="heure"
                    :class="{
                      'is-invalid':
                        v$.temps_maintenance_minute.$invalid &&
                        v$.temps_maintenance_minute.$dirty,
                    }"
                  />
                  <div class="input-group-append">
                    <span class="input-group-text" id="heure">Minute(s)</span>
                  </div>
                </div>
                <span
                  v-for="error of v$.temps_maintenance_minute.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
            </div>

            <div class="form-row mb-4">
              <div class="form-group col-md-6">
                <label for="temps_arret_heure">Temps d`arrêt planifié</label>
                <div class="input-group">
                  <input
                    type="number"
                    min="0"
                    v-model="form.temps_arret_heure"
                    id="temps_arret_heure"
                    class="form-control"
                    placeholder="Estimation de temps hors-service en heure"
                    aria-describedby="heure"
                    :class="{
                      'is-invalid':
                        v$.temps_arret_heure.$invalid && v$.temps_arret_heure.$dirty,
                    }"
                  />
                  <div class="input-group-append">
                    <span class="input-group-text" id="heure">Heure(s)</span>
                  </div>
                </div>
                <span
                  v-for="error of v$.temps_arret_heure.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
              <div class="form-group col-md-6">
                <label for="temps_arret_minute">&nbsp;</label>
                <div class="input-group">
                  <input
                    type="number"
                    min="0"
                    v-model="form.temps_arret_minute"
                    id="temps_arret_minute"
                    class="form-control"
                    placeholder="Estimation de temps hors-service en minute"
                    aria-describedby="heure"
                    :class="{
                      'is-invalid':
                        v$.temps_arret_minute.$invalid && v$.temps_arret_minute.$dirty,
                    }"
                  />
                  <div class="input-group-append">
                    <span class="input-group-text" id="heure">Minute(s)</span>
                  </div>
                </div>
                <span
                  v-for="error of v$.temps_arret_minute.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
            </div>

            <div class="card-body fils">
              <div class="form-group">
                <label for="responsable">Responsables assignés à la tâche:</label>
                <multiselect
                  v-model="selectedResponsables"
                  :options="responsablesOptions"
                  :multiple="true"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  placeholder="Sélectionnez les responsables"
                  label="nom_responsable"
                  search-by="nom_responsable"
                  track-by="id"
                  id="responsable"
                >
                  <template #option="{ option }">
                    <div class="option-item">
                      <img
                        v-if="option.photo"
                        :src="option.photo"
                        alt="image"
                        class="option-icon"
                      />
                      <i v-else class="fe fe-24 fe-user mr-4"></i>
                      <span>{{ option.nom_responsable }}</span>
                    </div>
                  </template>
                </multiselect>
              </div>
            </div>

            <div class="form-group">
              <label for="status">Motif de tache</label>
              <select
                id="status"
                class="form-control custom-select"
                v-model="form.motif_tache_id"
              >
                <option selected disabled>Selectionner un motif</option>
                <option
                  v-for="motif in motifTacheCrud.items.value"
                  :key="motif.id"
                  :value="motif.id"
                >
                  {{ motif.nom_motif_tache }}
                </option>
              </select>
            </div>

            <div class="mt-5 mb-3 d-flex align-items-center">
              <i class="material-icons mr-3" style="font-size: 24px">email</i>

              <div class="custom-control custom-switch">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  v-model="envoyerEmail"
                  id="customSwitchEmail"
                />
                <label class="custom-control-label" for="customSwitchEmail">
                  Notifier les assignés de cette tâche par e-mail
                </label>
              </div>
            </div>

            <button
              v-if="tacheId"
              type="submit"
              :disabled="loadingButton"
              class="btn mb-2 mt-4 btn-primary"
            >
              <span v-if="loadingButton" class="spinner-border spinner-border-sm"></span>
              <span class="fe fe-edit-2 fe-16 mr-2"></span>Modifier la tâche
            </button>
            <button
              v-else
              type="submit"
              :disabled="loadingButton"
              class="btn mb-2 mt-4 btn-primary"
            >
              <span v-if="loadingButton" class="spinner-border spinner-border-sm"></span>
              <span class="fe fe-plus fe-16 mr-2"></span>Créer une tache
            </button>
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

.card-body .fils {
  margin-bottom: 2rem;
  border: double;
  border-radius: 10px;
}

.form-control {
  height: 52px;
}

.input-group .form-control {
  height: 40px;
}
</style>

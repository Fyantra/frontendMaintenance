<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { useCrud } from "@/composables/useCrud";
import useVuelidate from "@vuelidate/core";
import {
  integer,
  required,
  helpers,
  minLength,
  minValue,
  maxValue,
  maxLength,
} from "@vuelidate/validators";
import {
  getStatusForTache,
  formatDateAndTimeInWords,
  formatDateTimeLocal,
} from "@/composables/useFonction";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import {
  ActiviteTache,
  ActiviteTachePieceDetachee,
  StatusTache,
  Tache,
} from "@/types/TacheType";
import { useTacheStore } from "@/stores/tacheStore";
import { PieceDetachee } from "@/types/PieceDetacheType";
import { IdentifiantStatusTache } from "@/config/statusConfig";
import ListeActiviteTache from "./ListeActiviteTache.vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

const route = useRoute();
const tachesCrud = useCrud<Tache>("tache/taches/");
const statusTacheCrud = useCrud<StatusTache>("tache/status_taches/");

const errorMessage = tachesCrud.errorMessage;
const error401Message = tachesCrud.error401Message;

const isOpen = ref(false); //pour le multiselect

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const tache = ref<Tache | null>(null);
const tacheStore = useTacheStore();

// Recuperer l'ID de la piece depuis l'URL
const tacheId = route.params.id;

const fetchTacheDetails = async () => {
  try {
    await tacheStore.fetchTaches(Number(tacheId));
    await tachesCrud.fetchItemsById(Number(tacheId));
    tache.value = tachesCrud.items.value[0];
  } catch (err) {
    console.error("Erreur lors du recuperation des details");
  }
};

const isTacheTerminee = computed(
  () => tache.value?.identifiant_status_tache === IdentifiantStatusTache.termine
);
const isTacheAnnulee = computed(
  () => tache.value?.identifiant_status_tache === IdentifiantStatusTache.annulee
);

const terminerTache = async () => {
  if (confirm("Êtes-vous sûr de vouloir marquer cette tâche comme terminée ?")) {
    await tachesCrud.updateItemPatch(tache.value.id, {
      identifiant_status_tache: IdentifiantStatusTache.termine,
    });
    fetchTacheDetails();
  }
};

const annulerTache = async () => {
  if (confirm("Êtes-vous sûr de vouloir annuler cette tâche ?")) {
    await tachesCrud.updateItemPatch(tache.value.id, {
      identifiant_status_tache: IdentifiantStatusTache.annulee,
    });
    fetchTacheDetails();
  }
};

const nonTerminerTache = async () => {
  await tachesCrud.updateItemPatch(tache.value.id, {
    identifiant_status_tache: IdentifiantStatusTache.planifiee,
  });
  fetchTacheDetails();
};

const retablirTache = async () => {
  await tachesCrud.updateItemPatch(tache.value.id, {
    identifiant_status_tache: IdentifiantStatusTache.planifiee,
  });
  fetchTacheDetails();
};

const now = new Date();
const currentDate = ref(formatDateTimeLocal(now));

const form = reactive<ActiviteTache>({
  description: "",
  date_realisation: currentDate.value,
  temps_passe_heure: 0,
  temps_passe_minute: 0,
});

const validation = {
  description: {
    required: helpers.withMessage("Champ obligatoire. ", required),
    minLength: helpers.withMessage(
      "La description doit contenir minimum 5 caractères.",
      minLength(5)
    ),
    maxLength: helpers.withMessage(
      "La description doit contenir maximum 2000 caractères.",
      maxLength(2000)
    ),
  },
  date_realisation: { required: helpers.withMessage("Champ obligatoire. ", required) },
  temps_passe_heure: {
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
  temps_passe_minute: {
    integer: helpers.withMessage("Veuillez entrer un entier. ", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative. ",
      minValue(0)
    ),
    maxValue: helpers.withMessage("Doit être inférieur ou égal à 59. ", maxValue(59)),
  },
};

const v$ = useVuelidate(validation, form);

const activiteTacheCrud = useCrud<ActiviteTache>("tache/activites_taches/", v$);
const activitePieceDetacheeCrud = useCrud<ActiviteTachePieceDetachee>(
  "tache/activites_piecedetachees/",
  v$
);
const piecedetacheesCrud = useCrud<PieceDetachee>("piece/piecedetachees/", v$);

const activitePieceDetachee = ref<ActiviteTachePieceDetachee[]>([]);
const piecesOptions = ref<PieceDetachee[]>([]);

type ValidationType = ReturnType<typeof useVuelidate>;
const validationsPiece = ref<ValidationType[]>([]);

const createValidationPiece = (piece: ActiviteTachePieceDetachee) => {
  const pieceStock = piece.pieces_detachees?.quantite || 0;

  return useVuelidate(
    {
      pieces_detachees: {
        required: helpers.withMessage("Sélectionnez une pièce détachée. ", required),
      },
      quantite: {
        required: helpers.withMessage("Quantité obligatoire. ", required),
        integer: helpers.withMessage("La quantité doit être un entier. ", integer),
        minValue: helpers.withMessage("La quantité doit être positive. ", minValue(1)),
        maxValue: helpers.withMessage(
          `La quantité dépasse le stock (${pieceStock}).`,
          (value: number) => value <= pieceStock
        ),
      },
    },
    piece
  );
};

watch(
  activitePieceDetachee,
  (newPieces) => {
    validationsPiece.value = newPieces.map((piece) => createValidationPiece(piece));
  },
  { immediate: true, deep: true }
);

const addPieceDetachee = () => {
  activitePieceDetachee.value.push({ pieces_detachees: null, quantite: null });
  validationsPiece.value.push(
    createValidationPiece({ pieces_detachees: null, quantite: null })
  );
};

const removePiece = (index: any) => {
  activitePieceDetachee.value.splice(index, 1);
  validationsPiece.value.splice(index, 1);
};

const fetchPiecesDetachees = async () => {
  await piecedetacheesCrud.fetchItems();
  piecesOptions.value = piecedetacheesCrud.items.value;
};

const availablePieces = computed(() =>
  //on ne peut pas selectionner la meme PD
  piecesOptions.value.filter(
    (piece) =>
      !activitePieceDetachee.value.some(
        (selectedPiece) => selectedPiece.pieces_detachees?.id === piece.id
      )
  )
);

const formError = ref<HTMLElement | null>(null);
const formSubmit = ref<HTMLElement | null>(null);   //pour le defilement apres insertion

const refreshKey = ref(0);  //pour recharger le composant fils

const submitForm = async (isTerminee: boolean) => {
  let isValid = true;

  validationsPiece.value.forEach((validation) => {
    validation.value.$touch();
    if (validation.value.$invalid) {
      isValid = false;
    }
  });

  v$.value.$touch();
  if (!v$.value.$invalid && isValid === true) {
    const formData = new FormData();
    formData.append("description", form.description);
    formData.append("date_realisation", String(form.date_realisation || ""));
    formData.append("temps_passe_heure", String(form.temps_passe_heure || 0));
    formData.append("temps_passe_minute", String(form.temps_passe_minute || 0));
    formData.append("tache", String(tache.value.id) || "");

    const createdActivite = await activiteTacheCrud.addItem(formData);
    const newActiviteId = createdActivite?.id as number;

    for (const piece of activitePieceDetachee.value) {
      if (piece.pieces_detachees && piece.quantite) {
        await activitePieceDetacheeCrud.addItem({
          activite_tache: newActiviteId,
          pieces_detachees_id: piece?.pieces_detachees.id,
          quantite: piece?.quantite,
        });
      }
    }
    resetForm();

    if (isTerminee) {
      await tachesCrud.updateItemPatch(tache.value.id, {
        identifiant_status_tache: IdentifiantStatusTache.termine,
      });
    } else {
      await tachesCrud.updateItemPatch(tache.value.id, {
        identifiant_status_tache: IdentifiantStatusTache.enCours,
      });
    }

    refreshKey.value++;
    fetchTacheDetails();
    
  } else {
    console.error("Formulaire invalide");
    formError.value?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest", // Positionne horizontalement de façon la plus proche
    });
  }
};

const resetForm = () => {
  form.description = "";
  form.date_realisation = currentDate.value;
  form.temps_passe_heure = 0;
  form.temps_passe_minute = 0;

  activitePieceDetachee.value = [];
  validationsPiece.value = [];
};

onMounted(async () => {
  await statusTacheCrud.fetchItems();
  fetchTacheDetails();
  fetchPiecesDetachees();
});
</script>

<template>
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />

  <div v-if="tache" class="row justify-content-center">
    <div class="col-12">
      <div class="row align-items-center mb-4">
        <div class="col md-4">
          <h2 class="h5 page-title">
            <br /><i class="material-icons layers notranslate mr-2">assignment</i>TACHE
            <span
              class="ml-4 badge-status badge btn btn-outline"
              :style="{
                borderColor: getStatusForTache(tache, statusTacheCrud.items.value)
                  ?.couleur,
                color: getStatusForTache(tache, statusTacheCrud.items.value)?.couleur,
              }"
            >
              <ForeignKeyDisplay
                :description="
                  getStatusForTache(tache, statusTacheCrud.items.value)?.nom_status_tache
                "
            /></span>
          </h2>
        </div>
        <div class="col-auto">
          <button
            v-if="!isTacheTerminee && !isTacheAnnulee"
            @click="$router.push({ name: 'modifierTache', params: { id: tache.id } })"
            type="button"
            class="btn btn-primary ml-3"
          >
            <span class="fe fe-edit-2 fe-16 mr-2"></span>Modifier la tâche
          </button>
          <button
            v-if="!isTacheTerminee && !isTacheAnnulee"
            @click="terminerTache"
            type="button"
            class="btn btn-primary ml-3"
          >
            <span class="fe fe-check fe-16 mr-2"></span>Marquer comme terminée
          </button>
          <button
            v-if="!isTacheTerminee && !isTacheAnnulee"
            @click="annulerTache"
            type="button"
            class="btn btn-primary ml-3"
          >
            <span class="fe fe-x-circle fe-16 mr-2"></span>Annuler
          </button>
          <button
            v-if="isTacheTerminee"
            @click="nonTerminerTache"
            type="button"
            class="btn btn-primary ml-3"
          >
            <span class="fe fe-rotate-ccw fe-16 mr-2"></span>Marquer comme non terminée
          </button>
          <button
            v-if="isTacheAnnulee"
            @click="retablirTache"
            type="button"
            class="btn btn-primary ml-3"
          >
            Rétablir
          </button>
        </div>
      </div>
      <div class="row my-4">
        <div class="col-md-8">
          <div class="card shadow mb-4">
            <div class="card-header">
              <strong class="card-title text-uppercase">ID : {{ tache.id }} </strong>
              <span class="float-right"
                ><i class="material-icons badge-icon notranslate mr-2">assignment</i
                ><span
                  :class="['badge badge-pill', 'text-white']"
                  :style="{
                    backgroundColor: getStatusForTache(tache, statusTacheCrud.items.value)
                      ?.couleur,
                  }"
                  >Tâche
                </span></span
              >
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-12">
                  <div class="row">
                    <div class="col-12 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">description</i>
                        <div>
                          <div class="text-muted">Description</div>
                          <div v-if="tache.description">
                            {{ tache.description }}
                          </div>
                          <div v-else>Aucun description</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-8 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">event</i>
                        <div>
                          <div class="text-muted">Date planifiée</div>
                          <div>
                            {{
                              formatDateAndTimeInWords(
                                tache.date_debut,
                                tache.heure_debut,
                                tache.date_fin,
                                tache.heure_fin
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">label</i>
                        <div>
                          <div class="text-muted">Motif de tâche</div>
                          <div v-if="tache.motif_tache?.nom_motif_tache">
                            <ForeignKeyDisplay
                              :description="tache.motif_tache?.nom_motif_tache"
                            />
                          </div>
                          <div v-else>Aucun motif</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">access_time</i>
                        <div>
                          <div class="text-muted">Temps passé</div>
                          <div>10mn</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">date_range</i>
                        <div>
                          <div class="text-muted">Temps de maintenance planifié</div>
                          <div
                            v-if="
                              tache.temps_maintenance_heure ||
                              tache.temps_maintenance_minute
                            "
                          >
                            <span v-if="tache.temps_maintenance_heure"
                              >{{ tache.temps_maintenance_heure }}h</span
                            >
                            <span class="ml-1"
                              >{{ tache.temps_maintenance_minute }}mn</span
                            >
                          </div>
                          <div v-else>Aucun temps de maintenance planifié défini.</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">date_range</i>
                        <div>
                          <div class="text-muted">Temps d'arrêt planifié</div>
                          <div v-if="tache.temps_arret_heure || tache.temps_arret_minute">
                            <span v-if="tache.temps_arret_heure"
                              >{{ tache.temps_arret_heure }}h</span
                            >
                            <span class="ml-1">{{ tache.temps_arret_minute }}mn</span>
                          </div>
                          <div v-else>Aucun temps d'arrêt planifié défini.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow mb-4">
            <div class="card-body">
              <h3 class="h5 mb-1">Détails machine</h3>
              <RouterLink
                class="routerlink_piece"
                :to="{ name: 'detailMachine', params: { id: tache.machine?.id } }"
              >
                <div id="machine" class="d-flex align-items-center mt-4 mb-2">
                  <div class="mr-3">
                    <img
                      v-if="tache.machine?.image"
                      :src="tache.machine?.image"
                      alt="Machine Image"
                      class="rounded img-thumbnail"
                      style="width: 50px; height: 50px; object-fit: cover"
                    />
                    <div v-else class="material-icons notranslate">
                      precision_manufacturing
                    </div>
                  </div>
                  <div>
                    <h4 class="h6 mb-0 font-weight-bold">
                      {{ tache.machine?.nom_machine }}
                    </h4>
                    <span class="text-muted">{{ tache.machine?.numero_de_serie }}</span>
                  </div>
                </div>
              </RouterLink>
              <div class="d-flex align-items-center mt-4 mb-2">
                <i class="material-icons notranslate mr-4 mx-4">storefront</i>
                <div>
                  <span class="text-muted"
                    ><ForeignKeyDisplay
                      :description="tache.machine?.atelier?.nom_atelier"
                  /></span>
                  <h4
                    v-if="tache.machine?.chaine?.nom_chaine"
                    class="h6 mb-0 font-weight-bold"
                  >
                    <ForeignKeyDisplay :description="tache.machine?.chaine?.nom_chaine" />
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div class="card shadow mb-4">
            <div class="card-body">
              <h3 class="h5 mb-1">Integrations</h3>
              <p class="text-muted mb-4">How to integrate the theme?</p>
              <ul class="list-unstyled">
                <li class="my-1">
                  <i class="fe fe-file-text mr-2 text-muted"></i>Lorem ipsum dolor sit
                  amet
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!--ACTIVITE-->
      <div class="col-md-8">
        <div class="card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-2">
                <span class="circle circle-md bg-primary justify-content-center">
                  <i class="material-icons fe-18 text-white mb-0 notranslate">list_alt</i>
                </span>
              </div>
              <div class="col">
                <strong class="mb-1">Activités </strong>
                <p class="small text-muted mb-1">
                  C`est la liste de toutes les activités dans ce tâche
                </p>
              </div>
              <div
                v-if="!isTacheTerminee && !isTacheAnnulee"
                class="col-4 col-md-auto offset-4 offset-md-0 my-2"
              >
                <a
                  href="#collapseactivite"
                  data-toggle="collapse"
                  data-target="#collapseactivite"
                  aria-expanded="false"
                  aria-controls="collapseactivite"
                >
                  <button type="button" class="btn mb-2 btn-outline-warning">
                    <span class="fe fe-arrow-right fe-16 mr-2"></span>Ajouter une nouvelle
                    activité
                  </button>
                </a>
              </div>
            </div>
          </div>
          <!--Formulaire d`insertion d`activite dans ce tache-->
          <div
            v-if="!isTacheTerminee && !isTacheAnnulee"
            class="container collapse"
            id="collapseactivite"
          >
            <div class="activity-form mb-3" ref="formError">
              <h4 class="mb-4">Ajouter une activité</h4>

              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea
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

              <div class="mb-3">
                <label for="date" class="form-label">Date et heure de réalisation</label>
                <input
                  type="datetime-local"
                  id="date"
                  v-model="form.date_realisation"
                  class="form-control"
                  :class="{
                    'is-invalid':
                      v$.date_realisation.$invalid && v$.date_realisation.$dirty,
                  }"
                />
                <span
                  v-for="error of v$.date_realisation.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>

              <div class="form-row mb-3 align-items-center">
                <div class="form-group col-md-6">
                  <label for="heure" class="form-label">Temps passé</label>
                  <div class="input-group">
                    <input
                      v-model="form.temps_passe_heure"
                      type="number"
                      min="0"
                      id="heure"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          v$.temps_passe_heure.$invalid && v$.temps_passe_heure.$dirty,
                      }"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text text-muted">heure(s)</span>
                    </div>
                  </div>
                  <span
                    v-for="error of v$.temps_passe_heure.$errors"
                    :key="error.$uid"
                    class="error"
                    >{{ error.$message }}</span
                  >
                </div>
                <div class="form-group col-md-6">
                  <label for="minutes">&nbsp;</label>
                  <div class="input-group">
                    <input
                      v-model="form.temps_passe_minute"
                      type="number"
                      min="0"
                      id="minutes"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          v$.temps_passe_minute.$invalid && v$.temps_passe_minute.$dirty,
                      }"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text text-muted">minute(s)</span>
                    </div>
                  </div>
                  <span
                    v-for="error of v$.temps_passe_minute.$errors"
                    :key="error.$uid"
                    class="error"
                    >{{ error.$message }}</span
                  >
                </div>
              </div>

              <div class="d-flex flex-wrap gap-4 mb-3">
                <button
                  type="button"
                  class="btn btn-outline-info"
                  @click="addPieceDetachee"
                >
                  <span class="fe fe-plus fe-16 mr-2"></span>PIÈCE DÉTACHÉE
                </button>
                <button
                  data-toggle="modal"
                  data-target=".bd-example-modal-sm"
                  type="button"
                  class="btn btn-outline-info ml-2"
                >
                  <span class="fe fe-edit fe-16 mr-2"></span>Changer statut de machine
                </button>
              </div>
              <div
                class="form-row mb-3"
                v-for="(piece, index) in activitePieceDetachee"
                :key="index"
              >
                <div class="form-group col-md-6" :class="{ 'col-md-10': isOpen }">
                  <label for="piece" class="form-label">Pièce détachée</label>
                  <multiselect
                    v-model="piece.pieces_detachees"
                    :options="availablePieces"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :preserve-search="false"
                    placeholder="Sélectionnez un pièce détachée"
                    label="nom_piecedetache"
                    track-by="id"
                    id="piece"
                    @open="isOpen = true"
                    @close="isOpen = false"
                    :class="{
                      'is-invalid-multiselect':
                        validationsPiece[index]?.value.pieces_detachees?.$error,
                    }"
                  >
                    <template #option="{ option }">
                      <div class="option-item">
                        <img :src="option.image" alt="image" class="option-icon" />
                        <span>{{ option.nom_piecedetache }}</span>
                        <span class="ml-2 text-muted"
                          >Stock actuel: {{ option.quantite }}</span
                        >
                      </div>
                    </template>
                  </multiselect>
                  <span
                    v-if="validationsPiece[index]?.value.pieces_detachees?.$errors.length"
                    class="error"
                  >
                    {{
                      validationsPiece[index]?.value.pieces_detachees?.$errors[0]
                        ?.$message
                    }}
                  </span>
                </div>
                <div class="form-group" :class="{ 'col-md-2': isOpen }">
                  <label for="quantite">Quantite</label>
                  <input
                    style="height: 40px"
                    type="number"
                    min="0"
                    class="form-control"
                    id="quantite"
                    v-model="piece.quantite"
                    :class="{
                      'is-invalid': validationsPiece[index]?.value.quantite?.$error,
                    }"
                  />
                  <span
                    v-if="validationsPiece[index]?.value.quantite?.$errors.length"
                    class="error"
                  >
                    {{ validationsPiece[index]?.value.quantite?.$errors[0]?.$message }}
                  </span>
                  <span v-else class="text-muted stock"
                    >Stock actuel: {{ piece.pieces_detachees?.quantite }}</span
                  >
                </div>
                <span
                  class="circle circle-sm bg-danger justify-content-center text-white"
                  @click="removePiece(index)"
                  >x</span
                >
              </div>
              <div class="footer-btns">
                <button @click="submitForm(false)" class="btn btn-primary w-100">
                  Ajouter une activité
                </button>
                <button @click="submitForm(true)" class="btn btn-success w-100">
                  Ajouter une activité et terminer la tâche
                </button>
              </div>
            </div>
          </div>
          <!--FIN formulaire d`insertion d`activite-->
        </div>

        <!--Liste des activites dans ce tache-->
        <ListeActiviteTache :tacheProps="tache" :key="refreshKey"/>
      </div>
    </div>
  </div>
  <div v-else><p>Erreur lors du recuperation des details!</p></div>
</template>

<style scoped>
.circle {
  cursor: pointer;
}

.layers {
  line-height: 0;
  vertical-align: middle;
}

.badge-icon {
  font-size: 15px;
  line-height: 0;
  vertical-align: middle;
}

.badge-status {
  border-radius: 10px;
}

img {
  height: 256px;
  border-radius: 10px;
}

img:hover {
  box-shadow: blue;
}

#machine:hover {
  background-color: rgb(94, 100, 98);
}

.activity-form {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.footer-btns {
  display: flex;
  gap: 10px;
}

.is-invalid {
  border: 1px solid red;
}

.error {
  color: red;
  font-size: 12px;
}

.option-item {
  display: flex;
  align-items: center;
}
.option-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 18px;
}
</style>

<style>
.stock {
  font-size: small;
}

.is-invalid-multiselect {
  border: 2px solid red;
  border-radius: 10px;
}
</style>

<script setup lang="ts">
import { ref, reactive, watchEffect, onMounted, computed } from "vue";
import useVuelidate from "@vuelidate/core";
import {
  required,
  integer,
  minValue,
  maxLength,
  helpers,
  minLength,
  maxValue,
} from "@vuelidate/validators";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import { useCrud } from "@/composables/useCrud";
import { ActiviteTache, ActiviteTachePieceDetachee, Tache } from "@/types/TacheType";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { PieceDetachee } from "@/types/PieceDetacheType";
import { formatDateTime } from "@/composables/useFonction";
import { formatDateTimeLocal, getformatNumber } from "@/composables/useFonction";
import { IdentifiantStatusTache } from "@/config/statusConfig";
import { useNotificationStore } from "@/stores/notificationStore";

const isOpen = ref(false);
const notificationStore = useNotificationStore();
const { formatNumber } = getformatNumber();

//gestion loading
const loading = ref(false);

const props = defineProps<{
  tacheProps: Tache;
}>();

const emit = defineEmits(["refreshTache"]);

const activiteCrud = useCrud<ActiviteTache>("tache/activites_taches/");
const activitePieceCrud = useCrud<ActiviteTachePieceDetachee>(
  "tache/activites_piecedetachees/"
);
const pieceDetacheeCrud = useCrud<PieceDetachee>("piece/piecedetachees/");
const tachesCrud = useCrud<Tache>("tache/taches/");

const activites = ref<ActiviteTache[]>([]);
const piecesParActivite = ref<{ [activiteId: number]: ActiviteTachePieceDetachee[] }>({}); // afficher les pièces classées par activité
const pieceOptions = ref<PieceDetachee[]>([]);
const updatingActivite = ref<ActiviteTache | null>(null); // Activité en cours de modification

const isTacheTerminee = computed(
  () => props.tacheProps?.identifiant_status_tache === IdentifiantStatusTache.termine
);
const isTacheAnnulee = computed(
  () => props.tacheProps?.identifiant_status_tache === IdentifiantStatusTache.annulee
);

const errorMessage = activiteCrud.errorMessage;
const error401Message = activiteCrud.error401Message;

const clearError = () => {
  errorMessage.value = null;
};

const now = new Date();
const currentDate = ref(formatDateTimeLocal(now));

const modalData = reactive<ActiviteTache>({
  description: "description",
  date_realisation: currentDate.value,
  temps_passe_heure: 0,
  temps_passe_minute: 0,
}); // Formulaire de modification

const validationModal = {
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
const v$ = useVuelidate(validationModal, modalData);
type ValidationType = ReturnType<typeof useVuelidate>;
const storeValidationModal = ref<ValidationType[]>([]);

/////Validation formulaire dynamique
const newPieceDetacheeByActivite = ref<{ [key: number]: ActiviteTachePieceDetachee[] }>(
  {}
);
const errors = reactive<{
  [activiteId: number]: { [index: number]: { [key: string]: string } };
}>({});

// Validation pour une seule pièce
const validationRulesPieceDetachee = (piece: ActiviteTachePieceDetachee) => {
  const errors: { [key: string]: string } = {};
  const stock = piece.pieces_detachees?.quantite || 0;

  if (!piece.pieces_detachees) {
    errors.pieces_detachees = "Sélectionnez une pièce détachée.";
  }
  if (!piece.quantite) {
    errors.quantite = "Quantité obligatoire.";
  } else if (!Number.isInteger(piece.quantite)) {
    errors.quantite = "La quantité doit être un entier.";
  } else if (piece.quantite <= 0) {
    errors.quantite = "La quantité doit être positive.";
  } else if (piece.quantite > stock) {
    errors.quantite = `La quantité dépasse le stock disponible (${stock}).`;
  }

  return errors;
};

watchEffect(() => {
  for (const activiteId in newPieceDetacheeByActivite.value) {
    const pieces = newPieceDetacheeByActivite.value[activiteId];
    errors[activiteId] = {};

    pieces.forEach((piece, index) => {
      errors[activiteId][index] = validationRulesPieceDetachee(piece);
    });
  }
});

const addPieceToActivite = (activiteId: number) => {
  //ajouter le formulaire dynamique
  if (!newPieceDetacheeByActivite.value[activiteId]) {
    newPieceDetacheeByActivite.value[activiteId] = [];
    errors[activiteId] = {};
  }

  newPieceDetacheeByActivite.value[activiteId].push({
    pieces_detachees: null,
    quantite: null,
  });
};

const removePieceFromActivite = (activiteId: number, index: number) => {
  //supprimer le formulaire dynamique
  newPieceDetacheeByActivite.value[activiteId].splice(index, 1);
  delete errors[activiteId][index];
};

const savePieceForActivite = async (activiteId: number, index: number) => {
  //ajouter un piece detachee dans un activite
  const piece = newPieceDetacheeByActivite.value[activiteId][index];
  const pieceErrors = validationRulesPieceDetachee(piece);

  if (Object.keys(pieceErrors).length === 0) {
    try {
      loading.value = true;
      await activitePieceCrud.addItem({
        activite_tache: activiteId,
        pieces_detachees_id: piece.pieces_detachees?.id,
        quantite: piece.quantite,
      });

      await tachesCrud.updateItemPatch(props.tacheProps.id, {
        identifiant_status_tache: IdentifiantStatusTache.enCours,
      });

      await fetchActivites();
      removePieceFromActivite(activiteId, index);
      notificationStore.fetchNotifications();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    } finally {
      loading.value = false;
    }
  } else {
    errors[activiteId][index] = pieceErrors;
  }
};

const deletePieceFromActivite = async (activitePieceId: number) => {
  //supprimer un piece detachee d`un activite
  try {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce pièce détachée de l`activité ?")) {
      await activitePieceCrud.deleteItemWithoutInitialize(activitePieceId);
    }

    await fetchActivites();
    notificationStore.fetchNotifications();
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    alert("Une erreur est survenue lors de la suppression de la pièce détachée.");
  }
};

const availablePiecesForActivite = (activiteId: number) =>
  pieceOptions.value.filter(
    (piece) =>
      !(
        piecesParActivite.value[activiteId]?.some(
          (activitePiece) => activitePiece.pieces_detachees?.id === piece.id
        ) ||
        newPieceDetacheeByActivite.value[activiteId]?.some(
          (newPiece) => newPiece.pieces_detachees?.id === piece.id
        )
      )
  );

const fetchActivites = async () => {
  try {
    await activiteCrud.fetchItems();
    const allActivites = activiteCrud.items.value;

    activites.value = allActivites.filter(
      (activite) => activite.tache === props.tacheProps.id
    );

    await activitePieceCrud.fetchItems();
    const allPieces = activitePieceCrud.items.value;

    piecesParActivite.value = {};
    activites.value.forEach((activite) => {
      piecesParActivite.value[activite.id!] = allPieces.filter(
        (piece) => piece.activite_tache === activite.id
      );
    });
    emit("refreshTache");
  } catch (error) {
    console.error("Erreur lors du chargement des activités :", error);
  }
};

const fetchPiecesDetachees = async () => {
  await pieceDetacheeCrud.fetchItems();
  pieceOptions.value = pieceDetacheeCrud.items.value;
};

const deleteActivite = async (id: number) => {
  //supprimer un activite entiere
  if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
    await activiteCrud.deleteItemWithoutInitialize(id);
  }
  fetchActivites();
  notificationStore.fetchNotifications();
};

// Ouvrir le modal de modification d`activite
const openEditModal = (activite: ActiviteTache) => {
  updatingActivite.value = activite;
  Object.assign(modalData, activite);
  if (updatingActivite.value.date_realisation !== null) {
    modalData.date_realisation = formatDateTimeLocal(new Date(activite.date_realisation));
  }
};

const submitUpdateModal = async () => {
  //modifier un activite
  v$.value.$touch();
  let isValid = !v$.value.$invalid;

  storeValidationModal.value.forEach((validation) => {
    validation.value.$touch();
    if (validation.value.$invalid) isValid = false;
  });

  if (isValid && updatingActivite.value) {
    await activiteCrud.updateItem(updatingActivite.value.id!, modalData);
    fetchActivites();
    ($("#updateActivite") as any).modal("hide");
  }
};

onMounted(async () => {
  await fetchPiecesDetachees();
  await fetchActivites();
});
</script>

<template>
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />
  <div class="activite-card">
    <div class="card card-fill timeline mb-4">
      <div class="card-header">
        <strong class="card-title">Liste des activités</strong>
      </div>
      <div v-if="activites.length > 0" class="card-body">
        <div
          v-for="activite in activites"
          :key="activite.id"
          class="pb-3 timeline-item item-primary"
        >
          <div class="pl-5">
            <div class="zouzou border p-4 rounded shadow-sm">
              <div class="mb-4">
                <strong>L`activité #{{ activite.id }}</strong
                ><span class="mx-2">a été ajoutée le </span
                ><strong
                  ><span class="badge badge-light">{{
                    formatDateTime(String(activite.date_creation))
                  }}</span></strong
                >
                <button
                  v-if="!isTacheTerminee && !isTacheAnnulee"
                  @click="deleteActivite(activite.id)"
                  type="button"
                  class="btn btn-danger btn-sm float-right"
                >
                  Supprimer
                </button>
                <!--Modifier l`activite en ouvrant un modal-->
                <button
                  v-if="!isTacheTerminee && !isTacheAnnulee"
                  @click="openEditModal(activite)"
                  data-toggle="modal"
                  data-target="#updateActivite"
                  type="button"
                  class="btn btn-primary btn-sm float-right mr-2"
                >
                  Modifier
                </button>
              </div>

              <!--Detail de l`activite-->
              <div class="row">
                <div class="col-md-12">
                  <div class="row">
                    <div class="col-12 mb-4">
                      <div class="d-flex align-items-start">
                        <i class="material-icons notranslate mr-4">description</i>
                        <div>
                          <div class="text-muted">Description</div>
                          <div>{{ activite.description }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-6 mb-4">
                      <div class="d-flex align-items-start">
                        <i class="material-icons notranslate mr-4">event</i>
                        <div>
                          <div class="text-muted">Réalisée le</div>
                          <div>
                            {{ formatDateTime(String(activite.date_realisation)) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-4">
                      <div class="d-flex align-items-start">
                        <i class="material-icons notranslate mr-4">access_time</i>
                        <div>
                          <div class="text-muted">Temps passé</div>
                          <div>
                            {{ activite.temps_passe_heure || 0 }}h
                            {{ activite.temps_passe_minute || 0 }}m
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="loading" style="text-align: center">
                <span class="spinner-border text-primary"></span>
              </div>
              <div
                v-for="(activitePiece, index) in piecesParActivite[activite.id] || []"
                :key="index"
                class="card d-inline-flex mb-4 mr-2"
              >
                <div class="card-body bg-light py-2 px-3" style="border-radius: 10px">
                  <i class="material-icons notranslate badge-icon mr-2">handyman</i>
                  <RouterLink
                    class="routerlink_piece"
                    :to="{
                      name: 'detailPieceDetache',
                      params: { id: activitePiece.pieces_detachees?.id },
                    }"
                    >{{ activitePiece.pieces_detachees?.nom_piecedetache }}
                  </RouterLink>
                  (<strong>{{ activitePiece.quantite }}</strong
                  >) = {{ formatNumber(activitePiece.total) }} Ariary
                  <span v-if="!isTacheTerminee && !isTacheAnnulee">
                    <button
                      class="btn btn-sm dropdown-toggle more-vertical"
                      type="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>
                    <div class="dropdown-menu" style="padding: initial">
                      <a
                        class="dropdown-item"
                        @click="deletePieceFromActivite(activitePiece.id)"
                      >
                        <i class="fe fe-delete mr-4"></i> Supprimer
                      </a>
                    </div>
                  </span>
                </div>
              </div>
              <div class="row mb-4 align-items-center">
                <div v-if="!isTacheTerminee && !isTacheAnnulee" class="col-auto">
                  <!--Ajouter un nouveau piece detachee dans ce activite-->
                  <button
                    @click="addPieceToActivite(activite.id)"
                    type="button"
                    class="btn btn-outline-info"
                  >
                    <span class="fe fe-plus fe-16 mr-2"></span>Pièce détachée
                  </button>
                </div>
                <div
                  v-if="piecesParActivite[activite.id]?.[0]?.somme_totale"
                  class="col text-right"
                >
                  <div class="total-box">
                    <strong
                      >TOTAL:
                      {{
                        formatNumber(piecesParActivite[activite.id]?.[0]?.somme_totale)
                      }}</strong
                    >
                    Ariary
                  </div>
                </div>
              </div>
              <!--Ajout piece detachee-->
              <div
                class="form-row mb-3"
                v-for="(newPiece, index) in newPieceDetacheeByActivite[activite.id] || []"
                :key="index"
              >
                <div class="form-group col-md-5 mr-2" :class="{ 'col-md-8': isOpen }">
                  <label for="piece" class="form-label">Pièce détachée</label>
                  <multiselect
                    v-model="newPiece.pieces_detachees"
                    :options="availablePiecesForActivite(activite.id)"
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
                        errors[activite.id]?.[index]?.pieces_detachees,
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
                  <span class="error">{{
                    errors[activite.id]?.[index]?.pieces_detachees
                  }}</span>
                </div>
                <div class="form-group" :class="{ 'col-md-2': isOpen }">
                  <label for="quantite">Quantité</label>
                  <input
                    :class="{ 'is-invalid': errors[activite.id]?.[index]?.quantite }"
                    v-model="newPiece.quantite"
                    style="height: 40px"
                    type="number"
                    class="form-control"
                    id="quantite"
                    placeholder="1"
                  />
                  <span v-if="errors[activite.id]?.[index]?.quantite" class="error">{{
                    errors[activite.id]?.[index]?.quantite
                  }}</span>
                  <span v-else class="text-muted stock"
                    >Stock actuel: {{ newPiece.pieces_detachees?.quantite }}</span
                  >
                </div>
                <span
                  @click="removePieceFromActivite(activite.id, index)"
                  class="circle circle-sm bg-danger justify-content-center text-white"
                  >x</span
                >
                <span
                  @click="savePieceForActivite(activite.id, index)"
                  class="circle circle-sm bg-success justify-content-center text-white ml-1"
                  ><i class="fe fe-check"></i
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else><h6 class="text-muted text-center">Aucune activité</h6></div>
    </div>
  </div>

  <!--Modal de modification d`activite-->
  <div
    class="modal fade"
    id="updateActivite"
    tabindex="-1"
    role="dialog"
    aria-labelledby="updateActiviteLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateActiviteLabel">Modification d`activité</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea
              :class="{
                'is-invalid': v$.description.$invalid && v$.description.$dirty,
              }"
              v-model="modalData.description"
              class="form-control"
              id="description"
            >
            </textarea>
            <span
              v-for="error of v$.description.$errors"
              :key="error.$uid"
              class="error"
              >{{ error.$message }}</span
            >
          </div>

          <div class="form-group">
            <label for="date" class="form-label">Date et heure de réalisation</label>
            <input
              type="datetime-local"
              id="date"
              v-model="modalData.date_realisation"
              class="form-control"
              :class="{
                'is-invalid': v$.date_realisation.$invalid && v$.date_realisation.$dirty,
              }"
            />
            <span
              v-for="error of v$.date_realisation.$errors"
              :key="error.$uid"
              class="error"
              >{{ error.$message }}</span
            >
          </div>

          <div class="row mb-3 align-items-center">
            <div class="col-md-6">
              <label for="heure" class="form-label">Temps passé</label>
              <div class="input-group">
                <input
                  v-model="modalData.temps_passe_heure"
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
            <div class="col-md-6">
              <label for="minutes" class="form-label">&nbsp;</label>
              <div class="input-group">
                <input
                  v-model="modalData.temps_passe_minute"
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

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Annuler
            </button>
            <button @click="submitUpdateModal" class="btn btn-primary">Modifier</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-icon {
  font-size: 15px;
  line-height: 1;
  vertical-align: middle;
}

.circle {
  cursor: pointer;
}

.is-invalid {
  border: 1px solid red;
}

.error {
  color: red;
  font-size: 12px;
}

.total-box {
  display: inline-block;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-weight: bold;
}

.multiselect {
  line-height: 20px;
}

.zouzou .badge {
  font-size: 0.8rem;
}

.routerlink_piece {
  color: #5ec0d8;
}

.dropdown-item {
  cursor: pointer;
}
.dropdown-item:hover {
  color: black;
}
</style>

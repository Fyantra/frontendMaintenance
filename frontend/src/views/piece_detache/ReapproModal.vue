<script setup lang="ts">
import { ref, watch } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, minValue, helpers, integer, maxValue } from "@vuelidate/validators";
import { useCrud } from "@/composables/useCrud";
import { ReapprovisionnementPieceDetachee } from "@/types/PieceDetacheType";
import { formatDateTimeLocal } from "@/composables/useFonction";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { useNotificationStore } from "@/stores/notificationStore";

const notificationStore = useNotificationStore();

const props = defineProps({
  piece: Object,
});
const reapprovisionnementCrud = useCrud<ReapprovisionnementPieceDetachee>(
  "piece/reapprovisionnements/"
);
const emit = defineEmits(["refreshPiece"]);

const now = new Date();
const currentDate = ref(formatDateTimeLocal(now));

const form = ref({
  pieces_detachees: props.piece?.id || null,
  quantite: 1,
  prix_piece_detachees: props.piece?.prix_unitaire,
  date_realisation: currentDate.value,
});

watch(
  () => props.piece,
  (newPiece) => {
    if (newPiece) {
      form.value.pieces_detachees = newPiece.id;
      form.value.quantite = 1;
      form.value.prix_piece_detachees = newPiece.prix_unitaire || 0;
      form.value.date_realisation = currentDate.value;
    }
  },
  { immediate: true }
);

const validationRules = {
  quantite: {
    required: helpers.withMessage("Quantite requis", required),
    integer: helpers.withMessage("Veuillez entrer un entier.", integer),
    minValue: helpers.withMessage(
      "La valeur saisie doit être supérieure à 0.",
      minValue(1)
    ),
    maxValue: helpers.withMessage(
      "Doit être inférieur ou égal à 99999. ",
      maxValue(99999)
    ),
  },
  date_realisation: { required: helpers.withMessage("Champ requis", required) },
  prix_piece_detachees: {
    required: helpers.withMessage("Prix unitaire requis", required),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative.",
      minValue(0)
    ),
  },
};

const v$ = useVuelidate(validationRules, form);

const submitReapprovisionnement = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    form.value.pieces_detachees = props.piece.id;
    await reapprovisionnementCrud.addItem(form.value);
    notificationStore.fetchNotifications();
    $("#reapproModal").modal("hide");
    emit("refreshPiece"); // Rafraîchit la liste des pièces détachées
  } else {
    console.error("Formulaire de reapprovisionnement invalide");
  }
};
</script>

<template>
  <div
    class="modal fade"
    id="reapproModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="reapproModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="reapproModalLabel">Réapprovisionner</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row mt-2 mb-4 h-100 d-flex align-items-center">
            <div class="col-md-4 d-flex justify-content-center align-items-center">
              <img
                v-if="piece?.image"
                :src="piece?.image"
                alt="Image du produit"
                class="img-fluid"
                style="border-radius: 10px; max-height: 200px"
              />
              <div v-else class="material-icons notranslate" style="font-size: 12rem">
                handyman
              </div>
            </div>
            <div class="col-md-8">
              <div class="d-flex align-items-center">
                <div>
                  <strong
                    >{{ piece?.nom_piecedetache }}
                    <ForeignKeyDisplay :description="piece?.modele?.nom_modele" />
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="date" class="form-label">Date et heure de réalisation*</label>
            <input
              v-model="form.date_realisation"
              type="datetime-local"
              id="date"
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

          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="quantite" class="form-label">Quantité*</label>
              <input
                v-model="form.quantite"
                :class="{
                  'is-invalid': v$.quantite.$invalid && v$.quantite.$dirty,
                }"
                type="number"
                min="0"
                id="quantite"
                class="form-control"
              />
              <span
                v-for="error of v$.quantite.$errors"
                :key="error.$uid"
                class="error"
                >{{ error.$message }}</span
              >
            </div>
            <div class="form-group col-md-6">
              <label for="prix" class="form-label">Prix unitaire*</label>
              <input
                v-model="form.prix_piece_detachees"
                :class="{
                  'is-invalid':
                    v$.prix_piece_detachees.$invalid && v$.prix_piece_detachees.$dirty,
                }"
                type="number"
                min="0"
                id="prix"
                class="form-control"
              />
              <span
                v-for="error of v$.prix_piece_detachees.$errors"
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
            <button @click="submitReapprovisionnement" class="btn btn-primary">
              Réapprovisionner
            </button>
          </div>
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
</style>

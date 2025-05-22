<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Atelier, Chaine } from "@/types/AtelierType";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import { required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const props = defineProps<{
  atelierOptions: Atelier[];
  chainesOptions: Chaine[];
}>();

const emit = defineEmits([
  "selectedAtelier",
  "selectedChaine",
  "date_deplacement",
  "closeModal",
]);

const selectedAtelier = ref<Atelier | null>(null);
const selectedChaine = ref<Chaine | null>(null);
const date_deplacement = ref<Date | String | null>(null);

const rules = {
  selectedChaine: { required },
};

const v$ = useVuelidate(rules, { selectedChaine });

const filteredChaines = computed(() =>
  selectedAtelier.value
    ? props.chainesOptions.filter((c) => c.atelier_id === selectedAtelier.value?.id)
    : []
);

const confirmeDeplacement = () => {
  v$.value.$touch();
  if (v$.value.$invalid && selectedAtelier.value && filteredChaines.value.length > 0) {
    console.error("formulaire invalide");
    return; // Ne pas poursuivre si le formulaire est invalide
  }
  emit("selectedAtelier", selectedAtelier.value);
  emit("selectedChaine", selectedChaine.value);
  emit("date_deplacement", date_deplacement.value);
  $("#deplacementModal").modal("hide");
};

const closeModal = () => {
  emit("closeModal");
  selectedAtelier.value = null;
  selectedChaine.value = null;
  date_deplacement.value = null;
};

watch(filteredChaines, (newChaines) => {
  if (newChaines.length === 0) {
    selectedChaine.value = null;
  }
});
</script>

<template>
  <div
    class="modal fade"
    id="deplacementModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="deplacementModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deplacementModalLabel">Déplacement d'équipement</h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
            @click="closeModal"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="date_deplacement">Date et heure de deplacement</label>
            <input
              class="form-control"
              id="date_deplacement"
              type="datetime-local"
              v-model="date_deplacement"
            />
          </div>
          <div class="form-group">
            <label for="atelier" class="col-form-label"
              >Atelier pour le déplacement:</label
            >
            <multiselect
              v-model="selectedAtelier"
              :options="atelierOptions"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Sélectionnez un atelier"
              label="nom_atelier"
              track-by="id"
              id="atelier"
            >
              <template #option="{ option }">
                <div class="option-item">
                  <span>{{ option.nom_atelier }}</span>
                </div>
              </template>
            </multiselect>
          </div>

          <div v-if="selectedAtelier && filteredChaines.length > 0">
            <label for="chaine" class="col-form-label">Chaîne pour le déplacement:</label>
            <multiselect
              v-model="selectedChaine"
              :options="filteredChaines"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Sélectionnez une chaîne"
              label="nom_chaine"
              track-by="id"
              id="chaine"
              :class="{
                'is-invalid': v$?.selectedChaine?.$invalid && v$?.selectedChaine?.$dirty,
              }"
            />
            <span v-if="v$?.selectedChaine?.$error" class="error">Chaine requis.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-dismiss="modal"
            @click="closeModal"
          >
            Annuler
          </button>
          <button type="button" class="btn btn-primary" @click="confirmeDeplacement">
            Confirmer
          </button>
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

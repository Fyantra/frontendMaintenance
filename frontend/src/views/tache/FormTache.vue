<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import useVuelidate from "@vuelidate/core";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { required } from "@vuelidate/validators";
import { PieceDetachee } from "@/types/PieceDetacheType";
import { Machine } from "@/types/MachineType";
import { useRoute, useRouter } from "vue-router";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import { Tache } from "@/types/TacheType";

const tachesCrud = useCrud<Tache>("tache/taches/");
const errorMessage = tachesCrud.errorMessage;
const error401Message = tachesCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};
</script>

<template>
  <SectionNavigation />

  <div class="row">
    <div class="col-md-8">
      <h2 class="page-title">
        <!-- {{ machineId ? "Modification de machine" : "Créer un nouveau machine" }} -->
        Créer une nouvelle tâche
      </h2>
    </div>
  </div>

  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />
</template>

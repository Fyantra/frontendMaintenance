<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { useCrud } from "@/composables/useCrud";
import { Machine, Marque, Type } from "@/types/MachineType";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { Atelier, Chaine } from "@/types/AtelierType";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

const machinesCrud = useCrud<Machine>("machine/machines/");

const errorMessage = machinesCrud.errorMessage;
const error401Message = machinesCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};
</script>

<template>
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />
  <div></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud"; // Assurez-vous du chemin correct
import { Machine, Status } from "@/types/MachineType";
import { IdentifiantStatusMachine } from "@/config/statusConfig";
import { formatLocalDate } from "@/composables/useFonction";

// Props
const props = defineProps<{
  machine: Machine;
}>();

const selectedStatus = ref<number | null>(null);
const statusCrud = useCrud<Status>("machine/status/");
const machinesCrud = useCrud<Machine>("machine/machines/");

// Méthodes
const validateStatusChange = async () => {
  if (selectedStatus.value === null)
    return ($("#statusMachineModal") as any).modal("hide");

  const updatedData: Partial<Machine> = {
    identifiant_status_machine: selectedStatus.value,
    date_hors_service:
      selectedStatus.value === IdentifiantStatusMachine.horsService
        ? formatLocalDate(new Date())
        : null,
  };

  try {
    await machinesCrud.updateItemPatch(props.machine?.id, updatedData);
    alert(
      "Le statut du machine " +
        props.machine?.nom_machine +
        " avec le numéro de série " +
        props.machine?.numero_de_serie +
        " a été modifié"
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
  }
  ($("#statusMachineModal") as any).modal("hide");
};

onMounted(async () => {
  await statusCrud.fetchItems();
});
</script>

<template>
  <div
    class="modal fade"
    id="statusMachineModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="updateStatusLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateStatusLabel">Changer le statut de machine</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <div
              v-for="status in statusCrud.items.value"
              :key="status.id"
              class="custom-control custom-radio"
            >
              <input
                type="radio"
                :id="`status-${status.id}`"
                :value="status.identifiant"
                v-model="selectedStatus"
                class="custom-control-input"
              />
              <label class="custom-control-label" :for="`status-${status.id}`">{{
                status.nom_status
              }}</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Annuler
            </button>
            <button @click="validateStatusChange" class="btn btn-primary">Valider</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container spacing */
.form-group {
  margin: 20px 0;
  padding: 10px;
}

/* Custom radio */
.custom-control.custom-radio {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
}

.custom-control-input {
  position: absolute;
  opacity: 0;
}

.custom-control-label {
  position: relative;
  padding-left: 30px;
  font-size: 1rem;
  transition: color 0.3s ease;
}

/* Custom bullet */
.custom-control-label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid #007bff;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s ease;
}

/* Inner dot */
.custom-control-input:checked + .custom-control-label::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-color: #007bff;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0px 2px 5px rgba(0, 123, 255, 0.5);
}

/* Hover effect */
.custom-control-label:hover {
  color: #007bff;
}

.custom-control-label:hover::before {
  border-color: #0056b3;
}
</style>

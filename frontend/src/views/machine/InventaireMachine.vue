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

const selectedAtelier = ref<Atelier | null>(null);
const selectedMachine = ref<Machine | null>(null);
const selectedType = ref<Type | null>(null);
const selectedMarque = ref<Marque | null>(null);
const activeChaines = ref<Chaine[]>([]);

const atelierOptions = ref<Atelier[]>([]);
const machinesOptions = ref<Machine[]>([]);
const typeOptions = ref<Type[]>([]);
const marqueOptions = ref<Marque[]>([]);
const chainesOptions = ref<Chaine[]>([]);

const ateliersCrud = useCrud<Atelier>("atelier/ateliers/");
const typesCrud = useCrud<Type>("machine/types/");
const marquesCrud = useCrud<Marque>("machine/marques/");

const chainesCrud = useCrud<Chaine>("atelier/chaines/");

const totalMachines = ref<number>(0);

const applyFilters = () => {
  let filteredMachines = machinesCrud.items.value;

  if (selectedAtelier.value) {
    filteredMachines = filteredMachines.filter(
      (machine) => machine.atelier_id === selectedAtelier.value.id
    );
  }

  if (selectedMachine.value) {
    filteredMachines = filteredMachines.filter(
      (machine) => machine.id === selectedMachine.value.id
    );
  }

  if (selectedType.value) {
    filteredMachines = filteredMachines.filter(
      (machine) => machine.type_id === selectedType.value.id
    );
  }

  if (selectedMarque.value) {
    filteredMachines = filteredMachines.filter(
      (machine) => machine.marque_id === selectedMarque.value.id
    );
  }

  if (activeChaines.value.length > 0) {
    filteredMachines = filteredMachines.filter((machine) =>
      activeChaines.value.some((chaine) => chaine.id === machine.chaine_id)
    );
  }

  // Mettre à jour la liste des machines affichées et le total
  machinesOptions.value = filteredMachines;
  totalMachines.value = filteredMachines.length;
  refreshData();
};

// Gérer le clic sur les boutons des chaînes
const toggleChaine = (chaine: Chaine) => {
  const index = activeChaines.value.indexOf(chaine);
  if (index === -1) {
    activeChaines.value.push(chaine);
  } else {
    activeChaines.value.splice(index, 1);
  }
  applyFilters();
};

const refreshData = async () => {
  await machinesCrud.initializeDataTable();
};

onMounted(async () => {
  await Promise.all([
    await ateliersCrud.fetchItems(),
    (atelierOptions.value = ateliersCrud.items.value),
    await machinesCrud.fetchItems(),
    (machinesOptions.value = machinesCrud.items.value),
    await typesCrud.fetchItems(),
    (typeOptions.value = typesCrud.items.value),
    await marquesCrud.fetchItems(),
    (marqueOptions.value = marquesCrud.items.value),
    await chainesCrud.fetchItems(),
    (chainesOptions.value = chainesCrud.items.value),
  ]);

  totalMachines.value = machinesOptions.value.length;

  refreshData();
});

watch(selectedAtelier, (newAtelier) => {
  if (newAtelier) {
    // Filtrer les chaînes correspondant à l'atelier sélectionné
    chainesOptions.value = chainesCrud.items.value.filter(
      (chaine) => chaine.atelier_id === newAtelier.id
    );
  } else {
    chainesOptions.value = [];
  }
});
</script>

<template>
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />

  <div class="row">
    <div class="col">
      <h2 class="page-title text-center">Inventaire des machines actuellement</h2>
    </div>
  </div>
  <div class="col-md-12 my-5">
    <div class="card shadow bg-primary text-center mb-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-center align-items-center mb-3">
          <span
            class="circle circle-md bg-primary-light d-flex justify-content-center align-items-center"
          >
            <i class="material-icons fe-24 text-white notranslate">inventory</i>
          </span>
        </div>
        <h3 class="h4 mt-4 mb-1 text-white">Inventaire de machine</h3>
        <p class="text-white mb-4">Sélectionnez les filtres que vous voulez</p>
      </div>

      <div class="card-footer bg-light py-4">
        <div class="form-row">
          <div class="form-group col-md-3">
            <label for="atelier" class="text-white font-weight-bold">Atelier:</label>
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

          <div class="form-group col-md-3">
            <label for="machine" class="text-white font-weight-bold">Machine:</label>
            <multiselect
              v-model="selectedMachine"
              :options="machinesOptions"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Sélectionnez un machine"
              label="nom_machine"
              track-by="id"
              id="machine"
            >
              <template #option="{ option }">
                <div class="option-item">
                  <img :src="option.image" alt="image" class="option-icon" />
                  <span>{{ option.nom_machine }}</span>
                </div>
              </template>
            </multiselect>
          </div>

          <div class="form-group col-md-3">
            <label for="type" class="text-white font-weight-bold">Type:</label>
            <multiselect
              v-model="selectedType"
              :options="typeOptions"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Sélectionnez un type"
              label="nom_type"
              track-by="id"
              id="type"
            >
              <template #option="{ option }">
                <div class="option-item">
                  <span>{{ option.nom_type }}</span>
                </div>
              </template>
            </multiselect>
          </div>
          <div class="form-group col-md-3">
            <label for="marque" class="text-white font-weight-bold">Marque:</label>
            <multiselect
              v-model="selectedMarque"
              :options="marqueOptions"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Sélectionnez une marque"
              label="nom_marque"
              track-by="id"
              id="marque"
            >
              <template #option="{ option }">
                <div class="option-item">
                  <span>{{ option.nom_marque }}</span>
                </div>
              </template>
            </multiselect>
          </div>
          <transition-group name="fade">
            <div v-if="chainesOptions.length > 0" class="button-group mt-3">
              <button
                v-for="chaine in chainesOptions"
                :key="chaine.id"
                class="btn btn-outline-primary mx-1 btn-chaine"
                :class="{ active: activeChaines.includes(chaine) }"
                @click="toggleChaine(chaine)"
              >
                {{ chaine.nom_chaine }}
              </button>
            </div>
          </transition-group>
        </div>
        <div class="text-center mt-4">
          <button @click="applyFilters" class="btn btn-primary btn-validate">
            Valider les filtres
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="col-md-6 col-xl-3 mb-4">
    <div class="card shadow">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-3 text-center">
            <span class="circle circle-sm bg-primary justify-content-center">
              <i class="material-icons fe-16 text-white mb-0 notranslate">analytics</i>
            </span>
          </div>
          <div class="col">
            <p class="small text-muted mb-0">TOTAL</p>
            <span v-if="totalMachines > 1" class="h3 mb-0"
              >{{ totalMachines }} Machines</span
            >
            <span v-else class="h3 mb-0">{{ totalMachines }} Machine</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-md-12">
      <table id="datatable-1" class="table table-borderless">
        <thead class="thead-piece">
          <tr>
            <th>
              <strong><i class="material-icons fe-12 mr-1 notranslate">tag</i> ID</strong>
            </th>
            <th>
              <strong><i class="fe fe-image fe-12 mr-2"></i>Image</strong>
            </th>
            <th>
              <strong
                ><i class="material-icons fe-12 mr-2 notranslate"
                  >precision_manufacturing</i
                >Nom</strong
              >
            </th>
            <th>
              <strong
                ><i class="material-icons fe-12 mr-2 notranslate">confirmation_number</i
                >Numero de serie
              </strong>
            </th>
            <th>
              <strong
                ><i class="material-icons fe-12 mr-2 notranslate">category</i>Type</strong
              >
            </th>
            <th>
              <strong
                ><i class="material-icons fe-12 mr-2 notranslate">info</i>Statut</strong
              >
            </th>
            <th>
              <strong
                ><i class="material-icons fe-12 mr-2 notranslate">calendar_today</i>Date
                d'acquisition</strong
              >
            </th>

            <th>
              <strong
                ><i class="material-icons fe-12 mr-2 notranslate">gesture</i
                >Action</strong
              >
            </th>
          </tr>
        </thead>
        <tbody class="tbody-piece">
          <tr v-for="machine in machinesOptions" :key="machine.id" class="tr-piece">
            <td>
              <span>{{ machine.id }}</span>
            </td>
            <td>
              <div v-if="machine.image" class="avatar avatar-md">
                <img :src="machine.image" alt="Ceci est un image" class="avatar-img" />
              </div>
              <div v-else class="material-icons notranslate" style="font-size: 6rem">
                precision_manufacturing
              </div>
            </td>
            <!--Nom et modele-->
            <th scope="col">
              <strong
                ><RouterLink
                  class="routerlink_piece"
                  :to="{ name: 'detailMachine', params: { id: machine.id } }"
                  >{{ machine.nom_machine }}
                  <ForeignKeyDisplay
                    :description="machine.marque?.nom_marque"
                  /> </RouterLink
              ></strong>
            </th>

            <td>{{ machine.numero_de_serie }}</td>
            <td>
              <ForeignKeyDisplay :description="machine.type?.nom_type" />
            </td>
            <td>
              <span
                class="badge badge-pill text-white"
                :style="{ backgroundColor: machine.status?.couleur }"
              >
                <ForeignKeyDisplay :description="machine.status?.nom_status"
              /></span>
            </td>
            <td>
              {{
                machine.date_acquisition
                  ? new Date(machine.date_acquisition).toLocaleDateString()
                  : null
              }}
            </td>
            <td>
              <div class="col-auto">
                <button
                  class="btn btn-sm dropdown-toggle more-horizontal"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                ></button>
                <div class="dropdown-menu m-2">
                  <a class="dropdown-item"
                    ><i class="fe fe-meh fe-12 mr-4"></i>Créer une tâche</a
                  >
                  <a class="dropdown-item"
                    ><i class="fe fe-message-circle fe-12 mr-4"></i>Réapprovisionner</a
                  >
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
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

.btn-chaine {
  transition: all 0.3s ease;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.btn-chaine:hover {
  background-color: #007bff;
  color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.btn-outline-primary:not(:disabled):not(.disabled).active {
  background-color: #46a941;
  border: solid;
}

.btn-validate {
  padding: 0.6rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-validate:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 86, 179, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.routerlink_piece {
  color: #5ec0d8;
}

.avatar-img {
  width: 110px;
  height: 100px;
  max-width: 100%;
  max-height: 100%;
  border-radius: 5px;
}

.dropdown-item {
  cursor: pointer;
}
.dropdown-item:hover {
  color: black;
}
</style>

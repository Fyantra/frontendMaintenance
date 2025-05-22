<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { useCrud } from "@/composables/useCrud";
import { getStatusForMachine } from "@/composables/useFonction";
import {
  Machine,
  Marque,
  Type,
  Status,
  HistoriqueDeplacementmachine,
} from "@/types/MachineType";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { Atelier, Chaine } from "@/types/AtelierType";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

const machinesCrud = useCrud<Machine>("machine/machines/");
const historiquesCrud = useCrud<HistoriqueDeplacementmachine>(
  "machine/historique_machine/"
);
const statusCrud = useCrud<Status>("machine/status/");
const ateliersCrud = useCrud<Atelier>("atelier/ateliers/");
const typesCrud = useCrud<Type>("machine/types/");
const marquesCrud = useCrud<Marque>("machine/marques/");
const chainesCrud = useCrud<Chaine>("atelier/chaines/");

const errorMessage = machinesCrud.errorMessage;
const error401Message = machinesCrud.error401Message;

const clearError = () => {
  errorMessage.value = null;
};

//Les filtres
const selectedAtelier = ref<Atelier | null>(null);
const selectedMachine = ref<Machine | null>(null);
const selectedType = ref<Type | null>(null);
const selectedMarque = ref<Marque | null>(null);
const activeChaines = ref<Chaine[]>([]);
const selectedDate = ref<string | null>(null);

const atelierOptions = ref<Atelier[]>([]);
const typeOptions = ref<Type[]>([]);
const marqueOptions = ref<Marque[]>([]);
const chainesOptions = ref<Chaine[]>([]);

const activeMachines = ref<Machine[]>([]);
const totalMachines = ref<number>(0);

const applyFilters = () => {
  const date = selectedDate.value ? new Date(selectedDate.value) : null;

  const formatToDate = (inputDate: Date): string => inputDate.toISOString().split("T")[0]; // Extraire uniquement la partie date

  // par defaut, on affiche les machines de l`objet Machine
  let filteredMachines = [...machinesCrud.items.value];

  if (date) {
    //si il y a un date, on affiche les historiques
    const inputDate = formatToDate(date);

    const historiques = historiquesCrud.items.value.filter((historique) => {
      const historiqueDate = formatToDate(new Date(historique.date_deplacement));
      return historiqueDate <= inputDate;
    });

    //Conserver uniquement la dernière date de déplacement pour chaque machine
    const latestHistoriques = historiques.reduce((latest, historique) => {
      const machineId = historique.machine?.id;
      if (
        !latest[machineId] ||
        new Date(latest[machineId].date_deplacement as string) <
          new Date(historique.date_deplacement as string)
      ) {
        latest[machineId] = historique;
      }
      return latest;
    }, {} as Record<number, HistoriqueDeplacementmachine>);

    const filteredHistoriques = Object.values(latestHistoriques).filter((historique) => {
      return (
        (!selectedAtelier.value || historique.atelier?.id === selectedAtelier.value.id) &&
        (!activeChaines.value.length ||
          activeChaines.value.some((chaine) => chaine.id === historique.chaine?.id)) &&
        (!selectedType.value || historique.machine?.type?.id === selectedType.value.id) &&
        (!selectedMarque.value ||
          historique.machine?.marque?.id === selectedMarque.value.id)
      );
    });

    //Convertir les historiques filtrés en machines
    filteredMachines = filteredHistoriques.map((historique) => historique.machine!);
  } else if (
    selectedAtelier.value ||
    selectedType.value ||
    selectedMarque.value ||
    activeChaines.value.length > 0
  ) {
    // si il y n`y a pas de date, on affiche juste les machines de l`objet Machine
    if (selectedAtelier.value) {
      filteredMachines = filteredMachines.filter(
        (machine) => machine.atelier_id === selectedAtelier.value.id
      );
    }
    if (activeChaines.value.length > 0) {
      filteredMachines = filteredMachines.filter((machine) =>
        activeChaines.value.some((chaine) => chaine.id === machine.chaine_id)
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
  }

  // appliquer les autres filtres
  if (selectedMachine.value) {
    filteredMachines = filteredMachines.filter(
      (machine) => machine.id === selectedMachine.value.id
    );
  }

  activeMachines.value = filteredMachines;
  totalMachines.value = filteredMachines.length;
  refreshData();
};

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
  await historiquesCrud.fetchItems();
};

onMounted(async () => {
  await Promise.all([
    await statusCrud.fetchItems(),
    await ateliersCrud.fetchItems(),
    (atelierOptions.value = ateliersCrud.items.value),
    await typesCrud.fetchItems(),
    (typeOptions.value = typesCrud.items.value),
    await marquesCrud.fetchItems(),
    (marqueOptions.value = marquesCrud.items.value),
    await chainesCrud.fetchItems(),
    (chainesOptions.value = chainesCrud.items.value),
  ]);

  refreshData();
});

watch([selectedAtelier, selectedMarque, selectedType, selectedMachine], applyFilters);

watch(selectedAtelier, (newAtelier) => {
  if (newAtelier) {
    chainesOptions.value = chainesCrud.items.value.filter(
      (chaine) => chaine.atelier_id === newAtelier.id
    );
    if (chainesOptions.value.length === 0 || newAtelier) {
      activeChaines.value = [];
    }
  } else {
    chainesOptions.value = chainesCrud.items.value;
    activeChaines.value = [];
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
      <h2 class="page-title text-center">Historique d`inventaire des équipements</h2>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12 my-3">
      <div class="card shadow bg-primary text-center mb-4 position-relative">
        <div class="position-absolute" style="top: 10px; right: 10px">
          <a
            href="#collapsefilter"
            data-toggle="collapse"
            data-target="#collapsefilter"
            aria-expanded="false"
            aria-controls="collapsefilter"
          >
            <button type="button" class="btn btn-outline-warning">
              <span class="fe fe-minimize-2 fe-24"></span>
            </button>
          </a>
        </div>
        <div class="card-body p-4">
          <div class="d-flex justify-content-center align-items-center mb-3">
            <span
              class="circle circle-md bg-primary-light d-flex justify-content-center align-items-center"
            >
              <i class="material-icons fe-24 text-white notranslate">inventory</i>
            </span>
          </div>
          <h3 class="h4 mt-4 mb-1 text-white">
            Inventaire d'équipement
            <span v-if="selectedDate"
              >le {{ new Date(selectedDate).toLocaleDateString() }}</span
            >
          </h3>
          <p class="text-white mb-4 collapse show" id="collapsefilter">
            Sélectionnez les filtres que vous voulez
          </p>
        </div>

        <div class="card-footer bg-light py-4 collapse show" id="collapsefilter">
          <div class="form-group col-md-4 mx-auto text-center mb-4">
            <label for="dateFilter" class="text-white font-weight-bold mb-2">Date:</label>
            <div class="d-flex justify-content-center align-items-center">
              <div class="input-group date-picker mr-2">
                <input
                  type="date"
                  id="dateFilter"
                  v-model="selectedDate"
                  class="form-control date-input"
                  placeholder="Sélectionnez une date"
                />
              </div>
              <button type="button" class="btn btn-outline-info" @click="applyFilters">
                Appliquer
              </button>
            </div>
          </div>
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
              <label for="machine" class="text-white font-weight-bold">Equipement:</label>
              <multiselect
                v-model="selectedMachine"
                :options="activeMachines"
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
              <div
                v-if="chainesOptions.length > 0"
                class="button-group mt-3 d-flex flex-wrap justify-content-center"
              >
                <button
                  v-for="chaine in chainesOptions"
                  :key="chaine.id"
                  class="btn btn-outline-primary mx-1 mb-3 btn-chaine"
                  :class="{ active: activeChaines.includes(chaine) }"
                  @click="toggleChaine(chaine)"
                >
                  {{ chaine.nom_chaine }}
                </button>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row mb-4">
    <div class="col-md-6 col-xl-3 mb-4">
      <div class="card shadow h-100 d-flex align-items-center justify-content-center">
        <div class="card-body w-100">
          <div class="d-flex align-items-center">
            <div class="text-center mr-3">
              <span
                class="circle circle-sm bg-primary d-flex justify-content-center align-items-center"
              >
                <i class="material-icons fe-16 text-white mb-0 notranslate">analytics</i>
              </span>
            </div>
            <div class="flex-grow-1 text-left">
              <p class="small text-muted mb-1">TOTAL</p>
              <span class="h4 mb-0 text-wrap d-inline-block">
                {{ totalMachines }} {{ totalMachines > 1 ? "Équipements" : "Équipement" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-md-12">
      <div class="card shadow">
        <div class="card-body">
          <table id="datatable-1" class="table table-hover">
            <thead class="thead-piece">
              <tr>
                <th style="width: 7%">
                  <strong> N°</strong>
                </th>
                <th style="width: 11%">
                  <strong>Image</strong>
                </th>
                <th style="width: 17%">
                  <strong>Nom</strong>
                </th>
                <th style="width: 9%">
                  <strong>Modèle</strong>
                </th>
                <th style="width: 11%">
                  <strong>Type</strong>
                </th>
                <th style="width: 9%">
                  <strong>Marque</strong>
                </th>
                <th style="width: 17%">
                  <strong>Numéro de série </strong>
                </th>
                <th style="width: 17%">
                  <strong>Date d'acquisition</strong>
                </th>
                <th style="width: 10%">
                  <strong>Statut</strong>
                </th>
                <th>
                  <strong>Action</strong>
                </th>
              </tr>
            </thead>
            <tbody class="tbody-piece">
              <tr v-for="machine in activeMachines" :key="machine.id" class="tr-piece">
                <td :data-order="machine.numero_machine">
                  <span>{{ machine.numero_machine }}</span>
                </td>
                <td>
                  <div v-if="machine.image" class="avatar avatar-md">
                    <img
                      :src="machine.image"
                      alt="Ceci est un image"
                      class="avatar-img"
                    />
                  </div>
                  <div v-else class="material-icons notranslate" style="font-size: 6rem">
                    precision_manufacturing
                  </div>
                </td>
                <th scope="col">
                  <strong
                    ><RouterLink
                      class="routerlink_piece"
                      :to="{ name: 'detailMachine', params: { id: machine.id } }"
                      >{{ machine.nom_machine }}
                    </RouterLink></strong
                  >
                </th>
                <td>
                  <ForeignKeyDisplay :description="machine.modele?.nom_modele" />
                </td>
                <td>
                  <ForeignKeyDisplay :description="machine.type?.nom_type" />
                </td>
                <td>
                  <ForeignKeyDisplay :description="machine.marque?.nom_marque" />
                </td>

                <td :data-order="machine.numero_de_serie">
                  {{ machine.numero_de_serie }}
                </td>
                <td :data-order="machine.date_acquisition">
                  {{
                    machine.date_acquisition
                      ? new Date(machine.date_acquisition).toLocaleDateString()
                      : null
                  }}
                </td>
                <td>
                  <span
                    class="badge-status badge btn btn-outline"
                    :style="{
                      borderColor: getStatusForMachine(machine, statusCrud.items.value)
                        ?.couleur,
                      color: getStatusForMachine(machine, statusCrud.items.value)
                        ?.couleur,
                    }"
                  >
                    <ForeignKeyDisplay
                      :description="
                        getStatusForMachine(machine, statusCrud.items.value)?.nom_status
                      "
                  /></span>
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
                      <a
                        class="dropdown-item"
                        @click="
                          $router.push({
                            name: 'ajoutTacheMachine',
                            params: { machineId: machine.id },
                          })
                        "
                        ><i class="material-icons assignment mr-4 notranslate"
                          >assignment</i
                        >Créer une tâche</a
                      >
                      <a
                        class="dropdown-item"
                        @click="
                          $router.push({
                            name: 'modifierMachine',
                            params: { id: machine.id },
                          })
                        "
                      >
                        <i class="fe fe-edit fe-12 mr-4"></i> Modifier
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assignment {
  font-size: 15px;
  vertical-align: middle;
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

.button-group {
  display: flex;
  flex-wrap: wrap; /* Permet aux boutons de passer à la ligne */
  gap: 1rem;
  justify-content: center;
}

.btn-chaine {
  transition: all 0.3s ease;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  text-align: center;
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

.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-input {
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 10px 15px;
  font-size: 16px;
  /* width: 100%; */
  max-width: 300px;
}

.input-group-text {
  background-color: #007bff;
  color: #fff;
  border-radius: 0 8px 8px 0;
  padding: 8px;
}

.date-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  outline: none;
}
</style>

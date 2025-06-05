<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { Machine, Status } from "@/types/MachineType";
import { getStatusForMachine } from "@/composables/useFonction";
import ExportButtons from "../templates_composant/ExportButtons.vue";

// Récupérer les données des nachines
const machinesCrud = useCrud<Machine>("machine/machines/");
const status = useCrud<Status>("machine/status/");

const errorMessage = machinesCrud.errorMessage;
const error401Message = machinesCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

// Compter les pièces total
const total = computed(() => machinesCrud.items.value.length);

const showStatusFilters = ref(false);
const selectedStatus = ref<number | null>(null);

const filteredMachines = computed(() => {
  if (selectedStatus.value) {
    return machinesCrud.items.value.filter(
      (machine) => machine.identifiant_status_machine === selectedStatus.value // Changer status_id en identifiant_status_machine
    );
  }
  return machinesCrud.items.value;
});

const statusCounts = computed(() => {
  const counts = {};
  machinesCrud.items.value.forEach((machine) => {
    const statusId = machine.identifiant_status_machine; // Changer status_id en identifiant_status_machine
    if (!counts[statusId]) {
      counts[statusId] = 0;
    }
    counts[statusId]++;
  });
  return counts;
});

const toggleStatusFilters = () => {
  showStatusFilters.value = !showStatusFilters.value;
};

const selectStatus = (statusId: number) => {
  if (selectedStatus.value === statusId) {
    selectedStatus.value = null;
  } else {
    selectedStatus.value = statusId; // Sélectionner le nouveau statut
  }
  refreshData();
};

// Rafraîchir les données
const refreshData = async () => {
  await machinesCrud.initializeDataTable();
};

onMounted(async () => {
  await status.fetchItems();
  refreshData();
});
</script>

<template>
  <SectionNavigation />

  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />

  <div class="row">
    <div class="col-md-7">
      <h2 class="page-title">Liste des équipements</h2>
    </div>

    <RouterLink to="/ajoutMachine">
      <button type="button" class="btn btn-primary">
        <span class="fe fe-plus fe-16 mr-2"></span>Ajouter un équipement
      </button>
    </RouterLink>
    <RouterLink to="">
      <button type="button" class="btn btn-primary ml-4">
        <span class="fe fe-upload fe-16 mr-2"></span>Importer un fichier
      </button>
    </RouterLink>
  </div>

  <p class="mt-3">
    <i class="material-icons nb notranslate">precision_manufacturing</i>
    <span v-if="total > 1" class="ml-3 item-text">{{ total }} Machines au total</span>
    <span v-else class="ml-3 item-text">{{ total }} Machine au total</span>
  </p>

  <div class="row justify-content-center">
    <div class="col-12">
      <!--Liste des pièces détachées-->
      <div class="row">
        <div class="col-md-12">
          <div class="card shadow">
            <div class="card-body">
              <div class="row items-align-center my-2 d-none d-lg-flex">
                <div class="col-md">
                  <button
                    v-if="status.items.value.length > 0"
                    @click="toggleStatusFilters"
                    href="#collapsestatus"
                    data-toggle="collapse"
                    data-target="#collapsestatus"
                    aria-expanded="false"
                    aria-controls="collapsestatus"
                    type="button"
                    class="btn mb-2 btn-outline-warning"
                  >
                    <span class="fe fe-arrow-down fe-16 mr-2"></span>Filtre sur les
                    statuts
                  </button>
                  <ul
                    id="collapsestatus"
                    v-if="showStatusFilters"
                    class="nav nav-pills justify-content-start mt-2 collapse"
                  >
                    <li
                      v-for="status in status.items.value"
                      :key="status.id"
                      class="nav-item ml-2"
                    >
                      <a
                        class="nav-link status-link"
                        :style="{
                          backgroundColor:
                            selectedStatus === status.identifiant
                              ? status.couleur
                              : 'transparent',
                          color:
                            selectedStatus === status.identifiant ? 'floralwhite' : '',
                        }"
                        @click.prevent="selectStatus(status.identifiant)"
                      >
                        {{ status.nom_status }}
                        <span class="badge badge-pill bg-primary text-white ml-2">
                          {{ statusCounts[status.identifiant] || 0 }}
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="toolbar row mb-3 mr-4">
                  <div class="col ml-auto">
                    <ExportButtons model-name="machine" />
                  </div>
                </div>
              </div>
              <table id="datatable-1" class="table table-hover">
                <thead class="thead-piece">
                  <tr>
                    <!-- <th style="width: 7%">
                      <strong
                        >
                        ID</strong
                      >
                    </th> -->
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
                    <th style="width: 18%">
                      <strong>Numéro de série </strong>
                    </th>
                    <th style="width: 17%">
                      <strong>Date acquisition</strong>
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
                  <tr
                    v-for="machine in filteredMachines"
                    :key="machine.id"
                    class="tr-piece"
                  >
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
                      <div
                        v-else
                        class="material-icons notranslate"
                        style="font-size: 6rem"
                      >
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
                          borderColor: getStatusForMachine(machine, status.items.value)
                            ?.couleur,
                          color: getStatusForMachine(machine, status.items.value)
                            ?.couleur,
                        }"
                      >
                        <ForeignKeyDisplay
                          :description="
                            getStatusForMachine(machine, status.items.value)?.nom_status
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
                                name: 'formDynamiqueMachine',
                                params: { id: machine.id },
                              })
                            "
                          >
                            <i class="fe fe-plus fe-12 mr-4"></i> Créer un nouveau
                            équipement
                          </a>
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
    </div>
  </div>
</template>

<style scoped>
.nb {
  line-height: 0;
  vertical-align: middle;
}

.assignment {
  font-size: 15px;
  vertical-align: middle;
}

.routerlink_piece {
  color: #5ec0d8;
}

/* th,
td {
  text-align: center;
} */

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

.nav-link {
  line-height: normal;
  border-radius: 1.25rem;
  cursor: pointer;
}

.status-link {
  transition: background-color 0.3s ease;
}

.status-link:hover {
  opacity: 0.8;
}
</style>

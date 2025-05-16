<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { getStatusForTache, formatDateAndTime } from "@/composables/useFonction";
import { StatusTache, Tache } from "@/types/TacheType";
import { useTacheStore } from "@/stores/tacheStore";

const tacheStore = useTacheStore();
// // Récupérer les données des taches
const tachesCrud = useCrud<Tache>("tache/taches/");
const statusTache = useCrud<StatusTache>("tache/status_taches/");

const errorMessage = tachesCrud.errorMessage;
const error401Message = tachesCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const total = computed(() => tachesCrud.items.value.length);

const showStatusFilters = ref(false);
const selectedStatus = ref<number | null>(null);

const filteredTaches = computed(() => {
  if (selectedStatus.value) {
    return tachesCrud.items.value.filter(
      (tache) => tache.identifiant_status_tache === selectedStatus.value // Changer status_id en identifiant_status_tache
    );
  }
  return tachesCrud.items.value;
});

const statusCounts = computed(() => {
  const counts = {};
  tachesCrud.items.value.forEach((tache) => {
    const statusId = tache.identifiant_status_tache; // Changer status_id en identifiant_status_machine
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

//export
const { exportTache } = useCrud("");
const handleExport = async (format: "pdf" | "csv" | "excel") => {
  await exportTache(format);
};

// Rafraîchir les données
const refreshData = async () => {
  await tachesCrud.initializeDataTableWithId("dataTable_tache");
};

onMounted(async () => {
  await tacheStore.fetchTaches(null);
  await statusTache.fetchItems();
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
      <h2 class="page-title">Liste de toutes les tâches</h2>
    </div>

    <RouterLink to="/ajoutTache">
      <button type="button" class="btn btn-primary">
        <span class="fe fe-plus fe-16 mr-2"></span>Ajouter une tâche
      </button>
    </RouterLink>
  </div>

  <p class="mt-3">
    <i class="material-icons nb notranslate">assignment</i>
    <span v-if="total > 1" class="ml-3 item-text">{{ total }} Tâches au total</span>
    <span v-else class="ml-3 item-text">{{ total }} Tâche au total</span>
  </p>

  <div class="row">
    <div class="col-12">
      <!--Liste des Tâches-->
      <div class="row">
        <div class="col-md-12 my-4">
          <div class="card shadow">
            <div class="card-body">
              <div class="row items-align-center my-3 d-none d-lg-flex">
                <div class="col-md">
                  <button
                    v-if="statusTache.items.value.length > 0"
                    href="#collapseactivite"
                    data-toggle="collapse"
                    data-target="#collapseactivite"
                    aria-expanded="false"
                    aria-controls="collapseactivite"
                    type="button"
                    class="btn mb-2 btn-outline-warning"
                  >
                    <span class="fe fe-arrow-down fe-16 mr-2"></span>Filtre sur les
                    statuts
                  </button>
                  <ul
                    id="collapseactivite"
                    class="nav nav-pills justify-content-start mt-2 collapse"
                  >
                    <li
                      v-for="status in statusTache.items.value"
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
                        {{ status.nom_status_tache }}
                        <span class="badge badge-pill bg-primary text-white ml-2">
                          {{ statusCounts[status.identifiant] || 0 }}
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="toolbar row mb-3 mr-4">
                  <div class="col ml-auto">
                    <div class="dropdown float-right">
                      <button
                        class="btn btn-secondary dropdown-toggle"
                        type="button"
                        id="actionMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i class="material-icons icon mr-2 notranslate">download</i>
                        Télécharger
                      </button>
                      <div class="dropdown-menu" aria-labelledby="actionMenuButton">
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="handleExport('csv')"
                          ><i class="material-icons icon mr-2 notranslate">grid_on</i
                          >Fichier CSV</a
                        >
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="handleExport('excel')"
                          ><i
                            class="material-icons icon mr-2 notranslate"
                            style="color: green"
                            >description</i
                          >Fichier excel (xlsx)</a
                        >
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="handleExport('pdf')"
                          ><i class="material-icons icon mr-2 notranslate"
                            >picture_as_pdf</i
                          >Fichier PDF</a
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <table id="dataTable_tache" class="table table-bordered table-hover">
                <thead>
                  <tr role="row">
                    <th colspan="4" class="text-center">
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate">assignment</i
                        >Tâche</strong
                      >
                    </th>
                    <th colspan="2" class="text-center">
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate"
                          >precision_manufacturing</i
                        >Equipement</strong
                      >
                    </th>
                    <th style="width: 28%" colspan="2" class="text-center">
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate">info</i
                        >Propriété</strong
                      >
                    </th>
                  </tr>
                  <tr role="row">
                    <!-- <th>
                      <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="all" />
                        <label class="custom-control-label" for="all"></label>
                      </div>
                    </th> -->
                    <th>ID</th>
                    <th style="width: 22%">Description</th>
                    <th style="width: 13%">Date de début</th>
                    <th style="width: 13%">Date fin</th>
                    <th>Image</th>
                    <th>Nom</th>
                    <th style="width: 13%">Statut</th>
                    <th>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tache in filteredTaches" :key="tache.id">
                    <!-- <td>
                      <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="4574" />
                        <label class="custom-control-label" for="4574"></label>
                      </div>
                    </td> -->
                    <td>{{ tache.id }}</td>
                    <td style="width: 22%">
                      <RouterLink
                        class="routerlink_piece"
                        :to="{ name: 'detailTache', params: { id: tache.id } }"
                      >
                        <strong style="color: #5ec0d8">{{ tache.description }}</strong>
                      </RouterLink>
                      <hr />
                      <i class="fe fe-clock fe-16 mr-3"></i>
                      {{ tache.total_duree_tache }}
                      <div v-if="tache.motif_tache?.nom_motif_tache">
                        <hr />
                        <i class="material-icons fe-16 mr-3 notranslate">label</i>
                        <ForeignKeyDisplay
                          :description="tache.motif_tache?.nom_motif_tache"
                        />
                      </div>
                    </td>
                    <td :data-order="`${tache.date_debut}T${tache.heure_debut}`">
                      {{ formatDateAndTime(tache.date_debut, tache.heure_debut) }}
                    </td>
                    <td :data-order="`${tache.date_fin}T${tache.heure_fin}`">
                      {{ formatDateAndTime(tache.date_fin, tache.heure_fin) }}
                    </td>
                    <td class="text-center">
                      <div class="avatar">
                        <img
                          v-if="tache.machine?.image"
                          :src="tache.machine?.image"
                          alt="Ceci est un image"
                          class="avatar-img"
                        />
                        <div v-else class="material-icons notranslate">
                          precision_manufacturing
                        </div>
                      </div>
                    </td>
                    <td>
                      <RouterLink
                        class="routerlink_piece"
                        :to="{ name: 'detailMachine', params: { id: tache.machine?.id } }"
                      >
                        <ForeignKeyDisplay :description="tache.machine?.nom_machine" />
                      </RouterLink>
                    </td>
                    <td>
                      <span
                        class="badge-status badge btn btn-outline"
                        :style="{
                          borderColor: getStatusForTache(tache, statusTache.items.value)
                            ?.couleur,
                          color: getStatusForTache(tache, statusTache.items.value)
                            ?.couleur,
                        }"
                      >
                        <ForeignKeyDisplay
                          :description="
                            getStatusForTache(tache, statusTache.items.value)
                              ?.nom_status_tache
                          "
                      /></span>
                    </td>
                    <td :data-order="tache.date_creation">
                      {{ new Date(tache.date_creation).toLocaleDateString() }}
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

.dot-lg {
  width: 18px;
  height: 18px;
}

.routerlink_piece {
  color: #5ec0d8;
}

/* th,
td {
  text-align: center;
} */

hr {
  border: 1px solid #80837b;
}

.avatar-img {
  width: 81px;
  height: 70px;
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

.badge-status {
  border-radius: 10px;
  font-size: 85%;
}

.icon {
  font-size: 15px;
  vertical-align: middle;
}
</style>

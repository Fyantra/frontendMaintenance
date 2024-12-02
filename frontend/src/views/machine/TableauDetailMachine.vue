<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  HistoriqueDeplacementmachine,
  MachineRelation,
  Status,
} from "@/types/MachineType";
import { PieceDetachee } from "@/types/PieceDetacheType";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { formatDateTime, getformatNumber } from "@/composables/useFonction";
import {
  dotColor,
  getStatusForMachine,
  formatDateAndTime,
  getStatusForTache,
} from "@/composables/useFonction";
import { useCrud } from "@/composables/useCrud";
import { Tache, ActiviteTache, StatusTache } from "@/types/TacheType";

const statusCrud = useCrud<Status>("machine/status/");
const statusTacheCrud = useCrud<StatusTache>("tache/status_taches/");

const { formatNumber } = getformatNumber();

const props = defineProps<{
  machineRelations: MachineRelation[];
  piecesDetachees: PieceDetachee[];
  historiqueDeplacement: HistoriqueDeplacementmachine[];
  taches: Tache[];
  activites: ActiviteTache[];
}>();

const getActivitesForTache = (tacheId: number) => {
  return props.activites.filter((activite) => activite.tache === tacheId);
};

const activeTache = ref<number | null>(null);

const toggleActivite = (tacheId: number) => {
  activeTache.value = activeTache.value === tacheId ? null : tacheId;
};

onMounted(async () => {
  await statusCrud.fetchItems();
  await statusTacheCrud.fetchItems();
});

const activeTab = ref("machines");
</script>

<template>
  <div class="tableauDetail justify-content-center mb-5">
    <div class="col-12 mt-4 mb-4">
      <div class="row align-items-center mb-3 border-bottom no-gutters">
        <div class="col">
          <ul class="nav nav-tabs border-0" id="myTab" role="tablist">
            <li class="nav-item">
              <a
                class="nav-link active"
                id="machine-tab"
                data-toggle="tab"
                href="#machines-lies"
                role="tab"
                aria-controls="machines-lies"
                aria-selected="true"
                @click.prevent="activeTab = 'machines'"
                >Machine liés
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="piece-tab"
                data-toggle="tab"
                href="#pieces-detachees"
                role="tab"
                aria-controls="pieces-detachees"
                aria-selected="false"
                @click.prevent="activeTab = 'pieces'"
                >Pièces détachées liées
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="document-tab"
                data-toggle="tab"
                href="#document"
                role="tab"
                aria-controls="document"
                aria-selected="false"
                >Documents</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="historique-tab"
                data-toggle="tab"
                href="#historique_deplacement"
                role="tab"
                aria-controls="historique_deplacement"
                aria-selected="false"
                >Historique des mouvements</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="historiqueTache-tab"
                data-toggle="tab"
                href="#historique_tache"
                role="tab"
                aria-controls="historique_tache"
                aria-selected="false"
                >Historique des tâches</a
              >
            </li>
          </ul>
        </div>
      </div>
      <!--Machines Liees-->
      <div class="tab-content">
        <div
          class="tab-pane fade show active"
          id="machines-lies"
          role="tabpanel"
          aria-labelledby="machine-tab"
        >
          <div class="card shadow">
            <div class="card-body">
              <table id="datatable-machines" class="table table-borderless table-striped">
                <thead>
                  <tr>
                    <th></th>
                    <th class="w-30">Nom</th>
                    <th>Type</th>
                    <th>Quantité</th>
                    <th>Date d`acquisition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="relation in machineRelations" :key="relation.id">
                    <td class="text-center">
                      <img
                        v-if="relation.machine_liee?.image"
                        :src="relation.machine_liee.image"
                        class="avatar-img"
                        alt="Ceci est un image"
                      />
                      <span
                        class="dot dot-md mr-1"
                        :style="{
                          backgroundColor: getStatusForMachine(
                            relation.machine_liee,
                            statusCrud.items.value
                          )?.couleur,
                        }"
                      ></span>
                    </td>
                    <th scope="row">
                      <RouterLink
                        class="routerlink_machine"
                        :to="{
                          name: 'detailMachine',
                          params: { id: relation.machine_liee?.id },
                        }"
                      >
                        {{ relation.machine_liee?.nom_machine }}<br />
                      </RouterLink>
                      <span class="badge badge-light text-muted">
                        {{ relation.machine_liee?.numero_de_serie }}</span
                      >
                    </th>
                    <td>
                      <ForeignKeyDisplay
                        :description="relation.machine_liee?.type?.nom_type"
                      />
                    </td>
                    <td>{{ relation.quantite }}</td>
                    <td>{{ relation.machine_liee?.date_acquisition }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!--Pieces detachess Liees-->
        <div
          class="tab-pane fade"
          id="pieces-detachees"
          role="tabpanel"
          aria-labelledby="piece-tab"
        >
          <div class="card shadow">
            <div class="card-body">
              <table id="datatable-pieces" class="table table-borderless table-striped">
                <thead>
                  <tr>
                    <th></th>
                    <th class="w-30">Nom</th>
                    <th>Emplacement</th>
                    <th>Prix unitaire</th>
                    <th>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="piece in piecesDetachees" :key="piece.id">
                    <td class="text-center">
                      <img
                        v-if="piece.image"
                        :src="piece.image"
                        class="avatar-img"
                        alt="Ceci est un image"
                      />
                      <span
                        :class="[
                          'dot dot-md',
                          'mr-1',
                          dotColor(piece.quantite, piece.stock_min, piece.stock_max),
                        ]"
                      ></span>
                    </td>
                    <th scope="row">
                      <RouterLink
                        class="routerlink_machine"
                        :to="{
                          name: 'detailPieceDetache',
                          params: { id: piece.id },
                        }"
                      >
                        {{ piece.nom_piecedetache }}<br />
                      </RouterLink>
                      <span class="badge badge-light text-muted">ID: {{ piece.id }}</span>
                    </th>
                    <td>
                      <ForeignKeyDisplay :description="piece.emplacement?.nom_atelier" />
                    </td>
                    <td>{{ formatNumber(piece.prix_unitaire) }}</td>
                    <td>{{ piece.quantite }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!--Historique deplacement-->
        <div
          class="tab-pane fade"
          id="historique_deplacement"
          role="tabpanel"
          aria-labelledby="historique-tab"
        >
          <div class="card shadow">
            <div class="card-body">
              <table
                id="datatable-deplacement"
                class="table table-borderless table-striped table-hover"
              >
                <thead>
                  <tr>
                    <th class="w-30">Date et heure de deplacement</th>
                    <th>Atelier</th>
                    <th>Chaine</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="machine in historiqueDeplacement" :key="machine.id">
                    <th scope="row">
                      {{ formatDateTime(String(machine.date_creation)) }}<br />
                    </th>
                    <td>
                      <ForeignKeyDisplay :description="machine.atelier?.nom_atelier" />
                    </td>
                    <td>
                      <ForeignKeyDisplay :description="machine.chaine?.nom_chaine" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!--Historique tache-->
        <div
          class="tab-pane fade"
          id="historique_tache"
          role="tabpanel"
          aria-labelledby="historiqueTache-tab"
        >
          <div class="card shadow mb-4">
            <div class="card-body">
              <table
                v-if="taches.length > 0"
                class="table table-hover table-border border-v"
              >
                <thead class="thead-dark">
                  <tr>
                    <th>ID Tache</th>
                    <th>Description</th>
                    <th>Date de début</th>
                    <th>Date fin</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="tache in props.taches" :key="tache.id">
                    <tr class="accordion-toggle" @click="toggleActivite(tache.id)">
                      <td>{{ tache.id }}</td>
                      <td>
                        <RouterLink
                          class="routerlink_piece"
                          :to="{ name: 'detailTache', params: { id: tache.id } }"
                        >
                          {{ tache.description }}
                        </RouterLink>
                        <hr />
                        <i class="fe fe-clock fe-16 mr-3"></i
                        >{{ tache.total_duree_tache }}
                      </td>
                      <td>
                        {{ formatDateAndTime(tache.date_debut, tache.heure_debut) }}
                      </td>
                      <td>{{ formatDateAndTime(tache.date_fin, tache.heure_fin) }}</td>
                      <td>
                        <span
                          class="badge-status badge btn btn-outline"
                          :style="{
                            borderColor: getStatusForTache(
                              tache,
                              statusTacheCrud.items.value
                            )?.couleur,
                            color: getStatusForTache(tache, statusTacheCrud.items.value)
                              ?.couleur,
                          }"
                        >
                          <ForeignKeyDisplay
                            :description="
                              getStatusForTache(tache, statusTacheCrud.items.value)
                                ?.nom_status_tache
                            "
                        /></span>
                      </td>
                    </tr>
                    <transition name="slide-fade">
                      <tr v-show="activeTache === tache.id" class="in p-3 bg-light">
                        <td colspan="8">
                          <div class="card card-fill timeline">
                            <div class="card-body">
                              <!--Boucle activite dans un tache-->
                              <div
                                v-for="activite in getActivitesForTache(tache.id)"
                                :key="activite.id"
                                class="pb-3 timeline-item item-primary"
                              >
                                <div class="pl-5">
                                  <div class="mb-1">
                                    <strong>Activité #{{ activite.id }}</strong>
                                    <span class="mx-2">{{ activite.description }}</span>
                                    <span class="float-right"
                                      ><i class="fe fe-clock fe-16 mr-3"></i>
                                      {{ activite.temps_passe_heure || 0 }}h
                                      {{ activite.temps_passe_minute || 0 }}m
                                    </span>
                                  </div>
                                  <p class="small">
                                    Réalisée le
                                    {{
                                      formatDateTime(String(activite.date_realisation))
                                    }}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </transition>
                  </template>
                </tbody>
              </table>
              <div v-else>Aucune tache dans ce machine</div>
            </div>
          </div>
        </div>
        <!--Fin historique tache-->
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar-img {
  height: 40px;
  width: 40px;
  border-radius: 8px;
  margin-right: 3px;
}

.tab-content {
  margin-top: 2.5rem;
}

.nav-tabs .nav-link {
  color: #dee2e6;
  padding-left: 10px;
  padding-right: 10px;
}

.nav-tabs .nav-link.active {
  color: #8adb76;
  border: double;
}

.routerlink_machine {
  color: #dee2e6;
}

.badge-status {
  border-radius: 10px;
  font-size: 85%;
}

.routerlink_piece {
  color: #5ec0d8;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  transform: scaleY(0.9);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: scaleY(1);
}
</style>

<style>
.tableauDetail {
  border: 1px solid #7e7575;
  border-radius: 10px;
}
</style>

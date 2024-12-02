<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Machine, Status } from "@/types/MachineType";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { useCrud } from "@/composables/useCrud";
import {
  getStatusForMachine,
  formatDateTime,
  getformatNumber,
} from "@/composables/useFonction";
import { HistoriqueMouvementPieceDetachee } from "@/types/PieceDetacheType";

const statusCrud = useCrud<Status>("machine/status/");

const props = defineProps<{
  machines: Machine[];
  historiqueMouvementPieceDetachee: HistoriqueMouvementPieceDetachee[];
}>();

const { formatNumber } = getformatNumber();

const activeTab = ref("machines");

onMounted(async () => {
  await statusCrud.fetchItems();
});
</script>

<template>
  <div class="tableauDetail justify-content-center mb-4">
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
                id="histo-tab"
                data-toggle="tab"
                href="#histo"
                role="tab"
                aria-controls="histo"
                aria-selected="false"
                >Historique des mouvements</a
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="tab-content">
        <!--Machines Liees-->
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
                    <th class="w-50">Nom</th>
                    <th>Type</th>
                    <th>Atelier</th>
                    <th>Date d`acquisition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="machine in machines" :key="machine.id">
                    <td class="text-center">
                      <img
                        v-if="machine.image"
                        :src="machine.image"
                        class="avatar-img"
                        alt="Ceci est un image"
                      />
                      <span
                        class="dot dot-md mr-1"
                        :style="{
                          backgroundColor: getStatusForMachine(
                            machine,
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
                          params: { id: machine.id },
                        }"
                      >
                        {{ machine.nom_machine }}<br />
                      </RouterLink>
                      <span class="badge badge-light text-muted">
                        {{ machine.numero_de_serie }}</span
                      >
                    </th>
                    <td>
                      <ForeignKeyDisplay :description="machine.type?.nom_type" />
                    </td>
                    <td>
                      <ForeignKeyDisplay :description="machine.atelier?.nom_atelier" />
                    </td>
                    <td>{{ machine.date_acquisition }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!--Historique mouvement-->
        <div class="tab-pane fade" id="histo" role="tabpanel" aria-labelledby="histo-tab">
          <div class="card shadow">
            <div class="card-body">
              <table class="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Date de réalisation</th>
                    <th>Quantité</th>
                    <th>Coût</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="historique in historiqueMouvementPieceDetachee"
                    :key="historique.id"
                  >
                    <td class="w-50">
                      <span
                        v-if="historique.cout > 0"
                        class="material-icons layers fe-16 mr-2 notranslate"
                        >{{ historique.tache ? "assignment" : "layers" }}</span
                      >
                      <span v-else class="material-icons layers fe-16 mr-2 notranslate"
                        >inventory</span
                      >
                      <RouterLink
                        v-if="historique.tache"
                        class="routerlink_tache"
                        :to="{ name: 'detailTache', params: { id: historique.tache } }"
                        >Tache {{ historique.tache }} :</RouterLink
                      >
                      {{ historique.source }}
                    </td>
                    <td>{{ formatDateTime(String(historique.date_realisation)) }}</td>
                    <td>
                      <span
                        v-if="historique.cout > 0"
                        class="badge badge-pill text-white mr-2"
                        :style="{
                          backgroundColor:
                            historique.quantite < 0 ? '#ea3323' : '#4bb543',
                        }"
                      >
                        {{
                          historique.quantite > 0
                            ? "+" + historique.quantite
                            : historique.quantite
                        }}</span
                      >
                      {{ historique.quantite_piece }}
                    </td>
                    <td>{{ formatNumber(historique.cout) }} Ariary</td>
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
.layers {
  line-height: 0;
  vertical-align: middle;
}

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

.routerlink_tache {
  color: #5ec0d8;
  text-decoration: underline;
}

.badge-pill {
  border-radius: 10px;
}
</style>

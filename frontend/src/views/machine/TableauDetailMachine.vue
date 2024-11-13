<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  HistoriqueDeplacementmachine,
  MachineRelation,
  Status,
} from "@/types/MachineType";
import { PieceDetachee } from "@/types/PieceDetacheType";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { formatDateTime } from "@/composables/useFonction";
import { dotColor, getStatusForMachine } from "@/composables/useFonction";
import { useCrud } from "@/composables/useCrud";

const statusCrud = useCrud<Status>("machine/status/");

const props = defineProps<{
  machineRelations: MachineRelation[];
  piecesDetachees: PieceDetachee[];
  historiqueDeplacement: HistoriqueDeplacementmachine[];
}>();

onMounted(async () => {
  await statusCrud.fetchItems();
});

const activeTab = ref("machines");
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12">
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

        <!--Pieces detachess Liees-->
        <div
          class="tab-pane fade"
          id="pieces-detachees"
          role="tabpanel"
          aria-labelledby="piece-tab"
        >
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
                <td>{{ piece.prix_unitaire }}</td>
                <td>{{ piece.quantite }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!--Historique deplacement-->
        <div
          class="tab-pane fade"
          id="historique_deplacement"
          role="tabpanel"
          aria-labelledby="historique-tab"
        >
          <table id="datatable-deplacement" class="table table-borderless table-striped">
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
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import SectionNavigation from "../templates/SectionNavigation.vue";
import { formatLocalDate } from "@/composables/useFonction";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import { Machine } from "@/types/MachineType";
import { Atelier } from "@/types/AtelierType";
import { useCrud } from "@/composables/useCrud";
import { PieceDetachee } from "@/types/PieceDetacheType";
import type { Ref } from "vue";
import { PieceDetacheeStats } from "@/types/statistiqueType";
import { formatCurrency } from "@/composables/useFonction";

interface PieceStats extends PieceDetachee {
  quantite_sortie: number;
  quantite_reappro: number;
  cout_sortie: number;
  cout_reappro: number;
  valorisation_stock: number;
}

// Références pour les filtres
const dateDebut = ref<string>("");
const dateFin = ref<string>("");
const selectedMachines: Ref<Machine[]> = ref([]);
const selectedEmplacements: Ref<Atelier[]> = ref([]);
const selectedPiece: Ref<PieceDetachee | null> = ref(null);

// Références pour les données
const statsData: Ref<PieceDetacheeStats | null> = ref(null);
const piecesStats: Ref<PieceStats[]> = ref([]);
const loading = ref(false);

const machinesCrud = useCrud<Machine>("machine/machines/");
const piecesCrud = useCrud<PieceDetachee>("piece/piecedetachees/");
const ateliersCrud = useCrud<Atelier>("atelier/ateliers/");
const statsCrud = useCrud<PieceDetacheeStats>("stats/pieces-detachees/");

const machinesOptions = computed(() => machinesCrud.items.value);
const piecedetacheeOptions = computed(() => piecesCrud.items.value);
const ateliersOptions = computed(() => ateliersCrud.items.value);

// Fonction pour récupérer les statistiques
const fetchStats = async () => {
  loading.value = true;

  try {
    // Préparation des paramètres
    const params: Record<string, any> = {};

    if (dateDebut.value) params.date_debut = dateDebut.value;
    if (dateFin.value) params.date_fin = dateFin.value;
    if (selectedPiece.value) params.piece_detachee_id = selectedPiece.value.id;

    if (selectedMachines.value.length > 0) {
      params.machine_ids = selectedMachines.value.map((m) => m.id);
    }

    if (selectedEmplacements.value.length > 0) {
      params.emplacement_ids = selectedEmplacements.value.map((e) => e.id);
    }

    // Mode 1: Si une pièce spécifique est sélectionnée
    if (selectedPiece.value) {
      const response = await statsCrud.getWithParams(params);
      if (response) {
        statsData.value = {
          valorisation_stock: response.valorisation_stock,
          quantite_totale_sortie_brut: response.quantite_totale_sortie_brut,
          cout_total_sortie_brut: response.cout_total_sortie_brut,
          quantite_totale_sortie_net: response.quantite_totale_sortie_net,
          cout_total_sortie_net: response.cout_total_sortie_net,
          quantite_totale_reappro: response.quantite_totale_reappro,
          cout_total_reappro: response.cout_total_reappro,
        };
        piecesStats.value = [];
      }
    }
    // Mode 2: Toutes les pièces
    else {
      const response = await statsCrud.getWithParams(params);
      if (response) {
        // Stats globales
        statsData.value = {
          valorisation_stock: response.global_stats.valorisation_stock,
          quantite_totale_sortie_brut: response.global_stats.quantite_totale_sortie_brut,
          cout_total_sortie_brut: response.global_stats.cout_total_sortie_brut,
          quantite_totale_sortie_net: response.global_stats.quantite_totale_sortie_net,
          cout_total_sortie_net: response.global_stats.cout_total_sortie_net,
          quantite_totale_reappro: response.global_stats.quantite_totale_reappro,
          cout_total_reappro: response.global_stats.cout_total_reappro,
        };

        // Données pour le tableau
        piecesStats.value = piecedetacheeOptions.value.map((piece) => {
          const pieceStats =
            response.pieces_stats.find((p: any) => p.piece_detachee_id === piece.id) ||
            {};

          return {
            ...piece,
            quantite_sortie: pieceStats.quantite_totale_sortie_net || 0,
            quantite_reappro: pieceStats.quantite_totale_reappro || 0,
            cout_sortie: pieceStats.cout_total_sortie_net || 0,
            cout_reappro: pieceStats.cout_total_reappro || 0,
            valorisation_stock: pieceStats.valorisation_stock || 0,
          };
        });
      }
    }
  } finally {
    loading.value = false;
  }
};

// Formater les nombres (pour l'affichage)
const formatNumber = (value: number) => {
  return new Intl.NumberFormat("fr-FR").format(value);
};

watch([dateDebut, dateFin, selectedMachines, selectedPiece, selectedEmplacements], () => {
  fetchStats();
});

onMounted(async () => {
  await Promise.all([
    machinesCrud.fetchItems(),
    piecesCrud.fetchItems(),
    ateliersCrud.fetchItems(),
  ]);

  fetchStats();
});
</script>

<template>
  <SectionNavigation />

  <div class="col-md-8 mb-4">
    <h2 class="page-title">Statistiques pièce détachées</h2>
  </div>

  <!-- Valorisation des stocks -->
  <div class="card border-secondary mb-4">
    <div class="card-body">
      <h4 class="card-title font-weight-bold">Valorisation des stocks</h4>
      <div class="mt-4 mb-4">
        <div class="d-flex flex-column align-items-center">
          <div>
            <h4 class="mb-0 text-white">
              {{ formatCurrency(statsData?.valorisation_stock || 0) }}
            </h4>
          </div>
        </div>
      </div>
      <p class="text-muted text-right mb-0">
        Ces valeurs ne tiennent compte des prix qu'au {{ formatLocalDate(new Date()) }}.
      </p>
    </div>
  </div>

  <!-- Filtres -->
  <div class="card border-secondary text-white mb-4">
    <div class="card-body">
      <h4 class="mb-4">Filtres</h4>
      <div class="border rounded p-3 mb-4 bg-secondary bg-opacity-25">
        <div class="row justify-content-center g-3">
          <!-- Date de début -->
          <div class="col-md-4">
            <label for="date_debut" class="form-label">Période du</label>
            <input
              v-model="dateDebut"
              class="form-control text-white border-0"
              id="date_debut"
              type="date"
            />
          </div>
          <!-- Date de fin -->
          <div class="col-md-4">
            <label for="date_fin" class="form-label">Jusqu'á</label>
            <input
              v-model="dateFin"
              class="form-control text-white border-0"
              id="date_fin"
              type="date"
            />
          </div>
        </div>
      </div>

      <!-- Ligne des selects -->
      <div class="row g-3">
        <!-- Sélection Équipement -->
        <div class="form-group col-md-4">
          <label for="equipement">Equipement:</label>
          <multiselect
            v-model="selectedMachines"
            :options="machinesOptions"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            placeholder="Sélectionnez un ou plusieurs machines"
            label="nom_machine"
            track-by="id"
            id="equipement"
          >
            <template #option="{ option }">
              <div class="option-item">
                <img :src="option.image" alt="image" class="option-icon" />
                <span>{{ option.nom_machine }}</span>
              </div>
            </template>
            <template #tag="{ option, remove }">
              <span class="multiselect__tag">
                {{ option.nom_machine }}
                <i class="multiselect__tag-icon" @click="remove(option)"></i>
              </span>
            </template>
          </multiselect>
        </div>

        <!-- Sélection Pièce détachée -->
        <div class="form-group col-md-4">
          <label for="piece">Pièce détachée:</label>
          <multiselect
            v-model="selectedPiece"
            :options="piecedetacheeOptions"
            :close-on-select="true"
            :clear-on-select="true"
            :preserve-search="true"
            placeholder="Sélectionnez une pièce détachée"
            label="nom_piecedetache"
            track-by="id"
            id="piece"
          >
            <template #option="{ option }">
              <div class="option-item">
                <img :src="option.image" alt="image" class="option-icon" />
                <span>{{ option.nom_piecedetache }}</span>
              </div>
            </template>
          </multiselect>
        </div>

        <!-- Sélection Équipement -->
        <div class="form-group col-md-4">
          <label for="emplacement">Emplacement:</label>
          <multiselect
            v-model="selectedEmplacements"
            :options="ateliersOptions"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            placeholder="Sélectionnez un ou plusieurs emplacements"
            label="nom_atelier"
            track-by="id"
            id="emplacement"
          >
            <template #tag="{ option, remove }">
              <span class="multiselect__tag">
                {{ option.nom_atelier }}
                <i class="multiselect__tag-icon" @click="remove(option)"></i>
              </span>
            </template>
          </multiselect>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading indicator -->
  <div v-if="loading" class="text-center my-4">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  </div>

  <!-- Statistiques -->
  <template v-else>
    <!-- Cartes statistiques -->
    <div class="row">
      <!-- Quantité sortie -->
      <div class="col-md-3 mb-4">
        <div class="card border-secondary h-100 text-center text-white">
          <div class="card-body d-flex flex-column justify-content-center">
            <h5 class="card-title fw-bold mb-4">Quantité totale sortie</h5>
            <div class="fs-4 stat fw-bold">
              {{
                formatNumber(
                  statsData?.quantite_totale_sortie_net > 0
                    ? statsData?.quantite_totale_sortie_net
                    : 0
                )
              }}
            </div>
            <hr class="w-50" />
            <div class="stat_brut mt-1">
              {{ formatNumber(statsData?.quantite_totale_sortie_brut || 0) }}
              <small>(brute)</small>
            </div>
          </div>
        </div>
      </div>
      <!-- Coût des sorties -->
      <div class="col-md-3 mb-4">
        <div class="card border-secondary h-100 text-center text-white">
          <div class="card-body d-flex flex-column justify-content-center">
            <h5 class="card-title fw-bold mb-4">Coût total des sorties</h5>
            <div class="fs-4 stat fw-bold">
              {{
                formatCurrency(
                  statsData?.cout_total_sortie_net > 0
                    ? statsData?.cout_total_sortie_net
                    : 0
                )
              }}
            </div>
            <hr class="w-50" />
            <div class="stat_brut mt-1">
              {{ formatCurrency(statsData?.cout_total_sortie_brut || 0) }}
              <small>(brute)</small>
            </div>
          </div>
        </div>
      </div>
      <!-- Quantité réapprovisionnée -->
      <div class="col-md-3 mb-4">
        <div class="card border-secondary h-100 text-center text-white">
          <div class="card-body d-flex flex-column justify-content-center">
            <h5 class="card-title fw-bold mb-4">Quantité totale réapprovisionnée</h5>
            <div class="fs-4 stat fw-bold">
              {{ formatNumber(statsData?.quantite_totale_reappro || 0) }}
            </div>
            <div class="text-muted mt-2"><small>Période actuelle</small></div>
          </div>
        </div>
      </div>
      <!-- Coût des réapprovisionnements -->
      <div class="col-md-3 mb-4">
        <div class="card border-secondary h-100 text-center text-white">
          <div class="card-body d-flex flex-column justify-content-center">
            <h5 class="card-title fw-bold mb-4">Coût total des réapprovisionnements</h5>
            <div class="fs-4 stat fw-bold">
              {{ formatCurrency(statsData?.cout_total_reappro || 0) }}
            </div>
            <div class="text-muted mt-2"><small>Période actuelle</small></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des pieces detachees -->
    <div v-if="!selectedPiece" class="row">
      <div class="col-md-12">
        <div class="card shadow">
          <div class="card-header">
            <h3 class="card-title">Pièces détachées</h3>
          </div>
          <div class="card-body">
            <table id="datatable-1" class="table table-bordered table-hover">
              <thead>
                <tr role="row">
                  <th><strong>Image</strong></th>
                  <th style="width: 22%">
                    <strong>Pièce détachée</strong>
                  </th>
                  <th>
                    <strong>Emplacement</strong>
                  </th>
                  <th>
                    <strong>Prix unitaire</strong>
                  </th>
                  <th>
                    <strong>Sortie </strong>
                  </th>
                  <th>
                    <strong>Réappro</strong>
                  </th>
                  <th>
                    <strong>Coût des sorties</strong>
                  </th>
                  <th>
                    <strong>Coût réappro</strong>
                  </th>
                  <th>
                    <strong>Valorisation stock</strong>
                  </th>
                </tr>
              </thead>
              <tbody class="tbody-piece">
                <tr v-for="piece in piecesStats" :key="piece.id" class="tr-piece">
                  <td>
                    <div class="avatar avatar-md">
                      <img
                        :src="piece.image"
                        :alt="piece.nom_piecedetache"
                        class="avatar-img"
                      />
                    </div>
                  </td>
                  <td>
                    <RouterLink
                      class="routerlink_piece"
                      :to="`/detailPieceDetache/${piece.id}`"
                    >
                      <strong style="color: #5ec0d8">{{ piece.nom_piecedetache }}</strong>
                    </RouterLink>
                    <hr />
                    <i class="material-icons fe-16 mr-2 notranslate">sell</i>
                    {{ piece.code_article || "N/A" }}
                  </td>
                  <td>{{ piece.emplacement?.nom_atelier || "N/A" }}</td>
                  <td>{{ formatCurrency(piece.prix_unitaire) }}</td>
                  <td>{{ formatNumber(piece.quantite_sortie) }}</td>
                  <td>{{ formatNumber(piece.quantite_reappro) }}</td>
                  <td>{{ formatCurrency(piece.cout_sortie) }}</td>
                  <td>{{ formatCurrency(piece.cout_reappro) }}</td>
                  <td>{{ formatCurrency(piece.valorisation_stock) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
hr {
  border: 1px solid #80837b;
}

.stat {
  font-size: x-large;
}
.stat_brut {
  font-size: 21px;
}

.option-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 18px;
}
.option-item {
  display: flex;
  align-items: center;
}

.multiselect__tag {
  background: #5ec0d8;
}

.multiselect__tag-icon:after {
  color: white;
}

.multiselect__tag-icon:hover {
  background: #4aa8c0;
}
</style>

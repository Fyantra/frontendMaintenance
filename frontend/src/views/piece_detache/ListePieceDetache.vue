<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import { dotColor, getformatNumber } from "@/composables/useFonction";
import { PieceDetachee, ActiveFilters } from "@/types/PieceDetacheType";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import ReapproModal from "./ReapproModal.vue";

// Récupérer les données des pièces détachées
const pieceDetacheCrud = useCrud<PieceDetachee>("piece/piecedetachees/");

const errorMessage = pieceDetacheCrud.errorMessage;
const error401Message = pieceDetacheCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const { formatNumber } = getformatNumber();

const selectedPiece = ref<PieceDetachee>(null);

const openReapproModal = (piece: PieceDetachee) => {
  selectedPiece.value = piece;
  $("#reapproModal").modal("show");
};

const formFilters = ref({
  quantite_min: null as number,
  quantite_max: null as number,
  prix_min: null as number,
  prix_max: null as number,
});

const activeFilters = ref<ActiveFilters>({
  quantite_min: null,
  quantite_max: null,
  prix_min: null,
  prix_max: null,
});

const selectedFilter = ref("all"); //par defaut 'all'

// Calculer les pièces filtrés
const filteredPieces = computed(() => {
  let filtered = pieceDetacheCrud.items.value;

  // Appliquer le filtre de stock
  if (selectedFilter.value === "insuffisant") {
    filtered = filtered.filter((piece) => piece.quantite < piece.stock_min);
  } else if (selectedFilter.value === "surstock") {
    filtered = filtered.filter(
      (piece) => piece.stock_max !== null && piece.quantite > piece.stock_max
    );
  }

  // Appliquer les filtres avancés(formulaire)
  if (activeFilters.value.quantite_min !== null) {
    filtered = filtered.filter(
      (piece) => piece.quantite >= activeFilters.value.quantite_min
    );
  }
  if (activeFilters.value.quantite_max !== null) {
    filtered = filtered.filter(
      (piece) => piece.quantite <= activeFilters.value.quantite_max
    );
  }
  if (activeFilters.value.prix_min !== null) {
    filtered = filtered.filter(
      (piece) => piece.prix_unitaire >= activeFilters.value.prix_min
    );
  }
  if (activeFilters.value.prix_max !== null) {
    filtered = filtered.filter(
      (piece) => piece.prix_unitaire <= activeFilters.value.prix_max
    );
  }
  return filtered;
});

// Compter les pièces total
const total = computed(() => pieceDetacheCrud.items.value.length);

const tousCount = computed(() => {
  // Si aucun filtre avancé, retourner le nombre total
  if (Object.values(activeFilters.value).every((val) => val === null)) {
    return pieceDetacheCrud.items.value.length;
  } else {
    return filteredPieces.value.length;
  }
});

const insuffisantCount = computed(() => {
  if (Object.values(activeFilters.value).every((val) => val === null)) {
    return pieceDetacheCrud.items.value.filter(
      (piece) => piece.quantite < piece.stock_min
    ).length;
  } else {
    return filteredPieces.value.filter((piece) => piece.quantite < piece.stock_min)
      .length;
  }
});

const surstockCount = computed(() => {
  if (Object.values(activeFilters.value).every((val) => val === null)) {
    return pieceDetacheCrud.items.value.filter(
      (piece) => piece.stock_max !== null && piece.quantite > piece.stock_max
    ).length;
  } else {
    return filteredPieces.value.filter(
      (piece) => piece.stock_max !== null && piece.quantite > piece.stock_max
    ).length;
  }
});

// Appliquer le filtre de stock
const applyFilter = (filter: any) => {
  selectedFilter.value = filter;
  refreshData();
};

// Appliquer le filtre avancé
const applyFormFilter = () => {
  activeFilters.value = {
    quantite_min: formFilters.value.quantite_min,
    quantite_max: formFilters.value.quantite_max,
    prix_min: formFilters.value.prix_min,
    prix_max: formFilters.value.prix_max,
  };
  $("#filtreModal").modal("hide");
  refreshData();
};

// Supprimer un filtre
const removeFilter = (key: keyof ActiveFilters) => {
  delete activeFilters.value[key];
  activeFilters.value[key] = null;
  refreshData();
};

// Rafraîchir les données
const refreshData = async () => {
  await pieceDetacheCrud.initializeDataTable();
};

onMounted(async () => {
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
      <h2 class="page-title">Liste des pièces détachées</h2>
    </div>

    <RouterLink to="/ajoutPiecedetache">
      <button type="button" class="btn btn-primary">
        <span class="fe fe-plus fe-16 mr-2"></span>Ajouter une pièce détachée
      </button>
    </RouterLink>
  </div>

  <p class="mt-3">
    <i class="material-icons nb notranslate">handyman</i>
    <span v-if="total > 1" class="ml-3 item-text"
      >{{ total }} Pièces détachées au total</span
    >
    <span v-else class="ml-3 item-text">{{ total }} Pièce détachée au total</span>
  </p>

  <div class="row justify-content-center">
    <div class="col-12">
      <div class="row items-align-center my-4 d-none d-lg-flex">
        <!--Filtre sur les stock-->
        <div class="col-md">
          <ul class="nav nav-pills justify-content-start">
            <li class="nav-item">
              <a
                class="nav-link all"
                :class="{ active: selectedFilter === 'all' }"
                @click.prevent="applyFilter('all')"
              >
                Tous<span class="badge badge-pill bg-primary text-white ml-2">{{
                  tousCount
                }}</span>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: selectedFilter === 'insuffisant' }"
                @click.prevent="applyFilter('insuffisant')"
              >
                Stock insuffisant<span
                  class="badge badge-pill bg-primary text-white ml-2"
                  >{{ insuffisantCount }}</span
                >
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: selectedFilter === 'surstock' }"
                @click.prevent="applyFilter('surstock')"
              >
                En surstock<span class="badge badge-pill bg-primary text-white ml-2">{{
                  surstockCount
                }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!--Modal de filtre-->
        <div
          class="modal fade"
          id="filtreModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="filtreModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="filtreModalLabel">
                  Ajouter des filtres de pièce détachée
                </h5>
                <button
                  type="button"
                  class="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="applyFormFilter">
                  <div class="form-group">
                    <label for="quantite_min" class="col-form-label"
                      >Quantité minimum</label
                    >
                    <input
                      type="number"
                      id="quantite_min"
                      class="form-control"
                      v-model.number="formFilters.quantite_min"
                    />
                  </div>
                  <div class="form-group">
                    <label for="quantite_max" class="col-form-label"
                      >Quantité maximum</label
                    >
                    <input
                      type="number"
                      id="quantite_max"
                      class="form-control"
                      v-model.number="formFilters.quantite_max"
                    />
                  </div>
                  <div class="form-group">
                    <label for="prix_min" class="col-form-label"
                      >Prix unitaire minimum</label
                    >
                    <input
                      type="number"
                      id="prix_min"
                      class="form-control"
                      v-model.number="formFilters.prix_min"
                    />
                  </div>
                  <div class="form-group">
                    <label for="prix_max" class="col-form-label"
                      >Prix unitaire maximum</label
                    >
                    <input
                      type="number"
                      id="prix_max"
                      class="form-control"
                      v-model.number="formFilters.prix_max"
                    />
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">
                      Annuler
                    </button>
                    <button type="submit" class="btn btn-primary">Appliquer</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!--Liste des filtres-->
        <div class="col-md-auto ml-auto text-right">
          <span v-for="(value, key) in activeFilters" :key="key">
            <span v-if="value !== null" class="bg-white border py-1 px-2 rounded mr-1">
              <a href="#" class="text-muted" @click.prevent="removeFilter(key)"
                ><i class="fe fe-x mx-1"></i
              ></a>
              <span>{{ key }}: {{ value }}</span>
            </span>
          </span>
          <button
            type="button"
            class="btn"
            data-toggle="modal"
            data-target="#filtreModal"
          >
            <span class="fe fe-filter fe-16"></span>
          </button>
          <button type="button" class="btn" @click="refreshData">
            <span class="fe fe-refresh-ccw fe-16 text-muted"></span>
          </button>
        </div>
      </div>

      <!--Liste des pièces détachées-->
      <div class="row">
        <div class="col-md-12">
          <div class="card shadow">
            <div class="card-body">
              <div class="toolbar row mb-3">
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
                      Telecharger
                    </button>
                    <div class="dropdown-menu" aria-labelledby="actionMenuButton">
                      <a class="dropdown-item" href="#">CSV</a>
                      <a class="dropdown-item" href="#">PDF</a>
                      <a class="dropdown-item" href="#">Excel</a>
                    </div>
                  </div>
                </div>
              </div>
              <table id="datatable-1" class="table table-hover">
                <thead class="thead-piece">
                  <tr>
                    <th>
                      <strong
                        ><i class="material-icons fe-12 mr-1 notranslate">tag</i>
                        ID</strong
                      >
                    </th>
                    <th>
                      <strong><i class="fe fe-image fe-12 mr-2"></i>Image</strong>
                    </th>
                    <th>
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate">handyman</i
                        >Nom</strong
                      >
                    </th>
                    <th>
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate">money</i>Prix
                        unitaire</strong
                      >
                    </th>
                    <th>
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate">layers</i
                        >Quantité</strong
                      >
                    </th>
                    <th>
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate">storefront</i
                        >Emplacement</strong
                      >
                    </th>
                    <th>
                      <strong
                        ><i class="material-icons fe-12 mr-2 notranslate"
                          >calendar_today</i
                        >Date de création</strong
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
                  <tr v-for="piece in filteredPieces" :key="piece.id" class="tr-piece">
                    <td>
                      <span>{{ piece.id }}</span>
                    </td>
                    <td>
                      <div v-if="piece.image" class="avatar avatar-md">
                        <img
                          :src="piece.image"
                          alt="Ceci est un image"
                          class="avatar-img"
                        />
                      </div>
                      <div
                        v-else
                        class="material-icons notranslate"
                        style="font-size: 6rem"
                      >
                        handyman
                      </div>
                    </td>
                    <!--Nom et modele-->
                    <th scope="col">
                      <strong
                        ><RouterLink
                          class="routerlink_piece"
                          :to="{ name: 'detailPieceDetache', params: { id: piece.id } }"
                          >{{ piece.nom_piecedetache }}
                          <ForeignKeyDisplay
                            :description="piece.modele?.nom_modele"
                          /> </RouterLink
                      ></strong>
                    </th>

                    <td :data-order="piece.prix_unitaire">
                      {{ formatNumber(piece.prix_unitaire) }} Ariary
                    </td>
                    <td>
                      <div class="d-flex align-items-center justify-content-center">
                        <span
                          :class="[
                            'dot',
                            'dot-lg',
                            dotColor(piece.quantite, piece.stock_min, piece.stock_max),
                            'mr-2',
                          ]"
                        ></span>
                        <span>{{ piece.quantite }}</span>
                      </div>
                    </td>
                    <td>
                      <ForeignKeyDisplay :description="piece.emplacement?.nom_atelier" />
                    </td>
                    <td :data-order="piece.date_creation">
                      {{ new Date(piece.date_creation).toLocaleDateString() }}
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
                          <a @click="openReapproModal(piece)" class="dropdown-item"
                            ><i class="material-icons layers mr-4 notranslate">layers</i
                            >Réapprovisionner</a
                          >
                          <a
                            class="dropdown-item"
                            @click="
                              $router.push({
                                name: 'modifierPieceDetache',
                                params: { id: piece.id },
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

  <!--Modal de reapprovisionnement-->
  <ReapproModal :piece="selectedPiece" @refreshPiece="refreshData" />
</template>

<style scoped>
.nb {
  line-height: 0;
  vertical-align: middle;
}

.layers {
  font-size: 15px;
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

.all {
  border-top: dashed;
}
</style>

<style>
.dataTables_wrapper {
  margin-top: 20px;
}
</style>

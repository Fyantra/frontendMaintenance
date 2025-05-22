<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCrud } from "@/composables/useCrud";
import { dotColor } from "@/composables/useFonction";
import { formatDateTime, getformatNumber } from "@/composables/useFonction";
import { Machine } from "@/types/MachineType";
import {
  HistoriqueMouvementPieceDetachee,
  PieceDetachee,
} from "@/types/PieceDetacheType";
import TableauDetailPiecedetache from "./TableauDetailPiecedetache.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import ReapproModal from "./ReapproModal.vue";

const route = useRoute();
const router = useRouter();
const pieceDetacheCrud = useCrud<PieceDetachee>("piece/piecedetachees/");
const machineCrud = useCrud<Machine>("machine/machines/");
const historiqueMouvementPieceCrud = useCrud<HistoriqueMouvementPieceDetachee>(
  "piece/historique_mouvement_pieces/"
);

const errorMessage = pieceDetacheCrud.errorMessage;
const error401Message = pieceDetacheCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const piece = ref<PieceDetachee | null>(null);
const machines = ref<Machine[]>([]);
const historiqueMouvementPiece = ref<HistoriqueMouvementPieceDetachee[]>([]);

const { formatNumber } = getformatNumber();
// Recuperer l'ID de la piece depuis l'URL
const pieceId = route.params.id;

const fetchPieceDetails = async () => {
  try {
    await pieceDetacheCrud.fetchItemsById(Number(pieceId));
    piece.value = pieceDetacheCrud.items.value[0];

    await machineCrud.fetchItems();
    machines.value = machineCrud.items.value.filter((machine) =>
      machine.pieces_detachees?.some(
        (piecedetachees) => piecedetachees.id === piece.value.id
      )
    );

    await historiqueMouvementPieceCrud.fetchItems();
    historiqueMouvementPiece.value = historiqueMouvementPieceCrud.items.value.filter(
      (historique) => historique.piece_detachee === piece.value.id
    );
  } catch (err) {
    console.error("Erreur lors du recuperation des details");
  }

  refreshData();
};

const deleteItem = async (id: number) => {
  try {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce pièce détachée ?")) {
      await pieceDetacheCrud.deleteItemWithoutInitialize(id);
      router.push("/listePiecedetache");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
};

const refreshData = async () => {
  await machineCrud.initializeDataTableWithId("datatable-machines");
};

onMounted(() => {
  fetchPieceDetails();
});
</script>

<template>
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />

  <div v-if="piece" class="row justify-content-center">
    <div class="col-12">
      <div class="row align-items-center mb-4">
        <div class="col md-7">
          <h2 class="h5 page-title">
            <small class="text-muted text-uppercase">Détail pièce détachée</small
            ><br />#PD{{ piece.id }}
          </h2>
        </div>
        <div class="col-auto">
          <button
            data-toggle="modal"
            data-target="#reapproModal"
            type="button"
            class="btn btn-success text-white"
          >
            <span class="material-icons layers fe-16 mr-2 notranslate">layers</span
            >Réapprovisionner
          </button>

          <button
            @click="
              $router.push({ name: 'modifierPieceDetache', params: { id: piece.id } })
            "
            type="button"
            class="btn btn-primary ml-3"
          >
            <span class="fe fe-edit-2 fe-16 mr-2"></span>Modifier la pièce détachée
          </button>
          <button @click="deleteItem(piece.id)" type="button" class="btn btn-danger ml-3">
            <span class="fe fe-delete fe-16 mr-2"></span>Supprimer
          </button>
        </div>
      </div>
      <div class="row my-4">
        <div class="col-md-9">
          <div class="card shadow mb-4">
            <div class="card-header">
              <strong class="card-title text-uppercase"
                >{{ piece.nom_piecedetache }}
                <ForeignKeyDisplay :description="piece.modele?.nom_modele" />
              </strong>
              <span class="float-right"
                ><i class="material-icons badge-icon notranslate mr-2">handyman</i
                ><span
                  :class="[
                    'badge badge-pill',
                    'text-white',
                    dotColor(piece.quantite, piece.stock_min, piece.stock_max),
                  ]"
                  >Pièce détachée
                </span></span
              >
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <img
                    v-if="piece.image"
                    :src="piece.image"
                    alt="Image du produit"
                    class="img-fluid"
                    style="max-width: 192px; max-height: 256px"
                  />
                  <div v-else class="material-icons notranslate" style="font-size: 12rem">
                    handyman
                  </div>
                </div>

                <div class="col-md-8">
                  <div class="row">
                    <div class="col-12 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">description</i>
                        <div>
                          <div class="text-muted">Description</div>
                          <div v-if="piece.description">
                            {{ piece.description }}
                          </div>
                          <div v-else>Aucun description</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="piece.emplacement?.nom_atelier" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons notranslate mr-4">storefront</i>
                        <div>
                          <div class="text-muted">Emplacement</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="piece.emplacement?.nom_atelier"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">money</i>
                        <div>
                          <div class="text-muted">Prix Unitaire</div>
                          <div>{{ formatNumber(piece.prix_unitaire) }} Ariary</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">layers</i>
                        <div>
                          <div class="text-muted">Quantité</div>
                          <div>{{ piece.quantite }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="piece.lot_de_reapprovisionnement" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">shopping_cart</i>
                        <div>
                          <div class="text-muted">Lot de réapprovisionnement</div>
                          <div>{{ piece.lot_de_reapprovisionnement }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">expand_less</i>
                        <div>
                          <div class="text-muted">Stock Minimum</div>
                          <div>{{ piece.stock_min }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="piece.stock_max" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">expand_more</i>
                        <div>
                          <div class="text-muted">Stock Maximum</div>
                          <div>{{ piece.stock_max }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="piece.fournisseur?.nom_fournisseur" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">business_center</i>
                        <div>
                          <div class="text-muted">Fournisseur</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="piece.fournisseur?.nom_fournisseur"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="piece.date_achat" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">event</i>
                        <div>
                          <div class="text-muted">Date et heure d'achat</div>
                          <div>{{ formatDateTime(String(piece.date_achat)) }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="piece.reference_fabricant" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">factory</i>
                        <div>
                          <div class="text-muted">Référence fabricant</div>
                          <div>{{ piece.reference_fabricant }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow mb-4">
            <div class="card-body">
              <h3 class="h6 mb-1">Temps passé sur le groupe d'équipement</h3>
              <p class="text-muted mb-4">
                C'est le total des temp passés sur les équipement liées
              </p>
              <ul class="list-unstyled">
                <li class="my-1"><i class="fe fe-clock mr-2"></i>0h 0mn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TableauDetailPiecedetache
    :machines="machines"
    :historiqueMouvementPieceDetachee="historiqueMouvementPiece"
  />

  <!--Modal de reapprovisionnement-->
  <ReapproModal :piece="piece" @refreshPiece="fetchPieceDetails" />
</template>

<style scoped>
.layers {
  line-height: 0;
  vertical-align: middle;
}

.badge-icon {
  font-size: 15px;
  line-height: 0;
  vertical-align: middle;
}

img {
  height: 256px;
  border-radius: 10px;
}

img:hover {
  box-shadow: blue;
}
</style>

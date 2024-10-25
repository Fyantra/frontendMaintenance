<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCrud } from "@/composables/useCrud";
import { formatDateTime } from "@/composables/useDateConfig";
import { PieceDetachee } from "@/types/PieceDetacheType";
import TableauDetailPiecedetache from "./TableauDetailPiecedetache.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";

const route = useRoute();
const pieceDetacheCrud = useCrud<PieceDetachee>("piece/piecedetachees/");

const errorMessage = pieceDetacheCrud.errorMessage;
const error401Message = pieceDetacheCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const piece = ref<PieceDetachee | null>(null);

// Recuperer l'ID de la piece depuis l'URL
const pieceId = route.params.id;

const fetchPieceDetails = async () => {
  try {
    await pieceDetacheCrud.fetchItemsById(Number(pieceId));
    piece.value = pieceDetacheCrud.items.value[0];
  } catch (err) {
    console.error("Erreur lors du recuperation des details");
  }
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
        <div class="col">
          <h2 class="h5 page-title">
            <small class="text-muted text-uppercase">Detail pièces détachée</small
            ><br />#PD{{ piece.id }}
          </h2>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-secondary">Close</button>
          <button type="button" class="btn btn-primary">Assign</button>
        </div>
      </div>
      <div class="row my-4">
        <div class="col-md-9">
          <div class="card shadow mb-4">
            <div class="card-header">
              <strong class="card-title text-uppercase"
                >{{ piece.nom_piecedetache }}
                <ForeignKeyDisplay :description="piece.modele.nom_modele" />
              </strong>
              <span class="float-right"
                ><i class="material-icons badge-icon notranslate mr-2">handyman</i
                ><span class="badge badge-pill badge-success text-white"
                  >Pièce détachée
                </span></span
              >
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 text-center">
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

                    <div v-if="piece.emplacement.nom_atelier" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">storefront</i>
                        <div>
                          <div class="text-muted">Emplacement</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="piece.emplacement.nom_atelier"
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
                          <div>{{ piece.prix_unitaire }} Ariary</div>
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

                    <div v-if="piece.fournisseur.nom_fournisseur" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">business_center</i>
                        <div>
                          <div class="text-muted">Fournisseur</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="piece.fournisseur.nom_fournisseur"
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
        <!-- <div class="col-md-3">
          <div class="card shadow mb-4">
            <div class="card-body">
              <h3 class="h5 mb-1">Integrations</h3>
              <p class="text-muted mb-4">How to integrate the theme?</p>
              <ul class="list-unstyled">
                <li class="my-1">
                  <i class="fe fe-file-text mr-2 text-muted"></i>Lorem ipsum dolor sit
                  amet
                </li>
                <li class="my-1">
                  <i class="fe fe-file-text mr-2 text-muted"></i>Consectetur adipiscing
                  elit
                </li>
                <li class="my-1">
                  <i class="fe fe-file-text mr-2 text-muted"></i>Integer molestie lorem
                </li>
                <li class="my-1">
                  <i class="fe fe-file-text mr-2 text-muted"></i>Facilisis in pretium
                </li>
                <li class="my-1">
                  <i class="fe fe-file-text mr-2 text-muted"></i>Nulla volutpat aliquam
                  velit
                </li>
              </ul>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
  <div v-else><p>Erreur lors du recuperation des details!</p></div>

  <TableauDetailPiecedetache />
</template>

<style scoped>
/* .material-icons {
  line-height: 0;
  vertical-align: middle;
} */

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

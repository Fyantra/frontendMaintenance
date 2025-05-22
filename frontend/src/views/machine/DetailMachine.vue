<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCrud } from "@/composables/useCrud";
import { getStatusForMachine } from "@/composables/useFonction";
import TableauDetailMachine from "./TableauDetailMachine.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import {
  HistoriqueDeplacementmachine,
  Machine,
  Status,
  MachineRelation,
} from "@/types/MachineType";
import { PieceDetachee } from "@/types/PieceDetacheType";
import { Tache, ActiviteTache } from "@/types/TacheType";

const route = useRoute();
const router = useRouter();
const machineCrud = useCrud<Machine>("machine/machines/");
const statusCrud = useCrud<Status>("machine/status/");
const relationCrud = useCrud<MachineRelation>("machine/machine_relation/");
const pieceCrud = useCrud<PieceDetachee>("piece/piecedetachees/");
const historiqueDeplacementCrud = useCrud<HistoriqueDeplacementmachine>(
  "machine/historique_machine/"
);
const tacheCrud = useCrud<Tache>("tache/taches/");
const activiteCrud = useCrud<ActiviteTache>("tache/activites_taches/");

//gestion loading
const loadingButton = ref(false);

const errorMessage = machineCrud.errorMessage;
const error401Message = machineCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

const machine = ref<Machine | null>(null);
const machineRelations = ref<MachineRelation[]>([]);
const piecesDetachees = ref<PieceDetachee[]>([]);
const historiqueDeplacement = ref<HistoriqueDeplacementmachine[]>([]);
const taches = ref<Tache[]>([]);
const activites = ref<ActiviteTache[]>([]);

const fetchMachineDetails = async (machineId: number) => {
  try {
    await statusCrud.fetchItems();
    await machineCrud.fetchItemsById(Number(machineId));
    machine.value = machineCrud.items.value[0];

    await relationCrud.fetchItems();
    machineRelations.value = relationCrud.items.value.filter(
      (relation) => relation.machine_principale === machine.value.id
    );

    await historiqueDeplacementCrud.fetchItems();
    historiqueDeplacement.value = historiqueDeplacementCrud.items.value.filter(
      (historique) => historique.machine?.id === machine.value.id
    );

    if (machine.value.pieces_detachees_id) {
      piecesDetachees.value = machine.value.pieces_detachees;
    }

    await tacheCrud.fetchItems();
    taches.value = tacheCrud.items.value.filter(
      (tache) => tache.machine.id === machineId
    );

    // Récupération des activités liées aux tâches
    await activiteCrud.fetchItems();
    activites.value = activiteCrud.items.value.filter((activite) =>
      taches.value.some((tache) => tache.id === activite.tache)
    );

    refreshData();
  } catch (err) {
    console.error("Erreur lors du recuperation des details");
  }
};

const deleteItem = async (id: number) => {
  try {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce machine ?")) {
      await machineCrud.deleteItemWithoutInitialize(id);
      router.push("/listeMachine");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
};

const refreshData = async () => {
  await relationCrud.initializeDataTableWithId("datatable-machines");
  await pieceCrud.initializeDataTableWithId("datatable-pieces");
  await historiqueDeplacementCrud.initializeDataTableWithId("datatable-deplacement");
};

// Recuperer l'ID de la machine depuis l'URL
const machineId = ref<number>(Number(route.params.id));

onMounted(async () => {
  fetchMachineDetails(machineId.value);
});

watch(
  () => route.params.id,
  (newId) => {
    machineId.value = Number(newId);
    fetchMachineDetails(machineId.value);
  }
);
</script>

<template>
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />

  <div v-if="machine" class="row justify-content-center">
    <div class="col-12">
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="h5 page-title">
            <small class="text-muted text-uppercase">Détail équipement</small
            ><br />#MACHINE
          </h2>
        </div>
        <div class="col-auto">
          <button
            @click="$router.push({ name: 'modifierMachine', params: { id: machine.id } })"
            type="button"
            :disabled="loadingButton"
            class="btn btn-primary ml-3"
          >
            <span v-if="loadingButton" class="spinner-border spinner-border-sm"></span>
            <span class="fe fe-edit-2 fe-16 mr-2"></span>Modifier le machine
          </button>
          <button
            @click="
              $router.push({
                name: 'ajoutTacheMachine',
                params: { machineId: machine.id },
              })
            "
            type="button"
            :disabled="loadingButton"
            class="btn btn-primary ml-3"
          >
            <span v-if="loadingButton" class="spinner-border spinner-border-sm"></span>
            <span class="fe fe-plus fe-16 mr-2"></span>Créer une tâche
          </button>
          <button
            @click="deleteItem(machine.id)"
            type="button"
            class="btn btn-danger ml-3"
          >
            <span class="fe fe-delete fe-16 mr-2"></span>Supprimer
          </button>
        </div>
      </div>
      <div class="row my-4">
        <div class="col-md-9">
          <div class="card shadow mb-4">
            <div class="card-header">
              <strong class="card-title text-uppercase"
                >{{ machine.nom_machine }}
                <ForeignKeyDisplay :description="machine.marque?.nom_marque" />
                N° {{ machine.numero_machine }}
              </strong>
              <span class="float-right"
                ><i class="material-icons badge-icon notranslate mr-2"
                  >precision_manufacturing</i
                ><span
                  class="badge badge-pill text-white"
                  :style="{
                    backgroundColor: getStatusForMachine(machine, statusCrud.items.value)
                      ?.couleur,
                  }"
                >
                  <ForeignKeyDisplay
                    :description="
                      getStatusForMachine(machine, statusCrud.items.value)?.nom_status
                    "
                  /> </span
              ></span>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 text-center">
                  <img
                    v-if="machine.image"
                    :src="machine.image"
                    alt="Image du produit"
                    class="img-fluid"
                    style="max-width: 192px; max-height: 256px"
                  />
                  <div v-else class="material-icons notranslate" style="font-size: 12rem">
                    precision_manufacturing
                  </div>
                </div>

                <div class="col-md-8">
                  <div class="row">
                    <div class="col-12 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">description</i>
                        <div>
                          <div class="text-muted">Description</div>
                          <div v-if="machine.description">
                            {{ machine.description }}
                          </div>
                          <div v-else>Aucun description</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.atelier?.nom_atelier" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">storefront</i>
                        <div>
                          <div class="text-muted">Atelier</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="machine.atelier?.nom_atelier"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.modele?.nom_modele" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">view_module</i>
                        <div>
                          <div class="text-muted">Modèle</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="machine.modele?.nom_modele"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.chaine?.nom_chaine" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">storefront</i>
                        <div>
                          <div class="text-muted">Chaine</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="machine.chaine?.nom_chaine"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">confirmation_number</i>
                        <div>
                          <div class="text-muted">Numéro de série</div>
                          <div>{{ machine.numero_de_serie }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.numero_de_moteur" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">confirmation_number</i>
                        <div>
                          <div class="text-muted">Numéro de moteur</div>
                          <div>{{ machine.numero_de_moteur }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.type?.nom_type" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">widgets</i>
                        <div>
                          <div class="text-muted">Type</div>
                          <div>
                            <ForeignKeyDisplay :description="machine.type?.nom_type" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.date_acquisition" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">event</i>
                        <div>
                          <div class="text-muted">Date d'acquisition</div>
                          <div>
                            {{ new Date(machine.date_acquisition).toLocaleDateString() }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.date_mis_en_place" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">event</i>
                        <div>
                          <div class="text-muted">Date de mis en place</div>
                          <div>
                            {{ new Date(machine.date_mis_en_place).toLocaleDateString() }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.date_hors_service" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">event</i>
                        <div>
                          <div class="text-muted">Date de mis hors-service</div>
                          <div>
                            {{ new Date(machine.date_hors_service).toLocaleDateString() }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="machine.fournisseur?.nom_fournisseur"
                      class="col-sm-6 mb-5"
                    >
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">business_center</i>
                        <div>
                          <div class="text-muted">Fournisseur</div>
                          <div>
                            <ForeignKeyDisplay
                              :description="machine.fournisseur?.nom_fournisseur"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="machine.reference_fabricant" class="col-sm-6 mb-5">
                      <div class="d-flex align-items-start">
                        <i class="material-icons mr-4">factory</i>
                        <div>
                          <div class="text-muted">Référence fabricant</div>
                          <div>{{ machine.reference_fabricant }}</div>
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
              <h3 class="h6 mb-1">Temps passé sur l'équipement</h3>
              <p class="text-muted mb-4">C'est le total des temp passés sur les tâches</p>
              <ul class="list-unstyled">
                <li class="my-1">
                  <i class="fe fe-clock mr-2"></i>{{ machine.total_duree_machine }}
                </li>
              </ul>
            </div>
          </div>
          <div class="card shadow mb-4">
            <div class="card-body">
              <h3 class="h6 mb-1">Temps passé sur le groupe d'équipement</h3>
              <p class="text-muted mb-4">
                C'est le total des temp passés sur les équipement liées
              </p>
              <ul class="list-unstyled">
                <li class="my-1">
                  <i class="fe fe-clock mr-2"></i>{{ machine.total_duree_machine_liee }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TableauDetailMachine
    :machineRelations="machineRelations"
    :piecesDetachees="piecesDetachees"
    :historique-deplacement="historiqueDeplacement"
    :taches="taches"
    :activites="activites"
  />
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

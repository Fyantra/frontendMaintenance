<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";
import { Machine } from "@/types/MachineType";

// Récupérer les données des nachines
const machinesCrud = useCrud<Machine>("machine/machines/");

const errorMessage = machinesCrud.errorMessage;
const error401Message = machinesCrud.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

// Compter les pièces total
const total = computed(() => machinesCrud.items.value.length);

// Rafraîchir les données
const refreshData = async () => {
  await machinesCrud.initializeDataTable();
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
      <h2 class="page-title">Liste des machines</h2>
    </div>

    <RouterLink to="/ajoutMachine">
      <button type="button" class="btn btn-primary">
        <span class="fe fe-plus fe-16 mr-2"></span>Ajouter un machine
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
      <div class="row items-align-center my-4 d-none d-lg-flex">
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
                <form>
                  <div class="form-group">
                    <label for="quantite_min" class="col-form-label"
                      >Quantité minimum</label
                    >
                    <input type="number" id="quantite_min" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="quantite_max" class="col-form-label"
                      >Quantité maximum</label
                    >
                    <input type="number" id="quantite_max" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="prix_min" class="col-form-label"
                      >Prix unitaire minimum</label
                    >
                    <input type="number" id="prix_min" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="prix_max" class="col-form-label"
                      >Prix unitaire maximum</label
                    >
                    <input type="number" id="prix_max" class="form-control" />
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
      </div>

      <!--Liste des pièces détachées-->
      <div class="row">
        <div class="col-md-12">
          <table id="datatable-1" class="table table-borderless">
            <thead class="thead-piece">
              <tr>
                <th>
                  <strong
                    ><i class="material-icons fe-12 mr-1 notranslate">tag</i> ID</strong
                  >
                </th>
                <th>
                  <strong><i class="fe fe-image fe-12 mr-2"></i>Image</strong>
                </th>
                <th>
                  <strong
                    ><i class="material-icons fe-12 mr-2 notranslate"
                      >precision_manufacturing</i
                    >Nom</strong
                  >
                </th>
                <th>
                  <strong
                    ><i class="material-icons fe-12 mr-2 notranslate"
                      >confirmation_number</i
                    >Numero de serie
                  </strong>
                </th>
                <th>
                  <strong
                    ><i class="material-icons fe-12 mr-2 notranslate">category</i
                    >Type</strong
                  >
                </th>
                <th>
                  <strong
                    ><i class="material-icons fe-12 mr-2 notranslate">info</i
                    >Statut</strong
                  >
                </th>
                <th>
                  <strong
                    ><i class="material-icons fe-12 mr-2 notranslate">calendar_today</i
                    >Date d'acquisition</strong
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
              <tr
                v-for="machine in machinesCrud.items.value"
                :key="machine.id"
                class="tr-piece"
              >
                <td>
                  <span>{{ machine.id }}</span>
                </td>
                <td>
                  <div v-if="machine.image" class="avatar avatar-md">
                    <img
                      :src="machine.image"
                      alt="Ceci est un image"
                      class="avatar-img"
                    />
                  </div>
                  <div v-else class="material-icons notranslate" style="font-size: 6rem">
                    precision_manufacturing
                  </div>
                </td>
                <!--Nom et modele-->
                <th scope="col">
                  <strong
                    ><RouterLink
                      class="routerlink_piece"
                      :to="{ name: 'detailMachine', params: { id: machine.id } }"
                      >{{ machine.nom_machine }}
                      <ForeignKeyDisplay
                        :description="machine.marque?.nom_marque"
                      /> </RouterLink
                  ></strong>
                </th>

                <td>{{ machine.numero_de_serie }}</td>
                <td>
                  <ForeignKeyDisplay :description="machine.type?.nom_type" />
                </td>
                <td>
                  <ForeignKeyDisplay :description="machine.status?.nom_status" />
                </td>
                <td>
                  {{
                    machine.date_acquisition
                      ? new Date(machine.date_acquisition).toLocaleDateString()
                      : null
                  }}
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
                      <a class="dropdown-item"
                        ><i class="fe fe-meh fe-12 mr-4"></i>Créer une tâche</a
                      >
                      <a class="dropdown-item"
                        ><i class="fe fe-message-circle fe-12 mr-4"></i
                        >Réapprovisionner</a
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
                      <a
                        class="dropdown-item"
                        @click="machinesCrud.deleteItem(machine.id)"
                        ><i class="fe fe-delete fe-12 mr-4"></i>Supprimer</a
                      >
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

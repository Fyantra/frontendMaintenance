<script setup lang="ts">
import { ref } from "vue";
import { Machine } from "@/types/MachineType";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";

const props = defineProps<{
  machines: Machine[];
}>();

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
                id="tache-tab"
                data-toggle="tab"
                href="#tache"
                role="tab"
                aria-controls="tache"
                aria-selected="true"
                >Taches
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
                    :style="{ backgroundColor: machine.status?.couleur }"
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
                <td><ForeignKeyDisplay :description="machine.atelier?.nom_atelier" /></td>
                <td>{{ machine.date_acquisition }}</td>
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

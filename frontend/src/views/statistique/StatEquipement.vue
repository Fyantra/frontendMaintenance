<script setup lang="ts">
import SectionNavigation from "../templates/SectionNavigation.vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const chartDataStatus = {
  labels: ["En service", "Hors-service", "En panne", "En maintenance"],
  datasets: [
    {
      backgroundColor: ["#4dd0e1", "#ba68c8", "red", "gray"],
      data: [50, 50, 20, 15],
    },
  ],
};

const chartOptionsStatus: any = {
  responsive: true,
  plugins: {
    legend: {
      position: "top", // Légende à droite pour plus de lisibilité
      labels: {
        font: {
          size: 16,
        },
        color: "white",
        padding: 29, // Espace entre chaque label
        usePointStyle: true, // cercle au lieu de carré si tu préfères
      },
    },
  },
};
</script>

<template>
  <SectionNavigation />

  <div class="row mb-4">
    <div class="col-md-8">
      <h2 class="page-title">Statistiques équipement, chaine, atelier</h2>
    </div>
    <div class="col-md-4 d-flex flex-column align-items-end">
      <button type="button" class="btn btn-primary align-items-end">
        <span class="fe fe-printer mr-2"></span>IMPRIMER
      </button>
    </div>
  </div>

  <div class="card border-secondary mb-4">
    <div class="card-body">
      <div class="row">
        <div class="col-md-4">
          <div>
            <Doughnut :data="chartDataStatus" :options="chartOptionsStatus" />
          </div>
        </div>

        <!-- taches -->
        <div class="col-md-8 py-4">
          <div class="row">
            <div class="col-6 mb-5">
              <div class="dashboard-card" style="background-color: #1565c0">
                <div class="card-content">
                  <div class="text">
                    <h5 class="text-white">Equipements</h5>
                    <p>3</p>
                  </div>
                  <span class="material-icons notranslate icon"
                    >precision_manufacturing</span
                  >
                </div>
              </div>
            </div>

            <!-- Activités -->
            <div class="col-6">
              <div class="dashboard-card" style="background-color: #ef6c00">
                <div class="card-content">
                  <div class="text">
                    <h5 class="text-white">Atelier</h5>
                    <p>2</p>
                  </div>
                  <span class="material-icons notranslate icon">engineering</span>
                </div>
              </div>
            </div>

            <!-- Temps passé -->
            <div class="col-6">
              <div class="dashboard-card" style="background-color: #0097a7">
                <div class="card-content">
                  <div class="text">
                    <h5 class="text-white">Chaine</h5>
                    <p>12</p>
                  </div>
                  <span class="material-icons notranslate icon"
                    >settings_input_composite</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card {
  border-radius: 12px;
  padding: 1rem 1.2rem;
  color: white;
}

.card-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.card-content .text {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.card-content p {
  font-size: 28px;
}

.icon {
  font-size: 90px;
}
</style>

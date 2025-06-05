<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const chartDataStatus = {
  labels: ["Terminée", "En cours", "En retard", "Annulée"],
  datasets: [
    {
      backgroundColor: ["#4dd0e1", "#ba68c8", "red", "gray"],
      data: [50, 50, 20, 15],
    },
  ],
};

const chartOptionsStatus = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
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
                    <h5 class="text-white">Tâches</h5>
                    <p>3</p>
                  </div>
                  <span class="material-icons notranslate icon">build</span>
                </div>
              </div>
            </div>

            <!-- Activités -->
            <div class="col-6">
              <div class="dashboard-card" style="background-color: #ef6c00">
                <div class="card-content">
                  <div class="text">
                    <h5 class="text-white">Activités</h5>
                    <p>2</p>
                  </div>
                  <span class="material-icons notranslate icon">work</span>
                </div>
              </div>
            </div>

            <!-- Temps passé -->
            <div class="col-6">
              <div class="dashboard-card" style="background-color: #0097a7">
                <div class="card-content">
                  <div class="text">
                    <h5 class="text-white">Temps passé</h5>
                    <p>28h 40mn.</p>
                  </div>
                  <span class="material-icons notranslate icon">timer</span>
                </div>
              </div>
            </div>

            <!-- Temps moyen -->
            <div class="col-6">
              <div class="dashboard-card" style="background-color: #616161">
                <div class="card-content">
                  <div class="text">
                    <h5 class="text-white">Temps d'intervention moyen</h5>
                    <p>14h 20mn.</p>
                  </div>
                  <span class="material-icons notranslate icon">schedule</span>
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

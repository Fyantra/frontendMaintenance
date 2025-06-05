<script setup lang="ts">
import { computed } from "vue";
import { Bar, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { chartTacheOptions, chartTacheType } from "./chartOptions";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const chartData = {
  labels: ["Tache 1", "Tache 2", "Tache 3", "Tache 4"],
  datasets: [
    {
      data: [1120, 600, 120, 50],
      backgroundColor: ["#3f51b5", "#ffc107", "#4caf50", "#f44336"],
      borderRadius: 5,
    },
  ],
};

const currentChart = computed(() => (chartTacheType.value === "bar" ? Bar : Pie));
</script>

<template>
  <div class="card border-secondary py-4 mb-4">
    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <h5 class="mb-3">Top 10 des tâches</h5>
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom de la tâche</th>
                <th>Valeur</th>
                <th>Pourcentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="#" class="routerLink">Tache 1</a></td>
                <td>Tache faharoa ee</td>
                <td>18h 40mn.</td>
                <td>65.12%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="col-md-6 d-flex flex-column align-items-end">
          <div class="btn-group mb-2" role="group">
            <button
              @click="chartTacheType = 'bar'"
              type="button"
              class="btn btn-outline-primary"
              :class="{ active: chartTacheType === 'bar' }"
            >
              <i class="material-icons">bar_chart</i>
            </button>
            <button
              @click="chartTacheType = 'pie'"
              type="button"
              class="btn btn-outline-primary"
              :class="{ active: chartTacheType === 'pie' }"
            >
              <i class="material-icons">pie_chart</i>
            </button>
          </div>

          <div style="width: 100%">
            <component
              class="chart_bar"
              :is="currentChart"
              :data="chartData"
              :options="chartTacheOptions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart_bar {
  height: 350px;
}

.table td,
.table th {
  vertical-align: middle;
}
.table th {
  font-weight: bold;
}

.badge {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
}

.material-icons {
  vertical-align: middle;
}

.routerLink {
  color: #5ec0d8;
}
</style>

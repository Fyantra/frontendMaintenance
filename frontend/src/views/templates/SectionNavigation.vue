<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="row mt-4">
    <div class="col-md-3">
      <RouterLink to="/modele">
        <div class="card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-3 text-center">
                <span class="circle circle-md bg-primary justify-content-center">
                  <span class="material-icons text-white">precision_manufacturing</span>
                </span>
              </div>
              <div class="col">
                <h3 class="h6 mb-0 text-uppercase">Machines</h3>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
    <div class="col-md-3">
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-3 text-center">
              <span class="circle circle-md bg-success justify-content-center">
                <span class="material-icons text-white">handyman</span>
              </span>
            </div>
            <div class="col">
              <h3 class="h6 mb-0 text-uppercase">Pieces detaches</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-3 text-center">
              <span class="circle circle-md bg-warning justify-content-center">
                <span class="material-icons text-white">assignment</span>
              </span>
            </div>
            <div class="col">
              <h3 class="h6 mb-0 text-uppercase">Taches</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-3 text-center">
              <span class="circle circle-md bg-secondary justify-content-center">
                <span class="material-icons text-white">event</span>
              </span>
            </div>
            <div class="col">
              <h3 class="h6 mb-0 text-uppercase">Activites</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <hr class="my-4" />
</template>

<style scoped>
.material-icons {
  font-size: 30px;
}

.card:hover {
  /* background-color: #212529; */
  background-color: #474f57;
  border-color: #007bff;
}
</style>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="row mt-2">
    <div class="col-md-3">
      <RouterLink to="/listeMachine" class="nav-card-link">
        <div class="card custom-card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-3 text-center">
                <span
                  class="circle icon-circle circle-md bg-primary justify-content-center"
                >
                  <span class="material-icons notranslate text-white"
                    >precision_manufacturing</span
                  >
                </span>
              </div>
              <div class="col">
                <h3 class="h6 mb-0 text-uppercase">équipements</h3>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
    <div class="col-md-3">
      <RouterLink to="/listePiecedetache" class="nav-card-link">
        <div class="card custom-card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-3 text-center">
                <span
                  class="circle icon-circle circle-md bg-success justify-content-center"
                >
                  <span class="material-icons notranslate text-white">handyman</span>
                </span>
              </div>
              <div class="col">
                <h3 class="h6 mb-0 text-uppercase">Pièce détachées</h3>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
    <div class="col-md-3">
      <RouterLink to="/listeTache" class="nav-card-link">
        <div class="card custom-card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-3 text-center">
                <span
                  class="circle icon-circle circle-md bg-warning justify-content-center"
                >
                  <span class="material-icons notranslate text-white">assignment</span>
                </span>
              </div>
              <div class="col">
                <h3 class="h6 mb-0 text-uppercase">Tâches</h3>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
    <div class="col-md-3">
      <RouterLink to="" class="nav-card-link">
        <div class="card custom-card shadow mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-3 text-center">
                <span
                  class="circle icon-circle circle-md bg-secondary justify-content-center"
                >
                  <span class="material-icons notranslate text-white">list_alt</span>
                </span>
              </div>
              <div class="col">
                <h3 class="h6 mb-0 text-uppercase">Activités</h3>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>

  <hr class="my-4" />
</template>

<style scoped>
.material-icons {
  font-size: 30px;
}

.nav-card-link {
  text-decoration: none;
}

.custom-card {
  background: linear-gradient(145deg, #2e343b, #3d454f);
  border: none;
  border-radius: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 123, 255, 0.2);
  background: #2b3037;
}

.custom-card:hover .icon-circle {
  transform: scale(1.1);
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: transform 0.3s ease;
}
</style>

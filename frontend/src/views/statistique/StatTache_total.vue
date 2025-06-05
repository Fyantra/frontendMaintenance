<script setup lang="ts">
import SectionNavigation from "../templates/SectionNavigation.vue";
// import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import TableauBordTache from "./TableauBordTache.vue";
import StatTache_equipement from "./StatTache_equipement.vue";
import StatTache_tache from "./StatTache_tache.vue";
</script>

<template>
  <SectionNavigation />

  <div class="row mb-4">
    <div class="col-md-8">
      <h2 class="page-title">Statistiques et analyse des tâches</h2>
    </div>
    <div class="col-md-4 d-flex flex-column align-items-end">
      <button type="button" class="btn btn-primary align-items-end">
        <span class="fe fe-printer mr-2"></span>IMPRIMER
      </button>
    </div>
  </div>

  <!--Navigation de filtre-->
  <div class="nav-container card border-secondary mb-4">
    <div class="card-body">
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <span class="nav-prefix">Par</span>
        <ul
          class="nav nav-pills nav-pills-custom animate__animated animate__fadeIn"
          id="myTab"
          role="tablist"
        >
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="temps-tab"
              data-bs-toggle="pill"
              data-bs-target="#temps"
              type="button"
              role="tab"
              aria-controls="temps"
              aria-selected="true"
            >
              TEMPS D'INTERVENTION
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="activites-tab"
              data-bs-toggle="pill"
              data-bs-target="#activites"
              type="button"
              role="tab"
              aria-controls="activites"
              aria-selected="false"
            >
              NOMBRE D'ACTIVITÉS
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="nombre-tab"
              data-bs-toggle="pill"
              data-bs-target="#nombre"
              type="button"
              role="tab"
              aria-controls="nombre"
              aria-selected="false"
            >
              COUT DE TÂCHES
            </button>
          </li>
        </ul>
      </div>
      <div class="d-flex align-items-center flex-wrap my-4">
        <a
          href="#collapseFilter"
          data-toggle="collapse"
          data-target="#collapseFilter"
          aria-expanded="false"
          aria-controls="collapseFilter"
        >
          <button type="button" class="btn btn-outline-warning">
            <span class="fe fe-filter fe-16 mr-2"></span>Ajouter filtre par date de
            planification
          </button>
        </a>
      </div>
      <div
        class="border rounded p-3 bg-secondary bg-opacity-25 mt-4 collapse"
        id="collapseFilter"
      >
        <div class="row justify-content-center">
          <!-- Date de début -->
          <div class="col-md-5">
            <label for="date_debut" class="form-label text-white">Date de début</label>
            <input class="form-control text-white border-0" id="date_debut" type="date" />
          </div>
          <!-- Date de fin -->
          <div class="col-md-5">
            <label for="date_fin" class="form-label text-white">Date de fin</label>
            <input class="form-control text-white border-0" id="date_fin" type="date" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--Fin Navigation de filtre-->

  <TableauBordTache />

  <StatTache_tache />

  <StatTache_equipement />
</template>

<style scoped>
.nav-pills-custom {
  border-radius: 50px;
  padding: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-pills-custom .nav-link {
  color: #495057;
  font-weight: 500;
  border-radius: 50px;
  padding: 10px 20px;
  margin: 0 5px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.nav-pills-custom .nav-link::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(45deg, #6c757d, #adb5bd);
  transition: width 0.4s ease;
  z-index: -1;
  border-radius: 50px;
}

.nav-pills-custom .nav-link:hover {
  color: white;
  transform: translateY(-2px);
}

.nav-pills-custom .nav-link:hover::before {
  width: 100%;
}

.nav-pills-custom .nav-link.active {
  color: white;
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
  transform: translateY(-2px);
}

.nav-pills-custom .nav-link.active::before {
  display: none;
}

.nav-prefix {
  color: white;
  font-size: 20px;
}

.nav-container {
  display: flex;
  align-items: center;
}
</style>

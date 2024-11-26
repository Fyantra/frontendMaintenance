<script setup lang="ts">
import SectionNavigation from "../templates/SectionNavigation.vue";
</script>
<template>
  <SectionNavigation />
  <div>
    <div class="card shadow">
      <div class="card-header">
        <strong class="card-title">Liste de toutes les notifications</strong>
        <a class="float-right small text-muted" href="#!">View all</a>
      </div>
      <div class="card-body">
        <div class="list-group list-group-flush my-n3">
          <!--Ici le boucle sur les notifications-->
          <div class="list-group-item">
            <div class="row align-items-center">
              <div class="col-auto">
                <span class="fe fe-box fe-24"></span>
              </div>
              <div class="col">
                <small><strong>Package has uploaded successfull</strong></small>
                <div class="my-0 text-muted small">Package is zipped and uploaded</div>
              </div>
              <div class="col-auto">
                <small class="badge badge-pill badge-light text-muted">1m ago</small>
              </div>
            </div>
          </div>
          <div class="list-group-item">
            <div class="row align-items-center">
              <div class="col-auto">
                <span class="fe fe-download fe-24"></span>
              </div>
              <div class="col">
                <small><strong>Widgets are updated successfull</strong></small>
                <div class="my-0 text-muted small">
                  Just create new layout Index, form, table
                </div>
              </div>
              <div class="col-auto">
                <small class="badge badge-pill badge-light text-muted">2m ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

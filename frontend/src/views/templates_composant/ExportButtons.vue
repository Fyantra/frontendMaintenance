<script setup lang="ts">
import { useCrud } from "@/composables/useCrud";

const props = defineProps({
  modelName: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: false,
    default: "",
  },
});

const { exportData } = useCrud(props.endpoint);

const handleExport = async (format: "pdf" | "csv" | "excel") => {
  await exportData(format, props.modelName);
};
</script>

<template>
  <div class="dropdown float-right">
    <button
      class="btn btn-secondary dropdown-toggle"
      type="button"
      id="actionMenuButton"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <i class="material-icons assignment mr-2 notranslate">download</i>
      Télécharger
    </button>
    <div class="dropdown-menu" aria-labelledby="actionMenuButton">
      <a class="dropdown-item" href="#" @click.prevent="handleExport('csv')">
        <i class="material-icons assignment mr-2 notranslate">grid_on</i>
        Fichier CSV
      </a>
      <a class="dropdown-item" href="#" @click.prevent="handleExport('excel')">
        <i class="material-icons assignment mr-2 notranslate" style="color: green"
          >description</i
        >
        Fichier Excel (XLSX)
      </a>
      <a class="dropdown-item" href="#" @click.prevent="handleExport('pdf')">
        <i class="material-icons assignment mr-2 notranslate">picture_as_pdf</i>
        Fichier PDF
      </a>
    </div>
  </div>
</template>

<style scoped>
.dropdown-item {
  cursor: pointer;
}
.dropdown-item:hover {
  color: black;
}
.assignment {
  font-size: 15px;
  vertical-align: middle;
}
</style>

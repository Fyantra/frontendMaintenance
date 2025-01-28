<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useCrud } from "@/composables/useCrud";
import { Machine } from "@/types/MachineType";
import { useRoute, useRouter } from "vue-router";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import ForeignKeyDisplay from "../templates_composant/ForeignKeyDisplay.vue";

const route = useRoute();
const router = useRouter();
const machineId = route.params.id;
const machineCrud = useCrud<Machine>("machine/machines/");
const machineSource = ref<Machine | null>(null);

const errorMessage = machineCrud.errorMessage;
const error401Message = machineCrud.error401Message;

const clearError = () => {
  errorMessage.value = null;
};

// Erreurs de validation
const errors = ref<
  { numero_machine: string; numero_de_serie: string; numero_de_moteur: string }[]
>([]);

// Formulaires dynamiques pour les numéros de série et de moteur
const machinesData = ref<
  { numero_machine; numero_de_serie: string; numero_de_moteur: string }[]
>([{ numero_machine: "", numero_de_serie: "", numero_de_moteur: "" }]);

const addMachineData = () => {
  machinesData.value.push({
    numero_machine: "",
    numero_de_serie: "",
    numero_de_moteur: "",
  });
  errors.value.push({ numero_machine: "", numero_de_serie: "", numero_de_moteur: "" });
};

const removeMachineData = (index: number) => {
  machinesData.value.splice(index, 1);
  errors.value.splice(index, 1);
};

const validate = () => {
  errors.value = machinesData.value.map((item, index) => {
    const error = { numero_machine: "", numero_de_serie: "", numero_de_moteur: "" };

    if (!item.numero_machine) {
      error.numero_machine = "Numéro de machine requis.";
    } else if (
      machinesData.value.findIndex(
        (el, i) => el.numero_machine === item.numero_machine && i !== index
      ) !== -1
    ) {
      error.numero_machine = "Le numéro de machine doit être unique.";
    }

    if (!item.numero_de_serie) {
      error.numero_de_serie = "Numéro de série requis.";
    } else if (
      machinesData.value.findIndex(
        (el, i) => el.numero_de_serie === item.numero_de_serie && i !== index
      ) !== -1
    ) {
      error.numero_de_serie = "Le numéro de série doit être unique.";
    }

    if (!item.numero_de_moteur) {
      error.numero_de_moteur = "Numéro de moteur requis.";
    } else if (
      machinesData.value.findIndex(
        (el, i) => el.numero_de_moteur === item.numero_de_moteur && i !== index
      ) !== -1
    ) {
      error.numero_de_moteur = "Le numéro de moteur doit être unique.";
    }

    return error;
  });
};

watch(
  machinesData,
  () => {
    validate(); // Valider à chaque changement
  },
  { deep: true }
);

// Données de la machine source
onMounted(async () => {
  if (machineId) {
    await machineCrud.fetchItemsById(Number(machineId));
    machineSource.value = machineCrud.items.value[0];
  }
});

const submitForm = async () => {
  validate();

  if (
    errors.value.every(
      (error) =>
        error.numero_machine === "" &&
        error.numero_de_serie === "" &&
        error.numero_de_moteur === ""
    )
  ) {
    const formDataList: FormData[] = await Promise.all(
      machinesData.value.map(async (item) => {
        const formData = new FormData();
        formData.append("nom_machine", machineSource.value!.nom_machine);
        formData.append("numero_machine", item.numero_machine);
        formData.append("numero_de_serie", item.numero_de_serie);
        formData.append("numero_de_moteur", item.numero_de_moteur || "");
        formData.append("description", machineSource.value!.description || "");
        formData.append("type_id", String(machineSource.value!.type_id || ""));
        formData.append("marque_id", String(machineSource.value!.marque_id || ""));
        formData.append("atelier_id", String(machineSource.value!.atelier_id || ""));
        formData.append("chaine_id", String(machineSource.value!.chaine_id || ""));
        formData.append(
          "date_mis_en_place",
          String(machineSource.value!.date_mis_en_place || "")
        );
        formData.append(
          "date_acquisition",
          String(machineSource.value!.date_acquisition || "")
        );
        //   formData.append(
        //     "identifiant_status_machine",
        //     String(machineSource.value!.identifiant_status_machine)
        //   );
        formData.append(
          "date_hors_service",
          String(machineSource.value!.date_hors_service || "")
        );
        formData.append(
          "reference_fabricant",
          String(machineSource.value!.reference_fabricant || "")
        );
        formData.append(
          "fournisseur_id",
          String(machineSource.value!.fournisseur_id || "")
        );

        // Ajout des pièces détachées liées
        machineSource.value?.pieces_detachees?.forEach((piece) => {
          formData.append("pieces_detachees_id", String(piece.id));
        });

        // Ajout de l'image si existante
        if (machineSource.value?.image) {
          const response = await fetch(machineSource.value.image);
          if (response.ok) {
            const blob = await response.blob();
            formData.append("image", blob, "machine_image.png");
          } else {
            console.error(
              "Erreur lors du téléchargement de l'image :",
              response.statusText
            );
          }
        }

        return formData;
      })
    );

    // Insertion des nouvelles machines en boucle
    for (const formData of formDataList) {
      await machineCrud.addItem(formData);
    }

    if (!errorMessage.value) {
      router.push("/listeMachine");
    }
  } else {
    console.error("Formulaire dynamique invalide");
  }
};
</script>

<template>
  <SectionNavigation />

  <div class="row mb-4">
    <div class="col-md-8">
      <h3 class="page-title">
        Création de nouveau machine à partir du numéro de série et numéro de moteur
      </h3>
    </div>
  </div>
  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />
  <div class="row">
    <div class="col-md-12">
      <div class="card shadow mb-4">
        <div class="card-header">
          <strong class="card-title"
            >Ajout de nouveau machine : "<span style="font-style: italic"
              >{{ machineSource?.nom_machine }}
              <ForeignKeyDisplay
                :description="machineSource?.marque?.nom_marque"
              />"</span
            ></strong
          >
        </div>
        <form @submit.prevent="submitForm">
          <div class="card-body">
            <div
              v-for="(machine, index) in machinesData"
              :key="index"
              class="formNumero d-flex align-items-center justify-content-between"
              ref="formError"
            >
              <div class="form-row col-md-10">
                <div class="form-group col-md-4">
                  <label for="num_serie">Numéro de machine*</label>
                  <input
                    v-model="machine.numero_machine"
                    type="text"
                    class="form-control"
                    placeholder="Numéro de machine"
                    :class="{ 'is-invalid': errors[index]?.numero_machine }"
                  />
                  <span v-if="errors[index]?.numero_machine" class="error">{{
                    errors[index]?.numero_machine
                  }}</span>
                </div>
                <div class="form-group col-md-4">
                  <label for="num_serie">Numéro de série*</label>
                  <input
                    v-model="machine.numero_de_serie"
                    type="text"
                    class="form-control"
                    placeholder="Numéro de série"
                    :class="{ 'is-invalid': errors[index]?.numero_de_serie }"
                  />
                  <span v-if="errors[index]?.numero_de_serie" class="error">{{
                    errors[index]?.numero_de_serie
                  }}</span>
                </div>
                <div class="form-group col-md-4">
                  <label for="num_serie">Numéro de moteur*</label>
                  <input
                    v-model="machine.numero_de_moteur"
                    type="text"
                    class="form-control"
                    placeholder="Numéro de moteur"
                    :class="{ 'is-invalid': errors[index]?.numero_de_moteur }"
                  />
                  <span v-if="errors[index]?.numero_de_moteur" class="error">{{
                    errors[index]?.numero_de_moteur
                  }}</span>
                </div>
              </div>
              <div class="col-md-2 mt-2">
                <button
                  class="btn btn-sm btn-outline-primary plus-icon"
                  type="button"
                  @click="addMachineData"
                >
                  <i class="material-icons notranslate">add</i>
                </button>
                <button
                  v-if="index !== 0"
                  class="btn btn-sm btn-outline-danger ml-2 plus-icon"
                  type="button"
                  @click="removeMachineData(index)"
                >
                  <i class="material-icons notranslate">delete</i>
                </button>
              </div>
            </div>
            <button type="submit" class="btn mb-2 mt-4 ml-3 btn-primary">
              <span class="fe fe-plus fe-16 mr-2"></span>Créer les machines
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plus-icon {
  font-size: 0.2rem;
  border-radius: 20px;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.plus-icon:hover {
  transform: scale(1.1) rotate(10deg);
  background-color: #e3f2fd;
}

.plus-icon i {
  transition: color 0.3s ease;
}

.plus-icon:hover i {
  color: #0d6efd;
}

.formNumero {
  padding: 0.25rem;
}

.is-invalid {
  border: 1px solid red;
}
.error {
  color: red;
  font-size: 12px;
}
</style>

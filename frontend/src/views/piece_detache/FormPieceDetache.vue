<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useCrud } from "@/composables/useCrud";
import { formatDateTimeLocal } from "@/composables/useFonction";
import useVuelidate from "@vuelidate/core";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { required, minValue, helpers, integer } from "@vuelidate/validators";
import { PieceDetachee } from "@/types/PieceDetacheType";
import { Modele } from "@/types/MachineType";
import { Atelier } from "@/types/AtelierType";
import { Fournisseur } from "@/types/FournisseurType";
import { useRoute, useRouter } from "vue-router";

const form = reactive<PieceDetachee>({
  id: 0,
  nom_piecedetache: "",
  prix_unitaire: null,
  quantite: 0,
  stock_min: null,
  stock_max: null,
  lot_de_reapprovisionnement: null,
  date_creation: null,
});

const router = useRouter();
const route = useRoute();
const pieceId = route.params.id; //en cas de modification

const validation = {
  nom_piecedetache: { required },
  prix_unitaire: {
    required: helpers.withMessage("Prix unitaire requis", required),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative.",
      minValue(0)
    ),
  },
  stock_min: {
    required: helpers.withMessage("Stock minimum requis", required),
    integer: helpers.withMessage("Veuillez entrer un entier.", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative.",
      minValue(0)
    ),
  },
  stock_max: {
    integer: helpers.withMessage("Veuillez entrer un entier.", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative.",
      minValue(0)
    ),
    isValidStock: helpers.withMessage(
      "Le stock maximum doit être supérieur ou égal au stock minimum.",
      (value: number | null) =>
        value === null || String(value) === "" || value >= form.stock_min // N`affiche pas l`erreur si vide ou null
    ),
  },
  lot_de_reapprovisionnement: {
    integer: helpers.withMessage("Veuillez entrer un entier.", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative.",
      minValue(0)
    ),
  },
  quantite: {
    required: helpers.withMessage("Quantite requis", required),
    integer: helpers.withMessage("Veuillez entrer un entier.", integer),
    minValue: helpers.withMessage(
      "Vous ne pouvez pas saisir de valeur négative.",
      minValue(0)
    ),
  },
};

const v$ = useVuelidate(validation, form);

const modeles = useCrud<Modele>("machine/modeles/");
const ateliers = useCrud<Atelier>("atelier/ateliers/");
const fournisseurs = useCrud<Fournisseur>("fournisseur/fournisseurs/");
const pieceDetachees = useCrud<PieceDetachee>("piece/piecedetachees/", v$);

const errorMessage = pieceDetachees.errorMessage;
const error401Message = pieceDetachees.error401Message;

const clearError = () => {
  //reinitialiser le message d`erreur
  errorMessage.value = null;
};

//Pour l`ulpoad d`image
const image = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const formError = ref<HTMLElement | null>(null);

//Ajouter un nouveau piece detache
const submitForm = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    const formData = new FormData();
    formData.append("nom_piecedetache", form.nom_piecedetache);
    formData.append("description", form.description || "");
    formData.append("modele_id", String(form.modele_id || ""));
    formData.append("date_achat", String(form.date_achat || ""));
    formData.append("prix_unitaire", String(form.prix_unitaire));
    formData.append("quantite", String(form.quantite));
    formData.append("emplacement_id", String(form.emplacement_id || ""));
    formData.append("fournisseur_id", String(form.fournisseur_id || ""));
    formData.append("reference_fabricant", form.reference_fabricant || "");
    if (fileInput.value?.files?.[0]) {
      // Si il y a une nouvelle image
      formData.append("image", fileInput.value.files[0] || "");
    }
    if (image.value === null) {
      formData.append("image", "");
    }
    formData.append("stock_min", String(form.stock_min));
    formData.append("stock_max", String(form.stock_max || ""));
    formData.append(
      "lot_de_reapprovisionnement",
      String(form.lot_de_reapprovisionnement || "")
    );

    if (pieceId) {
      // Si c'est une modification
      await pieceDetachees.updateItem(Number(pieceId), formData);
      if (!errorMessage.value) {
        router.push("/detailPieceDetache/" + pieceId);
      }
    } else {
      // Si c'est un ajout
      await pieceDetachees.addItem(formData);
      if (!errorMessage.value) {
        router.push("/listePiecedetache");
      }
    }
  } else {
    console.error("Formulaire invalide");
    formError.value?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest", // Positionne horizontalement de façon la plus proche
    });
  }
};

// Fonction pour déclencher le clic sur le input file
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement; //acceder a la liste des fichiers
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      //lue en base64
      image.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  image.value = null;
  if (fileInput.value) {
    fileInput.value.files = null;
  }
};

const piece = ref<PieceDetachee | null>(null);

onMounted(async () => {
  // Si en mode modification
  if (pieceId) {
    await pieceDetachees.fetchItemsById(Number(pieceId));
    piece.value = pieceDetachees.items.value[0];
    Object.assign(form, piece.value); // preremplir les formulaires
    image.value = piece.value.image;
    if (piece.value.date_achat !== null) {
      form.date_achat = formatDateTimeLocal(new Date(piece.value.date_achat));
    }
  }
  await Promise.all([
    modeles.fetchItems(),
    ateliers.fetchItems(),
    fournisseurs.fetchItems(),
  ]);
});
</script>

<template>
  <SectionNavigation />

  <div class="row">
    <div class="col-md-8">
      <h2 class="page-title">
        {{ pieceId ? "Modification de pièce détachée" : "Créer une pièce détachée" }}
      </h2>
    </div>
  </div>

  <p>Élément d'un ensemble fonctionnel que l'on peut extraire, isoler ou remplacer.</p>

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
          <strong class="card-title"></strong
          >{{ pieceId ? "Modifier une pièce détachée" : "Ajouter une pièce détachée " }}
          (* champ obligatoire)
        </div>
        <div class="card-body" ref="formError">
          <form @submit.prevent="submitForm">
            <div class="d-flex justify-content-center">
              <div class="card shadow mb-4">
                <div class="card-header"><strong>Image de la pièce détachée</strong></div>
                <div class="card-body">
                  <span
                    v-if="image"
                    class="circle circle-sm bg-danger justify-content-center"
                    @click="removeImage"
                    style="float: right"
                  >
                    <i class="material-icons notranslate text-white">delete</i>
                  </span>
                  <div
                    id="drag-drop-area"
                    class="upload-frame"
                    @dragover.prevent
                    @click="triggerFileInput"
                  >
                    <div v-if="!image" class="default-message text-center">
                      <i class="material-icons notranslate">handyman</i>
                      <p>Glisser ou deposer votre image ici</p>
                    </div>
                    <div v-else class="uploaded-image">
                      <img :src="image" alt="Pièce détachée" class="img-fluid" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    @change="handleFileUpload"
                    class="d-none"
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="nom">Nom*</label>
                <input
                  type="text"
                  class="form-control"
                  id="nom"
                  placeholder="Nom de la pièce détachée"
                  v-model="form.nom_piecedetache"
                  :class="{
                    'is-invalid':
                      v$.nom_piecedetache.$invalid && v$.nom_piecedetache.$dirty,
                  }"
                />
                <span v-if="v$.nom_piecedetache.$error" class="error"
                  >Nom pièce détachée requis.</span
                >
              </div>
              <div class="form-group col-md-6">
                <label for="modele">Modele</label>
                <select id="modele" class="form-control" v-model="form.modele_id">
                  <option selected disabled>Selectionner un modele</option>
                  <option
                    v-for="modele in modeles.items.value"
                    :key="modele.id"
                    :value="modele.id"
                  >
                    {{ modele.nom_modele }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                class="form-control"
                id="description"
                v-model="form.description"
                rows="4"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group" :class="[pieceId ? 'col-md-12' : 'col-md-6']">
                <label for="prix">Prix unitaire*</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">Ariary</div>
                  </div>
                  <input
                    type="number"
                    class="form-control"
                    id="prix"
                    placeholder="10 000"
                    v-model="form.prix_unitaire"
                    :class="{
                      'is-invalid': v$.prix_unitaire.$invalid && v$.prix_unitaire.$dirty,
                    }"
                  />
                </div>
                <span
                  v-for="error of v$.prix_unitaire.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
              <div v-if="!pieceId" class="form-group col-md-6">
                <label for="quantite">Quantite*</label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control"
                    id="quantite"
                    placeholder="1"
                    v-model="form.quantite"
                    :class="{ 'is-invalid': v$.quantite.$invalid && v$.quantite.$dirty }"
                  />
                </div>
                <span
                  v-for="error of v$.quantite.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="stock_min">Stock minimum*</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span
                      id="form-icon"
                      class="input-group-text material-icons notranslate"
                      >expand_less</span
                    >
                  </div>
                  <input
                    type="number"
                    class="form-control"
                    id="stock_min"
                    placeholder="Seuil minimum pour prevoir réapprovisionnement"
                    v-model="form.stock_min"
                    :class="{
                      'is-invalid': v$.stock_min.$invalid && v$.stock_min.$dirty,
                    }"
                  />
                </div>
                <span
                  v-for="error of v$.stock_min.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>

              <div class="form-group col-md-6">
                <label for="stock_max">Stock maximum</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span
                      id="form-icon"
                      class="input-group-text material-icons notranslate"
                      >expand_more</span
                    >
                  </div>
                  <input
                    type="number"
                    class="form-control"
                    id="stock_max"
                    placeholder="Seuil maximum a ne pas depasser pour réapprovisionnement"
                    v-model="form.stock_max"
                    :class="{
                      'is-invalid': v$.stock_max.$invalid && v$.stock_max.$dirty,
                    }"
                  />
                </div>
                <span
                  v-for="error of v$.stock_max.$errors"
                  :key="error.$uid"
                  class="error"
                  >{{ error.$message }}</span
                >
              </div>
            </div>

            <div class="form-group">
              <label for="lot">Lot de réapprovisionnement</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span id="form-icon" class="input-group-text material-icons notranslate"
                    >shopping_cart</span
                  >
                </div>
                <input
                  type="number"
                  class="form-control"
                  id="lot"
                  placeholder="Quantite minimum de réapprovisionnement"
                  v-model="form.lot_de_reapprovisionnement"
                  :class="{
                    'is-invalid':
                      v$.lot_de_reapprovisionnement.$invalid &&
                      v$.lot_de_reapprovisionnement.$dirty,
                  }"
                />
              </div>
              <span
                v-for="error of v$.lot_de_reapprovisionnement.$errors"
                :key="error.$uid"
                class="error"
                >{{ error.$message }}</span
              >
            </div>

            <div class="form-group">
              <label for="emplacement">Emplacement</label>
              <select id="emplacement" class="form-control" v-model="form.emplacement_id">
                <option selected disabled>Selectionner un emplacement</option>
                <option
                  v-for="atelier in ateliers.items.value"
                  :key="atelier.id"
                  :value="atelier.id"
                >
                  {{ atelier.nom_atelier }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="date_achat">Date et heure d'achat</label>
              <input
                class="form-control"
                id="date_achat"
                type="datetime-local"
                v-model="form.date_achat"
              />
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label for="reference">Référence fabricant</label>
                <input
                  type="text"
                  class="form-control"
                  id="reference"
                  v-model="form.reference_fabricant"
                />
              </div>
              <div class="form-group col-md-6">
                <label for="fournisseur">Fournisseur</label>
                <select
                  id="fournisseur5"
                  class="form-control"
                  v-model="form.fournisseur_id"
                >
                  <option selected disabled>Selectionner un fournisseur</option>
                  <option
                    v-for="fournisseur in fournisseurs.items.value"
                    :key="fournisseur.id"
                    :value="fournisseur.id"
                  >
                    {{ fournisseur.nom_fournisseur }}
                  </option>
                </select>
              </div>
            </div>

            <button v-if="pieceId" type="submit" class="btn mb-2 mt-4 btn-primary">
              <span class="fe fe-edit-2 fe-16 mr-2"></span>Modifier la pièce détachée
            </button>
            <button v-else type="submit" class="btn mb-2 mt-4 btn-primary">
              <span class="fe fe-plus fe-16 mr-2"></span>Créer une pièce détachée
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#drag-drop-area {
  border: 2px dashed #6c757d;
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  min-height: 100px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s ease-in-out;
}

#drag-drop-area:hover {
  border-color: #007bff;
}

.circle {
  cursor: pointer;
}

.default-message {
  color: #6c757d;
}

.default-message i {
  font-size: 48px;
}

.uploaded-image img {
  width: 13rem;
  height: 13rem;
  border-radius: 10px;
}

.is-invalid {
  border: 1px solid red;
}
.error {
  color: red;
  font-size: 12px;
}
#reconnect {
  margin-left: 3%;
}
</style>

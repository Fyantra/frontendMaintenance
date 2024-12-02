import { ref } from "vue";
import { defineStore } from "pinia";
import { Tache } from "@/types/TacheType";
import { useCrud } from "@/composables/useCrud";
import { IdentifiantStatusTache } from "@/config/statusConfig";

export const useTacheStore = defineStore("tacheStore", () => {
  const taches = ref<Tache[]>([]);
  const tacheCrud = useCrud<Tache>("tache/taches/");

  // Fonction pour vérifier et mettre à jour le statut
  const updateTacheStatus = async (tache: Tache) => {
    const now = new Date();
    const dateFin = new Date(tache.date_fin);
    const heureFin = tache.heure_fin
      ? new Date(`${tache.date_fin}T${tache.heure_fin}`)
      : null;
  
    // Ignorer les tâches ayant un statut "Terminée" ou "Annulée"
    if (
      tache.identifiant_status_tache === IdentifiantStatusTache.termine ||
      tache.identifiant_status_tache === IdentifiantStatusTache.annulee
    ) {
      return;
    }
  
    try {
      if ((dateFin < now && heureFin && heureFin < now) || dateFin < now) {
        switch (tache.identifiant_status_tache) {
          case IdentifiantStatusTache.enCours:
            // Si la tâche est "En cours", elle devient "En retard et commencée"
            await tacheCrud.updateItemPatch(tache.id!, {
              identifiant_status_tache: IdentifiantStatusTache.enRetardEtCommencee,
            });
            tache.identifiant_status_tache = IdentifiantStatusTache.enRetardEtCommencee;
            break;
  
          case IdentifiantStatusTache.planifiee:
            await tacheCrud.updateItemPatch(tache.id!, {
              identifiant_status_tache: IdentifiantStatusTache.enRetard,
            });
            tache.identifiant_status_tache = IdentifiantStatusTache.enRetard;
            break;
  
          default:
            // Pour tous les autres cas, ne rien faire
            break;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  // Charger toutes les tâches
  const fetchTaches = async (id: number | null) => {
    try {
        // if (taches.value.length > 0) {
        // // Les tâches sont déjà chargées, pas besoin de les recharger
        //     return;
        // }
        if(id){
            await tacheCrud.fetchItemsById(id);
        } else{
            await tacheCrud.fetchItems();
        }
        taches.value = tacheCrud.items.value;

        for (const tache of taches.value) {
            await updateTacheStatus(tache);
        }
    } catch (error) {
        console.error("Erreur lors du chargement des tâches :", error);
    }
  };

  return {
    taches,
    fetchTaches,
    updateTacheStatus,
  };
});

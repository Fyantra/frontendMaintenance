import { ref } from "vue";
import { defineStore } from "pinia";
import { Tache } from "@/types/TacheType";
import { useCrud } from "@/composables/useCrud";
import { IdentifiantStatusTache } from "@/config/statusConfig";
import { useNotificationStore } from "@/stores/notificationStore";
import { stripTime } from "@/composables/useFonction";

export const useTacheStore = defineStore("tacheStore", () => {
  const taches = ref<Tache[]>([]);
  const tacheCrud = useCrud<Tache>("tache/taches/");
  const notificationStore = useNotificationStore();

  // Fonction pour vérifier et mettre à jour le statut
   const updateTacheStatus = async (tache: Tache) => {
    const now = new Date();
    const dateFin = new Date(tache.date_fin);
    const stripNow = stripTime(now);
    const stripDatefin = stripTime(dateFin);
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
      if ((stripDatefin < stripNow || (heureFin && heureFin < now))) {
        const previousStatus = tache.identifiant_status_tache;
        let newStatus = tache.identifiant_status_tache;

        switch (previousStatus) {
          case IdentifiantStatusTache.enCours:
            newStatus = IdentifiantStatusTache.enRetardEtCommencee;
            break;
          case IdentifiantStatusTache.planifiee:
            newStatus = IdentifiantStatusTache.enRetard;
            break;
          default:
            break;
        }

        if (newStatus !== previousStatus) {
          await tacheCrud.updateItemPatch(tache.id!, {
            identifiant_status_tache: newStatus,
          });
          tache.identifiant_status_tache = newStatus;
          
          // Rafraîchir les notifications après changement de statut
          await notificationStore.fetchNotifications();
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

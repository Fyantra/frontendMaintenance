import { ref } from 'vue';
import axios from 'axios';
import { useVuelidate } from '@vuelidate/core';

const getToken = () => {
  return localStorage.getItem('accessToken'); 
};

export function useCrud<T>(endpoint: string, v$?: ReturnType<typeof useVuelidate>) {
  const apiUrl = `${import.meta.env.VITE_APP_API_BASE_URL}${endpoint}`;
  const items = ref<T[]>([]);
  const errorMessage = ref<string | null>(null);
  const error401Message = ref<string | null>(null);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };

  const handleError = (error: any) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 400:
          errorMessage.value = 'Requête incorrecte. Vérifiez les données soumises: syntaxe invalide ou valeur déjà existante';
          break;
        case 401:
          errorMessage.value = 'Votre session est expiré. Veuillez vous reconnecter.';
          error401Message.value = errorMessage.value
          break;
        case 403:
          errorMessage.value = 'Accès refusé. Vous n\'avez pas la permission de réaliser cette action.';
          break;
        case 404:
          errorMessage.value = 'Ressource non trouvée.';
          break;
        case 500:
          errorMessage.value = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.';
      }
    } else {
      errorMessage.value = 'Erreur réseau. Veuillez vérifier votre connexion.';
    }
  };

  // Fetch items
  const fetchItems = async () => {
    try {
      const response = await axios.get<T[]>(apiUrl, authHeader);
      items.value = response.data;
    } catch (error) {
      handleError(error);
    }
  };

  const fetchItemsById = async (id: number) => {
    try {
      const response = await axios.get<T>(`${apiUrl}${id}/`, authHeader);
      items.value = [response.data];
    } catch (error) {
      handleError(error);
    }
  };

  const initializeDataTable = async () => {
    // Vérifiez si le DataTable existe déjà, puis détruisez-le avant de le recréer
    if ($.fn.DataTable.isDataTable("#datatable-1")) {
      $("#datatable-1").DataTable().destroy();
    }
  
    // Réinitialisez DataTable avec les nouvelles données
    await fetchItems();
    $("#datatable-1").DataTable({
      "language": {
            "decimal": ",",
            "thousands": " ",
            "processing": "Traitement en cours...",
            "search": "Rechercher&nbsp;:",
            "lengthMenu": "Afficher _MENU_ éléments",
            "info": "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
            "infoEmpty": "Affichage de l'élément 0 à 0 sur 0 élément",
            "infoFiltered": "(filtré de _MAX_ éléments au total)",
            "infoPostFix": "",
            "loadingRecords": "Chargement en cours...",
            "zeroRecords": "Aucun élément à afficher",
            "emptyTable": "Aucune donnée disponible dans le tableau",
            "paginate": {
                "first": "Premier",
                "previous": "Précédent",
                "next": "Suivant",
                "last": "Dernier"
            },
            "aria": {
                "sortAscending": ": activer pour trier la colonne par ordre croissant",
                "sortDescending": ": activer pour trier la colonne par ordre décroissant"
            }
        }
    });
  };
  

  // Add item
  const addItem = async (item: Partial<T> | FormData) => {
    try {
      await axios.post(apiUrl, item, authHeader); 
      // initializeDataTable();
    } catch (error) {
      handleError(error);
    }
  };

  // Delete item
  const deleteItem = async (id: number) => {
    try {
      await axios.delete(`${apiUrl}${id}/`, authHeader);
      initializeDataTable(); 
    } catch (error) {
      handleError(error);
    }
  };

  // Update item
  const updateItem = async (id: number, updatedItem: Partial<T> | FormData) => {
    try {
      await axios.put(`${apiUrl}${id}/`, updatedItem, authHeader);
      // initializeDataTable(); 
    } catch (error) {
      handleError(error);
    }
  };

  return {
    items,
    errorMessage,
    error401Message,
    addItem,
    deleteItem,
    updateItem,
    fetchItems,
    fetchItemsById,
    initializeDataTable,
    v$,
  };
}

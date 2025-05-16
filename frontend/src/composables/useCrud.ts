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
  
  const initializeDataTableWithId = async (tableId: string) => {    //pour rendre dynamique le datatable
    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
      $(`#${tableId}`).DataTable().destroy();
    }  
  
    await fetchItems();
    $(`#${tableId}`).DataTable({
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
      const response = await axios.post(apiUrl, item, authHeader); 
      return response.data;
      // initializeDataTable();
    } catch (error) {
      handleError(error);
    }
  };

  // Delete item
  const deleteItem = async (id: number) => {
    try {
      if (confirm("Êtes-vous sûr de vouloir supprimer cet element ?")) {
        await axios.delete(`${apiUrl}${id}/`, authHeader);
        initializeDataTable(); 
      }
    } catch (error) {
      handleError(error);
    }
  };

  const deleteItemWithoutInitialize = async (id: number) => {
    try {
      await axios.delete(`${apiUrl}${id}/`, authHeader);
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

  const updateItemPatch = async (id: number, updatedItem: Partial<T> | FormData) => {
    try {
      await axios.patch(`${apiUrl}${id}/`, updatedItem, authHeader);
    } catch (error) {
      handleError(error);
    }
  };

  //pour appeler un API d`un methode specifique
  const actionItemApi = async (id: number, actionPath: string, method: 'post' | 'get' | 'put' | 'delete' = 'post', data: any = null) => {
    try {
      const url = `${apiUrl}${id}/${actionPath}/`;
      const response = await axios({
        url,
        method,
        data,
        ...authHeader,
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  };

  /////////EXPORT/////////////////
  const exportData = async (exportFormat: 'pdf' | 'csv' | 'excel', modelName?: string) => {
    try {
      const exportEndpoint = modelName 
        ? `${apiUrl}export/${modelName}/${exportFormat}/`
        : endpoint.replace(/\/$/, '') + `-export/${exportFormat}/`;
      
      const response = await axios.get(exportEndpoint, {
        ...authHeader,
        responseType: exportFormat === 'pdf' ? 'blob' : 'arraybuffer'
      });
  
      // Créer le fichier téléchargeable
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      link.setAttribute('download', `export_${modelName || endpoint.split('/').filter(Boolean).pop()}_${new Date().toISOString().slice(0,10)}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
    } catch (error) {
      handleError(error);
    }
  };

  const exportTache = async (exportFormat: 'pdf' | 'csv' | 'excel', pk?: number) => {
    try {
      const url = pk 
        ? `${apiUrl}export-tache/${pk}/${exportFormat}/`
        : `${apiUrl}export-tache/${exportFormat}/`;
      
      const response = await axios.get(url, {
        ...authHeader,
        responseType: exportFormat === 'pdf' ? 'blob' : 'arraybuffer'
      });
  
      const urlObject = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlObject;
      link.setAttribute('download', `taches_export_${new Date().toISOString().slice(0,10)}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
    } catch (error) {
      handleError(error);
    }
  };
  ////////FIN EXPORT////////////////

  return {
    items,
    errorMessage,
    error401Message,
    addItem,
    deleteItem,
    deleteItemWithoutInitialize,
    updateItem,
    updateItemPatch,
    fetchItems,
    fetchItemsById,
    initializeDataTable,
    initializeDataTableWithId,
    actionItemApi,
    exportData,
    exportTache,
    v$,
  };
}

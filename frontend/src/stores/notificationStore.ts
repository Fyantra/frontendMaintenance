import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useCrud } from "@/composables/useCrud";
import { Notification } from "@/types/NotificationType";

export const useNotificationStore = defineStore("notifications", () => {
  const notificationCrud = useCrud<Notification>("notifications/");
  const notifications = ref<Notification[]>([]);
  const activeTab = ref<'pieces' | 'taches'>('pieces');

  // Réinitialiser le store
  const reset = () => {
    notifications.value = [];
  };
  
  // Compteurs de notifications non lues
  const unreadCounts = computed(() => {
    return {
      pieces: notifications.value.filter(n => n.piece_detachee && !n.vue).length,
      taches: notifications.value.filter(n => n.tache && !n.vue).length,
      total: notifications.value.filter(n => !n.vue).length
    };
  });

  // Notifications filtrées par type
  const filteredNotifications = computed(() => {
    if (activeTab.value === 'pieces') {
      return notifications.value.filter(n => n.piece_detachee);
    } else {
      return notifications.value.filter(n => n.tache);
    }
  });

  const fetchNotifications = async () => {

    await notificationCrud.fetchItems();
    notifications.value = notificationCrud.items.value;
  };

  const markAsRead = async (notificationId: number) => {
    await notificationCrud.actionItemApi(notificationId, "marquer-vue");
    await fetchNotifications();
  };

  return { 
    notifications,
    unreadCounts,
    filteredNotifications,
    activeTab,
    fetchNotifications,
    markAsRead,
    reset
  };
});
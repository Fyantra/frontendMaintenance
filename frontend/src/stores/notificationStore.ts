import { defineStore } from "pinia";
import { ref } from "vue";
import { useCrud } from "@/composables/useCrud";
import { Notification } from "@/types/NotificationType";

export const useNotificationStore = defineStore("notifications", () => {
  const notificationCrud = useCrud<Notification>("notifications/");
  const unreadCount = ref<number>(0);
  const notifications = ref<Notification[]>([]);

  const fetchUnreadNotifications = async () => {
    await notificationCrud.fetchItems();
    notifications.value = notificationCrud.items.value;
    unreadCount.value = notifications.value.filter((n) => !n.vue).length;
  };

  return { unreadCount, fetchUnreadNotifications };
});

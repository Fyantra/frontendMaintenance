<script setup lang="ts">
import { computed, onMounted } from "vue";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { useCrud } from "@/composables/useCrud";
import { Notification } from "@/types/NotificationType";
import { useRouter } from "vue-router";
import { useNotificationStore } from "@/stores/notificationStore";

const route = useRouter();
const notificationCrud = useCrud<Notification>("notifications/");

const errorMessage = notificationCrud.errorMessage;
const error401Message = notificationCrud.error401Message;

const clearError = () => {
  errorMessage.value = null;
};

const versDetailPiece = (id: number) => {
  route.push("detailPieceDetache/" + id);
};

const notificationStore = useNotificationStore();

const markAsRead = async (notificationId: number) => {
  await notificationCrud.actionItemApi(notificationId, "marquer-vue");
  refreshData();
  await notificationStore.fetchUnreadNotifications();
};

const total = computed(() => notificationCrud.items.value.length);

const refreshData = async () => {
  await notificationCrud.fetchItems();
};

const timeSince = (date: string | Date) => {
  const dateObj = new Date(date);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  if (seconds < 60) return `${seconds} secondes`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} heures`;

  const days = Math.floor(hours / 24);
  return `${days} jours`;
};

onMounted(async () => {
  refreshData();
});
</script>

<template>
  <SectionNavigation />

  <ErrorMessage
    v-if="errorMessage"
    :errorMessage="errorMessage"
    :error401Message="error401Message"
    :clearError="clearError"
  />
  <div>
    <div class="card shadow">
      <div class="card-header">
        <strong class="card-title">Liste de toutes les notifications</strong>
        <a class="float-right small text-muted" href="#">{{ total }}</a>
      </div>
      <div class="card-body">
        <div v-if="total > 0" class="list-group list-group-flush my-n3">
          <!--Ici le boucle sur les notifications-->
          <div
            v-for="notification in notificationCrud.items.value"
            :key="notification.id"
            class="list-group-item"
          >
            <div class="row align-items-center">
              <div class="col-auto">
                <span class="circle circle-md bg-secondary">
                  <i class="material-icons notranslate fe-24 text-white">handyman</i>
                </span>
              </div>
              <div class="col">
                <label>{{ notification.message }}</label>
                <span
                  v-if="!notification.vue"
                  class="badge badge-danger notification-badge ml-4"
                  >1</span
                >
                <div class="my-0 text-muted small">
                  Il y a {{ timeSince(notification.date_creation) }}
                </div>
              </div>
              <div class="col-auto mr-5">
                <button
                  @click="versDetailPiece(notification.piece_detachee)"
                  class="btn btn-outline-warning btn-sm"
                >
                  Voir
                </button>
              </div>
              <div v-if="!notification.vue" class="col-auto">
                <button
                  @click="markAsRead(notification.id)"
                  class="btn btn-outline-secondary btn-sm mark-read-btn"
                >
                  Marquer comme lu
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else><h5>Aucune notification</h5></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.circle {
  justify-content: center;
}
.notification-badge {
  background-color: #de1d2f;
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.mark-read-btn {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.mark-read-btn:hover {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.list-group-item:hover {
  background-color: rgb(7 7 7 / 12%);
}
</style>

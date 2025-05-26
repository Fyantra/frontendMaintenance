<script setup lang="ts">
import { onMounted } from "vue";
import SectionNavigation from "../templates/SectionNavigation.vue";
import ErrorMessage from "../templates_composant/ErrorMessage.vue";
import { useCrud } from "@/composables/useCrud";
import { Notification } from "@/types/NotificationType";
import { useRouter } from "vue-router";
import { useNotificationStore } from "@/stores/notificationStore";

const router = useRouter();
const notificationCrud = useCrud<Notification>("notifications/");

const errorMessage = notificationCrud.errorMessage;
const error401Message = notificationCrud.error401Message;

const clearError = () => {
  errorMessage.value = null;
};

const notificationStore = useNotificationStore();

const navigateToItem = (notification: Notification) => {
  if (notification.piece_detachee) {
    router.push(`/detailPieceDetache/${notification.piece_detachee}`);
  } else if (notification.tache) {
    router.push(`/detailTache/${notification.tache}`);
  }
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
  await notificationStore.fetchNotifications();
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
      </div>
      <div class="card-body">
        <ul class="nav nav-pills nav-fill mb-3" id="pills-tab" role="tablist">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: notificationStore.activeTab === 'pieces' }"
              href="#"
              @click.prevent="notificationStore.activeTab = 'pieces'"
            >
              Pièces détachées
              <span
                v-if="notificationStore.unreadCounts.pieces"
                class="badge badge-danger notification-badge ml-4"
                >{{ notificationStore.unreadCounts.pieces }}</span
              >
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: notificationStore.activeTab === 'taches' }"
              href="#"
              @click.prevent="notificationStore.activeTab = 'taches'"
            >
              Tâches
              <span
                v-if="notificationStore.unreadCounts.taches"
                class="badge badge-danger notification-badge ml-4"
                >{{ notificationStore.unreadCounts.taches }}</span
              >
            </a>
          </li>
        </ul>
        <transition name="fade" mode="out-in">
          <div :key="notificationStore.activeTab">
            <div
              v-if="notificationStore.filteredNotifications.length === 0"
              class="alert alert-info"
            >
              Aucune notification dans cette catégorie
            </div>

            <div v-else class="list-group list-group-flush">
              <div
                v-for="notification in notificationStore.filteredNotifications"
                :key="notification.id"
                class="list-group-item"
                :class="{ 'bg-light': !notification.vue }"
              >
                <div class="row align-items-center">
                  <div class="col-auto">
                    <span class="circle circle-md bg-secondary">
                      <i class="material-icons notranslate fe-24 text-white">{{
                        notification.piece_detachee ? "handyman" : "assignment"
                      }}</i>
                    </span>
                  </div>
                  <div class="col">
                    <label>{{ notification.message }}</label>
                    <div class="my-0 text-muted small">
                      Il y a {{ timeSince(notification.date_creation) }}
                    </div>
                  </div>
                  <div class="col-auto mr-5">
                    <button
                      @click="navigateToItem(notification)"
                      class="btn btn-outline-info btn-sm"
                    >
                      Voir
                    </button>
                  </div>
                  <div v-if="!notification.vue" class="col-auto">
                    <button
                      @click="notificationStore.markAsRead(notification.id)"
                      class="btn btn-outline-warning btn-sm mark-read-btn"
                    >
                      Marquer comme lu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
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
  white-space: nowrap;
}

.mark-read-btn:hover {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.list-group-item:hover {
  background-color: rgb(7 7 7 / 12%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

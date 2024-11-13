<script setup lang="ts">
import { ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

// Initialisation des options du calendrier
const showWeekends = ref(true);
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,today,next",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  },
  weekends: showWeekends.value,
  locale: "fr", // Définit la langue en français
  events: [
    { title: "Événement 1", start: "2024-10-15", end: "2024-10-17" },
    { title: "Réunion", start: "2024-10-18T10:00:00", end: "2024-10-18T12:00:00" },
    { title: "Conférence", start: "2024-10-19T13:00:00", allDay: true },
    { title: "Projet", start: "2024-10-20T09:00:00", end: "2024-10-20T16:00:00" },
  ],
  editable: true,
  selectable: true,
  eventClick: (info) => {
    alert(`Vous avez cliqué sur l'événement: ${info.event.title}`);
  },
  select: (info) => {
    const title = prompt("Nom de la tâche ?");
    if (title) {
      calendarOptions.value.events.push({
        title,
        start: info.startStr,
        end: info.endStr,
        allDay: info.allDay,
      });
    }
  },
});

// Fonction pour basculer l'affichage des weekends
const toggleWeekends = () => {
  showWeekends.value = !showWeekends.value;
  calendarOptions.value.weekends = showWeekends.value;
};
</script>

<template>
  <div class="calendar-container">
    <div class="calendar-toolbar">
      <button @click="toggleWeekends" class="btn-toggle">
        {{ showWeekends ? "Masquer" : "Afficher" }} les weekends
      </button>
    </div>
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<style scoped>
.calendar-container {
  margin: 0 auto;
  padding: 20px;
  background-color: #393f46;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.calendar-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.btn-toggle {
  padding: 8px 15px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-toggle:hover {
  background-color: #0056b3;
}
</style>

<style>
/* FullCalendar styles */
.fc-daygrid-event,
.fc-timegrid-event {
  background-color: #28a745 !important;
  border: 1px solid #1e7e34 !important;
  color: white !important;
  font-size: 0.9em;
  border-radius: 4px;
}

.fc-list-event {
  background-color: #dbd9d2 !important;
  color: #333 !important;
  border-radius: 4px;
}

.fc-event-main-frame {
  background-color: #3c70d7;
}
</style>

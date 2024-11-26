<script setup lang="ts">
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { useCrud } from "@/composables/useCrud";
import { Tache, StatusTache } from "@/types/TacheType";
import { getStatusForTache, formatLocalDate } from "@/composables/useFonction";
import router from "@/router";

const calendarEvents = ref<
  { title: string; start: Date | string; end: Date | string; allDay: boolean }[]
>([]);

const statusCrud = useCrud<StatusTache>("tache/status_taches/");

const showWeekends = ref(true);

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,today,next",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  },
  buttonText: {
    today: "Aujourd'hui",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    list: "Liste",
  },
  weekends: showWeekends.value,
  events: calendarEvents,
  locale: "fr",
  editable: true,
  selectable: true,
  eventClick: (info) => {
    // Rediriger vers la page d'insertion de tâche avec les détails si besoin
  },
  select: (info: any) => {
    const startDate = info.start as Date;
    const endDate = info.end as Date;

    const isAllDay = info.allDay as boolean;

    // Formater les dates au format `yyyy-MM-dd`
    const formattedStartDate = formatLocalDate(startDate); // Format ISO pour les dates
    const formattedEndDate = isAllDay
      ? formattedStartDate // Si c'est une journée entière, la date de fin est la même
      : formatLocalDate(endDate);

    // Formater les heures au format `HH:mm`
    const formattedStartTime = isAllDay ? null : startDate.toTimeString().slice(0, 5);
    const formattedEndTime = isAllDay ? null : endDate.toTimeString().slice(0, 5);

    router.push({
      path: "/ajoutTache",
      query: {
        date_debut: formattedStartDate,
        heure_debut: formattedStartTime,
        date_fin: formattedEndDate,
        heure_fin: formattedEndTime,
      },
    });
  },
});

const fetchEvents = async () => {
  const tacheCrud = useCrud<Tache>("tache/taches/");
  await tacheCrud.fetchItems();

  calendarEvents.value = tacheCrud.items.value.map((tache) => {
    const startDate = tache.heure_debut
      ? new Date(`${tache.date_debut}T${tache.heure_debut}`)
      : new Date(tache.date_debut);

    const endDate = tache.heure_fin
      ? new Date(`${tache.date_fin}T${tache.heure_fin}`)
      : new Date(tache.date_fin);

    const status = getStatusForTache(tache, statusCrud.items.value);
    const color = status?.couleur;

    return {
      title: tache.description,
      start: startDate,
      end: endDate,
      allDay: !tache.heure_debut && !tache.heure_fin,
      color: color,
      backgroundColor: color,
    };
  });
};

const toggleWeekends = () => {
  showWeekends.value = !showWeekends.value;
  calendarOptions.value.weekends = showWeekends.value;
};

onMounted(async () => {
  await statusCrud.fetchItems();
  await fetchEvents();
});
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
</style>

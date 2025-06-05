import { computed, ref } from "vue";

export const chartTacheType = ref("bar");
export const chartEquipementType = ref("bar");

export const chartTacheOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 1,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.raw} min`,
      },
    },
  },
  scales:
    chartTacheType.value === "bar"
      ? {
          x: {
            grid: {
              color: "#ddd",
              lineWidth: 1,
            },
            ticks: {
              color: "#ddd",
              font: {
                size: 13,
                family: "Arial",
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#ced4da",
              lineWidth: 1,
            },
            ticks: {
              color: "#ddd",
              font: {
                size: 13,
                family: "Arial",
              },
            },
          },
        }
      : undefined,
}));


export const chartEquipementOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: 1,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.raw} min`,
      },
    },
  },
  scales:
    chartEquipementType.value === "bar"
      ? {
          x: {
            grid: {
              color: "#ddd",
              lineWidth: 1,
            },
            ticks: {
              color: "#ddd",
              font: {
                size: 13,
                family: "Arial",
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#ced4da",
              lineWidth: 1,
            },
            ticks: {
              color: "#ddd",
              font: {
                size: 13,
                family: "Arial",
              },
            },
          },
        }
      : undefined,
}));

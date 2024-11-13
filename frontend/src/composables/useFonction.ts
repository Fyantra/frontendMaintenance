export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
export const formatDateTimeLocal = (date: Date) => {   //pour le formulaire type datetime-local
const pad = (n: number) => (n < 10 ? '0' + n : n);
return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const dotColor = (quantite: number, stock_min: number, stock_max: number | null) => {
  if (quantite < stock_min) return "bg-danger";
  if (stock_max !== null && quantite > stock_max) return "bg-warning";
  return "bg-success";
};


//FONCTION POUR AVOIR LES STATUTS
import { Status, Machine } from "@/types/MachineType";

export const getStatusForMachine = (machine: Machine, statuts: Status[]) => {
  return statuts.find(status => status.identifiant === machine.identifiant_status_machine);
};
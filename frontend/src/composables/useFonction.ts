export const formatDateTime = (dateString: string) => {   //pour l`affichage detail machine
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  export const formatDateAndTime = (date: string | Date, time: string | null): string => {    //pour afficher les taches
    const dateObject = new Date(date);
  
    const formattedDate = dateObject.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  
    if (time) {
      const [hours, minutes] = time.split(":");
      return `${formattedDate} à ${hours}:${minutes}`;
    }
  
    return formattedDate;
  };

  export const formatDateAndTimeInWords = (   //pour l`affichage de detail tache
    dateDebut: string | Date,
    heureDebut: string | null,
    dateFin: string | Date,
    heureFin: string | null
  ): string => {
    const formatInWords = (date: string | Date): string => {
      const dateObject = new Date(date);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return dateObject.toLocaleDateString("fr-FR", options);
    };
  
    const dateDebutFormatted = formatInWords(dateDebut);
    const dateFinFormatted = formatInWords(dateFin);
  
    if (heureDebut && heureFin) {
      const [hoursDebut, minutesDebut] = heureDebut.split(":");
      const [hoursFin, minutesFin] = heureFin.split(":");
  
      if (dateDebutFormatted === dateFinFormatted) {
        return `${dateDebutFormatted} de ${hoursDebut}:${minutesDebut} à ${hoursFin}:${minutesFin}`;
      }
  
      // Sinon, afficher les deux dates avec heures
      return `${dateDebutFormatted} à ${hoursDebut}:${minutesDebut} - ${dateFinFormatted} à ${hoursFin}:${minutesFin}`;
    }
  
    if (!heureDebut && !heureFin && dateDebutFormatted !== dateFinFormatted) {
      return `${dateDebutFormatted} - ${dateFinFormatted}`;
    }
  
    if (!heureDebut && !heureFin && dateDebutFormatted === dateFinFormatted) {
      return `${dateDebutFormatted} (toute la journée)`;
    }
  
    return dateDebutFormatted;
  };
  
  
export const formatDateTimeLocal = (date: Date) => {   //pour le formulaire type datetime-local
const pad = (n: number) => (n < 10 ? '0' + n : n);
return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatLocalDate = (date: Date): string => {   //pour le calendrier
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getNextHour = () => {    //pour l`insertion de tache
  const now = new Date();
  const nextHourDate = new Date(now); 
  nextHourDate.setHours(nextHourDate.getHours() + 1); 

  // Formater l'heure et les minutes
  const formattedNextHour = `${String(nextHourDate.getHours()).padStart(2, "0")}:${String(
    nextHourDate.getMinutes()
  ).padStart(2, "0")}`;
  return formattedNextHour;
};

export function getformatNumber() {    //formater un nombre
  const formatNumber = (value: number, locale: string = "fr-FR") => {
    return new Intl.NumberFormat(locale).format(value);
  };
  return {
    formatNumber,
  };
}

export const dotColor = (quantite: number, stock_min: number, stock_max: number | null) => {
  if (quantite < stock_min) return "bg-danger";
  if (stock_max !== null && quantite > stock_max) return "bg-warning";
  return "bg-success";
};


//FONCTION POUR AVOIR LES STATUTS
import { Status, Machine } from "@/types/MachineType";
import { StatusTache, Tache } from "@/types/TacheType";

export const getStatusForMachine = (machine: Machine, statuts: Status[]) => {
  return statuts.find(status => status.identifiant === machine.identifiant_status_machine);
};

export const getStatusForTache = (tache: Tache, statuts: StatusTache[]) => {
  return statuts.find(status => status.identifiant === tache.identifiant_status_tache);
};
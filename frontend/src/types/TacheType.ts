import {Machine} from "./MachineType";
import { PieceDetachee } from "./PieceDetacheType";

type heure = number;
type minute = number;

export interface MotifTache{
    id?:number;
    nom_motif_tache: string;
    date_creation?: Date | string;
}

export interface StatusTache{
    id?: number;
    nom_status_tache: string;
    couleur?: string | null;
    identifiant: number;
    date_creation?: Date | string;
}

export interface Tache{
    id?: number;
    machine?: Machine | null;
    machine_id?: number;
    description: string;
    motif_tache?: MotifTache | null;
    motif_tache_id?: number | null;
    identifiant_status_tache?: number;
    date_debut: Date | string;
    heure_debut: string | null;
    date_fin : Date | string;
    heure_fin : string | null;
    temps_maintenance_heure: heure | null; 
    temps_maintenance_minute : minute | null;
    temps_arret_heure : heure | null;
    temps_arret_minute : minute | null; 
    total_duree_tache?: string;
    date_creation?: Date | string;
}

export interface HistoriqueTache{
    id?: number;
    tache?: Tache | null;
    date_creation?: Date | string;
}

export interface ActiviteTache{
    id?: number;
    description: string;
    date_realisation: Date | string;
    temps_passe_heure: heure | null;
    temps_passe_minute: minute | null;
    tache?: number;     //fk de tache
    date_creation?: Date | string;
}

export interface ActiviteTachePieceDetachee{
    id?: number;
    activite_tache?: number;      //fk de activite
    pieces_detachees_id?: number | null;
    pieces_detachees: PieceDetachee | null;
    quantite: number;
    prix_piece_detachees?: number | null;
    total?: number | 0;
    somme_totale?: number | 0;
}
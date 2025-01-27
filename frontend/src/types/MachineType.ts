import { Atelier, Chaine } from "./AtelierType";
import { Fournisseur } from "./FournisseurType";
import { PieceDetachee } from "./PieceDetacheType";

export interface Marque {
    id: number;
    nom_marque: string;
    date_creation?: Date | string;
  }

 export interface Modele {
  id: number;
  nom_modele: string;
  date_creation?: Date | string;
}

export interface NomMachine {
  id: number;
  nom_machine: string;
  date_creation?: Date | string;
}

export interface Type {
  id: number;
  nom_type: string;
  date_creation?: Date | string;
}

export interface Status {
  id: number;
  nom_status: string;
  couleur?: string;
  identifiant: number;
  date_creation?: Date | string;
}

export interface Machine{
  id: number;
  nom_machine: string;
  numero_machine : string;
  numero_de_serie: string;
  numero_de_moteur?: string | null;
  type?: Type | null;
  type_id: number | null;
  modele?: Modele | null;
  modele_id?: number | null;
  marque?: Marque | null;
  marque_id?: number | null;
  atelier?: Atelier | null;
  atelier_id: number | null;
  chaine?: Chaine | null;
  chaine_id?: number | null;
  date_mis_en_place?: Date | string | null;
  date_acquisition?: Date | string | null;
  identifiant_status_machine?: number;
  date_hors_service?: Date | string | null;
  description?: string | null;
  image?: string | null;
  reference_fabricant?: string | null;
  fournisseur?: Fournisseur | null;
  fournisseur_id?: number | null;
  pieces_detachees?: PieceDetachee[] | null;
  pieces_detachees_id?: number | null;
  total_duree_machine?: string;
  date_creation?: Date | string;
}

export interface MachineRelation{
  id?: number;
  machine_principale?: number | null;
  machine_liee_id?: number | null;
  machine_liee?: Machine | null;
  quantite: number | null;
}

export interface HistoriqueDeplacementmachine{
  id?: number;
  machine?: Machine | null;
  atelier?: Atelier | null;
  chaine?: Chaine | null;
  date_deplacement?: Date | string;
  date_creation?: Date | string;
}

 // status?: Status;
  // status_id: number;
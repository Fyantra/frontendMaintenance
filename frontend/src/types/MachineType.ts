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
  date_creation?: Date | string;
}

export interface Machine{
  id: number;
  nom_machine: string;
  numero_de_serie: string;
  numero_de_moteur?: string | null;
  type?: Type | null;
  type_id: number | null;
  marque?: Marque | null;
  marque_id?: number | null;
  atelier?: Atelier | null;
  atelier_id?: number | null;
  chaine?: Chaine | null;
  chaine_id: number | null;
  date_mis_en_place?: Date | string | null;
  date_acquisition?: Date | string | null;
  status?: Status;
  status_id: number;
  date_hors_service?: Date | null;
  description?: string | null;
  image?: string | null;
  reference_fabricant?: string | null;
  fournisseur?: Fournisseur | null;
  fournisseur_id?: number | null;
  pieces_detachees?: PieceDetachee[] | null;
  pieces_detachees_id?: number | null;
  // quantite: number | null;
  date_creation?: Date | string;
}

export interface MachineRelation{
  id?: number;
  machine_principale?: number | null;
  machine_liee_id?: number | null;
  machine_liee?: Machine | null;
  quantite: number | null;
}
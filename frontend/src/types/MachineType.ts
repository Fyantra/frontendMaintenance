export interface Marque {
    id: number;
    nom_marque: string;
    date_creation: Date | string;
  }

 export interface Modele {
  id: number;
  nom_modele: string;
  date_creation: Date | string;
}

export interface NomMachine {
  id: number;
  nom_machine: string;
  date_creation: Date | string;
}

export interface Type {
  id: number;
  nom_type: string;
  date_creation: Date | string;
}

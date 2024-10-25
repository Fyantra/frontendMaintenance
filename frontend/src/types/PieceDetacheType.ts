import { Atelier } from "./AtelierType";
import { Fournisseur } from "./FournisseurType";
import { Modele } from "./MachineType";

export interface PieceDetachee{
    id: number;
    nom_piecedetache: string;
    description?: string | null;
    modele?: Modele | null;  
    modele_id?: number | null;
    date_achat?: Date | string | null;
    prix_unitaire: number;
    quantite : number;
    emplacement?: Atelier | null;  
    emplacement_id?: number | null;    
    fournisseur?: Fournisseur | null;      
    fournisseur_id?: number | null;
    reference_fabricant?: string | null;
    image?: string | null;
    stock_min: number;
    stock_max: number | null;
    lot_de_reapprovisionnement: number | null;
    date_creation: Date | null;
}

//pour le filtre des pieces
export interface ActiveFilters {
    quantite_min: number | null;
    quantite_max: number | null;
    prix_min: number | null;
    prix_max: number | null;
  }
  
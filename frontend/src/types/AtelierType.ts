export interface Endroit{
    id : number;
    nom_endroit: string;
    date_creation : Date | null;
    deleted_at?: Date | null;
}

export interface Responsable{
    id : number;
    nom_responsable: string;
    email: string | null;
    telephone : string | null;
    photo: string | null;
    date_creation : Date | null;
    deleted_at?: Date | null;
}

// export interface Atelier{
//     id : number;
//     nom_atelier: string;
//     date_creation : Date | null;
//     endroit : number | null;    //id endroit
//     responsable : number | null;    //id responsable
// }

export interface Atelier{
    id : number;
    nom_atelier: string;
    date_creation : Date | null;
    endroit_id: number | null;
    responsable_id: number | null
    endroit : Endroit | null;    
    responsable : Responsable | null;    
    deleted_at?: Date | null;
}

export interface Chaine{
    id : number;
    nom_chaine: string;
    date_creation : Date | null;
    atelier_id: number | null;
    atelier: Atelier | null;     //id atelier
    deleted_at?: Date | null;
}
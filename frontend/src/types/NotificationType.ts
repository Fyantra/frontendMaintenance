export interface Notification {
    id?: number;
    message?: string;
    piece_detachee?: number; //fk piece_detachee
    tache?: number;   //fk tache
    vue?: boolean;
    date_creation?: Date | string;
}
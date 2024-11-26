export interface Notification {
    id?: number;
    message?: string;
    piece_detachee?: number;    //fk piece detachee
    vue?: boolean;
    date_creation?: Date | string;
}
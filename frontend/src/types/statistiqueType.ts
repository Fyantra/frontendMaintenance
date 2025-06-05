export interface PieceDetacheeStats {
  global_stats?: {
    valorisation_stock: number;
    quantite_totale_sortie_brut: number;
    cout_total_sortie_brut: number;
    quantite_totale_sortie_net: number;
    cout_total_sortie_net: number;
    quantite_totale_reappro: number;
    cout_total_reappro: number;
  };
  pieces_stats?: Array<{
    piece_detachee_id: number;
    quantite_totale_sortie_net: number;
    quantite_totale_reappro: number;
    cout_total_sortie_net: number;
    cout_total_reappro: number;
  }>;
  // Pour les réponses de pièce unique
  valorisation_stock?: number;
  quantite_totale_sortie_brut?: number;
  cout_total_sortie_brut?: number;
  quantite_totale_sortie_net?: number;
  cout_total_sortie_net?: number;
  quantite_totale_reappro?: number;
  cout_total_reappro?: number;
}
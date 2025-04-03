
export const BELOTE_ANNONCES = { "N/A": 0, "Belote": 20, "Double Belote": 40, "Triple Belote": 60, "Quadruple Belote": 80 } as const;
export const REMARQUES = { "N/A": 0, "Coinche": 90, "Sur Coinche": 100 } as const;
export const CONTRATS = { 
  "0": 0, "80": 80, "90": 90, "100": 100, "110": 110, "120": 120, "130": 130, 
  "140": 140, "150": 150, "160": 160, "Capot": 500, "Générale": 1000 
} as const;
export const REALISES = {
  "0": 0, "10": 10, "20": 20, "30": 30, "40": 40, "50": 50, "60": 60, "70": 70, "80": 80, "90": 90,
  "100": 100, "110": 110, "120": 120, "130": 130, "140": 140, "150": 150, "160": 160, "Capot": 160, "Générale": 160
} as const;

export type BeloteAnnonce = keyof typeof BELOTE_ANNONCES;
export type Remarque = keyof typeof REMARQUES;
export type Contrat = keyof typeof CONTRATS;
export type Realise = keyof typeof REALISES;

export interface BeloteRow {
  Mène: number;
  Contrat: number;
  Chute: number;
  Réalisé: number;
  Ecart: number;
  "Ecarts Théorique": number;
  Belote: string;
  Remarques: string;
  Points: number;
  Contrat_E2: number;
  Chute_E2: number;
  Réalisé_E2: number;
  Ecart_E2: number;
  "Ecarts Théorique_E2": number;
  Belote_E2: string;
  Remarques_E2: string;
  Points_E2: number;
  "Belote Equipe 1": string;
  "Belote Equipe 2": string;
  "Equipe n°1 Théorique": number;
  "Equipe n°2 Théorique": number;
}

export interface Team {
  name: string;
  players: string[];
}

export interface Player {
  name: string;
  position: number; // 0 = Haut Gauche, 1 = Haut Droit, 2 = Bas Gauche, 3 = Bas Droit
  team: 1 | 2;
}

export interface TableCellData {
  text: string;
  backgroundColor: string;
}

export interface DisplayRow {
  Mène: string;
  Contrat: string;
  Chute: string;
  Réalisé: string;
  Ecart: string;
  "Ecarts Théo": string;
  Belote: string;
  Remarques: string;
  Points: string;
  Total: TableCellData;
}

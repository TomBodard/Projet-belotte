
import { BELOTE_ANNONCES, CONTRATS, REALISES, REMARQUES, BeloteRow } from "@/types/belote";

export const calculerEcart = (contrat: number, realise: number | null): number => {
  return contrat > 0 && realise !== null ? Math.abs(contrat - realise) : 0;
};

export const calculerPoints = (
  contrat: number,
  realise: number | null,
  belote: number,
  remarque: string,
  contratAdverse: number,
  realiseAdverse: number | null,
  beloteAdverse: number
): [number, number] => {
  const totalPoints = 160;
  const chute = (realise !== null && ((realise < 80 && contrat > 0) || (realise + belote < contrat && contrat < 500))) ? 1 : 0;

  let coincheActive = "N/A";
  if (remarque === "Sur Coinche") {
    coincheActive = "Sur Coinche";
  } else if (remarque === "Coinche") {
    coincheActive = "Coinche";
  }

  const multiplier = coincheActive === "Sur Coinche" ? 4 : coincheActive === "Coinche" ? 2 : 1;

  if (contrat === 0) {
    if (contratAdverse > 0) {
      if (contratAdverse >= 500 && realiseAdverse === totalPoints) {
        return [belote && remarque !== "Coinche" && remarque !== "Sur Coinche" ? belote : 0, 0];
      }
      if ((realiseAdverse !== null && realiseAdverse + beloteAdverse < contratAdverse) && coincheActive === "N/A") {
        return [160 + contratAdverse + belote, chute];
      } else if (
        (realiseAdverse !== null && realiseAdverse + beloteAdverse < contratAdverse) && 
        (remarque === "Coinche" || remarque === "Sur Coinche")
      ) {
        return [(multiplier * contratAdverse) + 160, chute];
      } else if (
        (realiseAdverse !== null && realiseAdverse + beloteAdverse >= contratAdverse) && 
        (remarque === "Coinche" || remarque === "Sur Coinche") && 
        realiseAdverse >= 80
      ) {
        return [belote, chute];
      }
      return [realiseAdverse !== null ? totalPoints - realiseAdverse + belote : belote, chute];
    }
    return [belote, chute];
  }

  if (contrat >= 500) {
    if (realise === totalPoints) {
      return [(multiplier * contrat) + belote, chute];
    }
    return [belote, chute];
  }

  if (contrat > 0 && (remarque === "Coinche" || remarque === "Sur Coinche")) {
    if (realise !== null && realise >= 80 && realise + belote >= contrat) {
      return [(multiplier * contrat) + realise + belote, chute];
    }
    return [belote, chute];
  }

  return [
    (realise !== null && realise + belote >= contrat && realise >= 80) ? 
      contrat + realise + belote : belote,
    chute
  ];
};

export const calculerPointsAdverse = (
  contrat: number,
  realise: number | null,
  belote: number,
  remarque: string,
  contratAdverse: number,
  realiseAdverse: number | null,
  beloteAdverse: number
): [number, number] => {
  const totalPoints = 160;
  const chute = (realiseAdverse !== null && 
    ((realiseAdverse < 80 && contratAdverse > 0) || 
     (realiseAdverse + beloteAdverse < contratAdverse && contratAdverse < 500))) ? 1 : 0;

  let coincheActive = "N/A";
  if (remarque === "Sur Coinche" || remarque === "Sur Coinche") {
    coincheActive = "Sur Coinche";
  } else if (remarque === "Coinche" || remarque === "Coinche") {
    coincheActive = "Coinche";
  }

  const multiplier = coincheActive === "Sur Coinche" ? 4 : coincheActive === "Coinche" ? 2 : 1;

  if (contratAdverse === 0) {
    if (contrat > 0) {
      if (contrat >= 500 && realise === totalPoints) {
        return [remarque !== "Coinche" && remarque !== "Sur Coinche" ? beloteAdverse : 0, 0];
      }
      if ((realise !== null && (realise < 80 || realise + belote < contrat)) && coincheActive === "N/A") {
        return [160 + contrat + beloteAdverse, 0];
      } else if (
        (realise !== null && (realise + belote < contrat || realise < 80)) && 
        (remarque === "Coinche" || remarque === "Sur Coinche")
      ) {
        return [(multiplier * contrat) + 160, 0];
      } else if (
        (realise !== null && realise + belote >= contrat) && 
        (remarque === "Coinche" || remarque === "Sur Coinche") && 
        realise >= 80
      ) {
        return [beloteAdverse, 0];
      }
      return [realise !== null ? totalPoints - realise + beloteAdverse : beloteAdverse, 0];
    }
    return [beloteAdverse, 0];
  }

  if (contratAdverse >= 500) {
    if (realiseAdverse === totalPoints) {
      return [(multiplier * contratAdverse) + beloteAdverse, chute];
    }
    return [beloteAdverse, chute];
  }

  if (contratAdverse > 0 && (remarque === "Coinche" || remarque === "Sur Coinche")) {
    if (realiseAdverse !== null && realiseAdverse >= 80 && realiseAdverse + beloteAdverse >= contratAdverse) {
      return [(multiplier * contratAdverse) + realiseAdverse + beloteAdverse, chute];
    }
    return [beloteAdverse, chute];
  }

  return [
    (realiseAdverse !== null && realiseAdverse + beloteAdverse >= contratAdverse && realiseAdverse >= 80) ? 
      contratAdverse + realiseAdverse + beloteAdverse : beloteAdverse,
    chute
  ];
};

export const calculerPointsTheoriques = (contrat: number, realise: number | null, belote: number): number => {
  if (contrat === 0) return 0;
  return contrat >= 500 && realise === 160 ? contrat + belote : (realise !== null ? realise + belote : belote);
};

export const formatTableCell = (value: any, column: number, contrat: number): string => {
  if (value === null || value === undefined) return "";
  
  // Formatter selon le type de colonne
  if (column === 1) { // Contrat
    if (value === 0) return "";
    if (value === 500) return "Capot";
    if (value === 1000) return "Générale";
    return String(value);
  } 
  else if (column === 2) { // Chute
    if (contrat === 0) return "";
    return value === 0 ? "Non" : value === 1 ? "Oui" : String(value);
  }
  else if (column === 4 && value === 0) { // Ecart
    return "";
  }
  else if ((column === 6 || column === 7) && value === "N/A") { // Belote ou Remarques
    return "";
  }
  
  return String(value);
};

export const createNewBeloteRow = (
  df: BeloteRow[],
  manche: number,
  contratE1: number, 
  chuteE1: number,
  realiseE1: number,
  ecartE1: number,
  ecartTheoE1: number,
  beloteE1: string,
  remarqueE1: string,
  pointsE1: number,
  contratE2: number,
  chuteE2: number,
  realiseE2: number,
  ecartE2: number,
  ecartTheoE2: number,
  beloteE2: string, 
  remarqueE2: string,
  pointsE2: number,
  theoE1: number,
  theoE2: number
): BeloteRow => {
  return {
    "Mène": manche,
    "Contrat": contratE1,
    "Chute": chuteE1,
    "Réalisé": realiseE1,
    "Ecart": ecartE1,
    "Ecarts Théorique": ecartTheoE1,
    "Belote": beloteE1,
    "Remarques": remarqueE1,
    "Points": pointsE1,
    "Contrat_E2": contratE2,
    "Chute_E2": chuteE2,
    "Réalisé_E2": realiseE2,
    "Ecart_E2": ecartE2,
    "Ecarts Théorique_E2": ecartTheoE2,
    "Belote_E2": beloteE2,
    "Remarques_E2": remarqueE2,
    "Points_E2": pointsE2,
    "Belote Equipe 1": beloteE1,
    "Belote Equipe 2": beloteE2,
    "Equipe n°1 Théorique": theoE1,
    "Equipe n°2 Théorique": theoE2
  };
};

export const getNextDealer = (currentDealer: number): number => {
  // Ordre: HG (0) → HD (1) → BD (3) → BG (2)
  const dealerOrder = [0, 1, 3, 2];
  const currentIndex = dealerOrder.indexOf(currentDealer);
  return dealerOrder[(currentIndex + 1) % 4];
};

export const getPreviousDealer = (currentDealer: number): number => {
  // Ordre: HG (0) → HD (1) → BD (3) → BG (2)
  const dealerOrder = [0, 1, 3, 2];
  const currentIndex = dealerOrder.indexOf(currentDealer);
  return dealerOrder[(currentIndex - 1 + 4) % 4];
};

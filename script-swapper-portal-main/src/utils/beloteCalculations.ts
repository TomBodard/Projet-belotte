
// Constants from the Python code (already in BeloteTracker.tsx)
const BELOTE_ANNONCES = {"N/A": 0, "Belote": 20, "Double Belote": 40, "Triple Belote": 60, "Quadruple Belote": 80};
const REMARQUES = {"N/A": 0, "Coinche": 90, "Sur Coinche": 100};
const CONTRATS = {
  "0": 0, "80": 80, "90": 90, "100": 100, "110": 110, "120": 120, 
  "130": 130, "140": 140, "150": 150, "160": 160, "Capot": 500, "Générale": 1000
};
const REALISES = {
  "0": 0, "10": 10, "20": 20, "30": 30, "40": 40, "50": 50, "60": 60, "70": 70, 
  "80": 80, "90": 90, "100": 100, "110": 110, "120": 120, "130": 130, "140": 140, 
  "150": 150, "160": 160, "Capot": 160, "Générale": 160
};

/**
 * Calculate the gap between contract and realized
 */
export const calculateEcart = (contrat: string, realise: string): number => {
  const contratVal = CONTRATS[contrat as keyof typeof CONTRATS] || 0;
  const realiseVal = REALISES[realise as keyof typeof REALISES] || 0;
  return Math.abs(contratVal - realiseVal);
};

/**
 * Calculate points for a team
 */
export const calculatePoints = (
  contrat: string, 
  realise: string, 
  belote: string, 
  remarque: string,
  contratAdverse: string,
  realiseAdverse: string,
  beloteAdverse: string,
  remarqueAdverse: string
): [number, string] => {
  const totalPoints = 160;
  const contratVal = CONTRATS[contrat as keyof typeof CONTRATS] || 0;
  const realiseVal = REALISES[realise as keyof typeof REALISES] || 0;
  const beloteVal = BELOTE_ANNONCES[belote as keyof typeof BELOTE_ANNONCES] || 0;
  const beloteAdverseVal = BELOTE_ANNONCES[beloteAdverse as keyof typeof BELOTE_ANNONCES] || 0;
  const contratAdverseVal = CONTRATS[contratAdverse as keyof typeof CONTRATS] || 0;
  const realiseAdverseVal = REALISES[realiseAdverse as keyof typeof REALISES] || 0;
  
  const chute = (realiseVal < 80 && contratVal > 0) || 
               (realiseVal + beloteVal < contratVal && contratVal < 500) ? 
               "Oui" : "Non";
  
  // Determine if coinche is active
  let coincheActive = "N/A";
  if (remarque === "Sur Coinche" || remarqueAdverse === "Sur Coinche") {
    coincheActive = "Sur Coinche";
  } else if (remarque === "Coinche" || remarqueAdverse === "Coinche") {
    coincheActive = "Coinche";
  }
  
  const multiplier = coincheActive === "Sur Coinche" ? 4 : 
                    coincheActive === "Coinche" ? 2 : 1;

  // If no contract for this team
  if (contratVal === 0) {
    if (contratAdverseVal > 0) {
      // Special case: opponent declared Capot or Générale and got all points
      if (contratAdverseVal >= 500 && realiseAdverseVal === totalPoints) {
        return [beloteVal && remarque !== "Coinche" && remarque !== "Sur Coinche" ? beloteVal : 0, chute];
      }
      
      // Opponent didn't fulfill their contract and no coinche
      if ((realiseAdverseVal + beloteAdverseVal) < contratAdverseVal && coincheActive === "N/A") {
        return [160 + contratAdverseVal + beloteVal, chute];
      } 
      // Opponent didn't fulfill their contract and coinche was called
      else if (realiseAdverseVal + beloteAdverseVal < contratAdverseVal && 
              (remarque === "Coinche" || remarque === "Sur Coinche")) {
        return [(multiplier * contratAdverseVal) + 160, chute];
      }
      // Opponent fulfilled their contract and coinche was called
      else if (realiseAdverseVal + beloteAdverseVal >= contratAdverseVal && 
              (remarque === "Coinche" || remarque === "Sur Coinche") && 
              realiseAdverseVal >= 80) {
        return [beloteVal, chute];
      }
      
      // Return remaining points plus belote
      return [totalPoints - realiseAdverseVal + beloteVal, chute];
    }
    return [beloteVal, chute];
  }

  // Special contracts: Capot or Générale
  if (contratVal >= 500) {
    if (realiseVal === totalPoints) {
      return [(multiplier * contratVal) + beloteVal, chute];
    }
    return [beloteVal, chute];
  }

  // Normal contract with coinche or sur coinche from opponent
  if (contratVal > 0 && (remarqueAdverse === "Coinche" || remarqueAdverse === "Sur Coinche")) {
    if (realiseVal >= 80 && realiseVal + beloteVal >= contratVal) {
      return [(multiplier * contratVal) + realiseVal + beloteVal, chute];
    }
    return [beloteVal, chute];
  }

  // Standard case: contract fulfilled with enough points
  if (realiseVal + beloteVal >= contratVal && realiseVal >= 80) {
    return [contratVal + realiseVal + beloteVal, chute];
  }
  
  // Contract not fulfilled
  return [beloteVal, chute];
};

/**
 * Calculate theoretical points
 */
export const calculateTheoreticalPoints = (contrat: string, realise: string, belote: string): number => {
  const contratVal = CONTRATS[contrat as keyof typeof CONTRATS] || 0;
  const realiseVal = REALISES[realise as keyof typeof REALISES] || 0;
  const beloteVal = BELOTE_ANNONCES[belote as keyof typeof BELOTE_ANNONCES] || 0;
  
  if (contratVal === 0) {
    return 0;
  }
  
  return contratVal >= 500 && realiseVal === 160 ? 
    contratVal + beloteVal : 
    realiseVal + beloteVal;
};

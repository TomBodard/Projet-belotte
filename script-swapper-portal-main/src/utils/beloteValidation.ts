
/**
 * Validates that game input is consistent
 */
export const validateRoundInputs = (
  team1Contract: string,
  team1Realise: string,
  team1Belote: string,
  team1Remarque: string,
  team2Contract: string,
  team2Realise: string,
  team2Belote: string,
  team2Remarque: string
): { valid: boolean; message?: string } => {
  
  // Check if both teams have declared a contract
  if (team1Contract !== "0" && team2Contract !== "0") {
    return {
      valid: false,
      message: "Only one team can declare a contract per round."
    };
  }
  
  // Check if both teams have the same Coinche or Sur Coinche
  if (
    (team1Remarque === team2Remarque) && 
    (team1Remarque === "Coinche" || team1Remarque === "Sur Coinche")
  ) {
    return {
      valid: false,
      message: "Both teams cannot have the same Coinche or Sur Coinche remark."
    };
  }
  
  // Check the sum of Belote announcements
  const beloteValues: Record<string, number> = {
    "N/A": 0, "Belote": 20, "Double Belote": 40, "Triple Belote": 60, "Quadruple Belote": 80
  };
  
  const team1BeloteValue = beloteValues[team1Belote] || 0;
  const team2BeloteValue = beloteValues[team2Belote] || 0;
  
  if (team1BeloteValue + team2BeloteValue > 80) {
    return {
      valid: false,
      message: "The sum of Belote announcements cannot exceed 80 points."
    };
  }
  
  // All validations passed
  return { valid: true };
};

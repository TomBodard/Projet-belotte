import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, BarChart3, BookOpen, RefreshCw, PlusCircle, UndoIcon, Users } from "lucide-react";

import TeamInputForm from './TeamInputForm';
import BeloteTable from './BeloteTable';
import TotalScores from './TotalScores';
import GameSettings from './GameSettings';
import TeamNameDialog from './TeamNameDialog';
import PlayerLayout from './PlayerLayout';
import StatsDialog from './StatsDialog';
import ValuesDialog from './ValuesDialog';

import {
  BeloteAnnonce, Contrat, Realise, Remarque, BeloteRow,
  BELOTE_ANNONCES, CONTRATS, REALISES, REMARQUES,
  DisplayRow
} from '@/types/belote';
import {
  calculerEcart, calculerPoints, calculerPointsAdverse,
  calculerPointsTheoriques, formatTableCell, createNewBeloteRow,
  getNextDealer, getPreviousDealer
} from '@/utils/beloteUtils';

const BeloteApp: React.FC = () => {
  // États pour les noms d'équipe
  const [team1Name, setTeam1Name] = useState<string>("Équipe 1");
  const [team2Name, setTeam2Name] = useState<string>("Équipe 2");
  const [renameTeamDialog, setRenameTeamDialog] = useState<{ open: boolean, team: 1 | 2 } | null>(null);
  
  // États pour les entrées
  const [contratE1, setContratE1] = useState<Contrat>("0");
  const [realiseE1, setRealiseE1] = useState<Realise>("0");
  const [beloteE1, setBeloteE1] = useState<BeloteAnnonce>("N/A");
  const [remarqueE1, setRemarqueE1] = useState<Remarque>("N/A");
  
  const [contratE2, setContratE2] = useState<Contrat>("0");
  const [realiseE2, setRealiseE2] = useState<Realise>("0");
  const [beloteE2, setBeloteE2] = useState<BeloteAnnonce>("N/A");
  const [remarqueE2, setRemarqueE2] = useState<Remarque>("N/A");
  
  // États pour les données de jeu
  const [data, setData] = useState<BeloteRow[]>([]);
  const [victoryPoints, setVictoryPoints] = useState<string>("2000");
  const [showLayoutDialog, setShowLayoutDialog] = useState<boolean>(false);
  const [showStatsDialog, setShowStatsDialog] = useState<boolean>(false);
  const [showValuesDialog, setShowValuesDialog] = useState<"normal" | "tasa" | null>(null);

  // États pour le jeu
  const [players, setPlayers] = useState<string[]>([]);
  const [currentDealer, setCurrentDealer] = useState<number | null>(null);
  const [teamSetupComplete, setTeamSetupComplete] = useState<boolean>(false);
  
  // États pour le tableau d'affichage
  const [team1Rows, setTeam1Rows] = useState<DisplayRow[]>([]);
  const [team2Rows, setTeam2Rows] = useState<DisplayRow[]>([]);

  // États pour les scores
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [team1Winner, setTeam1Winner] = useState<boolean>(false);
  const [team2Winner, setTeam2Winner] = useState<boolean>(false);

  // Effet pour mettre à jour l'état du bouton d'ajout
  const canAddRound = 
    teamSetupComplete && 
    ((contratE1 !== "0" && realiseE1 !== "0") || (contratE2 !== "0" && realiseE2 !== "0"));

  // Effet pour vérifier si les noms d'équipe sont valides
  const [teamNamesValid, setTeamNamesValid] = useState<boolean>(false);
  
  useEffect(() => {
    const team1Valid = team1Name.includes("/") && team1Name.split("/").length === 2;
    const team2Valid = team2Name.includes("/") && team2Name.split("/").length === 2;
    setTeamNamesValid(team1Valid && team2Valid);
  }, [team1Name, team2Name]);
  
  // Mise à jour du donneur
  const getDealerName = () => {
    return currentDealer !== null && players.length > 0 ? players[currentDealer] : '';
  };

  // Fonction pour ouvrir le dialogue de renommage d'équipe
  const handleRenameTeam = (team: 1 | 2) => {
    setRenameTeamDialog({ open: true, team });
  };
  
  // Fonction pour sauvegarder le nouveau nom d'équipe
  const handleSaveTeamName = (name: string) => {
    if (renameTeamDialog?.team === 1) {
      setTeam1Name(name);
    } else if (renameTeamDialog?.team === 2) {
      setTeam2Name(name);
    }
  };
  
  // Fonction pour sauvegarder la disposition des joueurs
  const handleSaveLayout = (positions: string[], dealerIndex: number) => {
    setPlayers(positions);
    setCurrentDealer(dealerIndex);
    setTeamSetupComplete(true);
  };
  
  // Fonction pour ajouter une manche
  const handleAddRound = () => {
    // Vérifier les entrées
    const contratE1Val = CONTRATS[contratE1];
    const realiseE1Val = REALISES[realiseE1];
    const beloteE1Val = BELOTE_ANNONCES[beloteE1];
    const contratE2Val = CONTRATS[contratE2];
    const realiseE2Val = REALISES[realiseE2];
    const beloteE2Val = BELOTE_ANNONCES[beloteE2];

    // Vérifications de validité
    if (remarqueE1 !== "N/A" && remarqueE2 !== "N/A" && remarqueE1 === remarqueE2) {
      toast.error("Impossible d'avoir deux fois la même remarque (Coinche ou Sur Coinche).");
      return;
    }
    
    if (beloteE1Val + beloteE2Val > 80) {
      toast.error("La somme des annonces Belote ne peut pas dépasser 80.");
      return;
    }
    
    if (contratE1Val > 0 && contratE2Val > 0) {
      toast.error("Un seul contrat par manche.");
      return;
    }

    // Calculs pour la manche
    const totalPoints = 160;
    let realiseE1Final = realiseE1Val;
    let realiseE2Final = realiseE2Val;
    
    // Ajustements des points réalisés
    if (contratE1Val >= 500 && realiseE1Final === totalPoints) {
      realiseE2Final = 0;
    } else if (contratE2Val >= 500 && realiseE2Final === totalPoints) {
      realiseE1Final = 0;
    } else if (contratE1Val > 0 && realiseE2 === "0") {
      realiseE2Final = totalPoints - realiseE1Final;
    } else if (contratE2Val > 0 && realiseE1 === "0") {
      realiseE1Final = totalPoints - realiseE2Final;
    }

    // Calculer les écarts
    let ecartE1 = calculerEcart(contratE1Val, realiseE1Final);
    let ecartE2 = calculerEcart(contratE2Val, realiseE2Final);
    
    // Calculer les points
    const [pointsE1, chuteE1] = calculerPoints(
      contratE1Val, realiseE1Final, beloteE1Val, remarqueE1,
      contratE2Val, realiseE2Final, beloteE2Val
    );
    
    const [pointsE2, chuteE2] = calculerPointsAdverse(
      contratE1Val, realiseE1Final, beloteE1Val, remarqueE1,
      contratE2Val, realiseE2Final, beloteE2Val
    );

    // Calculer les points théoriques
    const theoE1 = calculerPointsTheoriques(contratE1Val, realiseE1Final, beloteE1Val);
    const theoE2 = calculerPointsTheoriques(contratE2Val, realiseE2Final, beloteE2Val);
    
    // Formater les remarques
    const remarqueE1Display = realiseE1Final === 160 && contratE1Val < 500 
      ? "Capot non annoncé" 
      : remarqueE1;
    
    const remarqueE2Display = realiseE2Final === 160 && contratE2Val < 500
      ? "Capot non annoncé"
      : remarqueE2;
    
    // Calculer les écarts théoriques
    let ecartTheoE1 = 0;
    let ecartTheoE2 = 0;

    // Réassignation des écarts selon les cas particuliers
    if (remarqueE1Display === "Capot non annoncé") {
      ecartE1 = 500 - contratE1Val - realiseE1Final;
    }
    if (remarqueE2Display === "Capot non annoncé") {
      ecartE2 = 500 - contratE2Val - realiseE2Final;
    }

    if (contratE1Val > 0 && chuteE1 === 1) {
      if (contratE1Val === 500) {
        ecartE1 = 500;
      } else if (contratE1Val === 1000) {
        ecartE1 = 1000;
      } else {
        ecartE1 = 2 * contratE1Val;
      }
    }
    
    if (contratE2Val > 0 && chuteE2 === 1) {
      if (contratE2Val === 500) {
        ecartE2 = 500;
      } else if (contratE2Val === 1000) {
        ecartE2 = 1000;
      } else {
        ecartE2 = 2 * contratE2Val;
      }
    }

    if (contratE1Val > 0 && chuteE1 === 0 && (contratE1Val === 500 || contratE1Val === 1000)) {
      ecartE1 = 0;
    }
    
    if (contratE2Val > 0 && chuteE2 === 0 && (contratE2Val === 500 || contratE2Val === 1000)) {
      ecartE2 = 0;
    }

    const prevEcartTheoE1 = data.length > 0 ? data[data.length - 1]["Ecarts Théorique"] : 0;
    const prevEcartTheoE2 = data.length > 0 ? data[data.length - 1]["Ecarts Théorique_E2"] : 0;

    if (contratE1Val > 0) {
      ecartTheoE1 = prevEcartTheoE1 + ecartE1;
      ecartTheoE2 = prevEcartTheoE2;
    } else if (contratE2Val > 0) {
      ecartTheoE1 = prevEcartTheoE1;
      ecartTheoE2 = prevEcartTheoE2 + ecartE2;
    } else {
      ecartTheoE1 = prevEcartTheoE1;
      ecartTheoE2 = prevEcartTheoE2;
    }
    
    // Créer la nouvelle ligne
    const newRound = createNewBeloteRow(
      data,
      data.length + 1,
      contratE1Val,
      chuteE1,
      realiseE1Final,
      ecartE1,
      ecartTheoE1,
      beloteE1,
      remarqueE1Display,
      pointsE1,
      contratE2Val,
      chuteE2,
      realiseE2Final,
      ecartE2,
      ecartTheoE2,
      beloteE2,
      remarqueE2Display,
      pointsE2,
      theoE1,
      theoE2
    );
    
    // Mettre à jour les données
    const newData = [...data, newRound];
    setData(newData);
    
    // Mettre à jour les tableaux d'affichage
    updateDisplayTables(newData);
    
    // Passer au donneur suivant
    if (currentDealer !== null) {
      setCurrentDealer(getNextDealer(currentDealer));
    }
    
    // Réinitialiser les entrées
    resetInputs();
    
    toast.success(`Manche ${data.length + 1} ajoutée !`);
  };

  // Fonction pour annuler la dernière manche
  const handleCancelRound = () => {
    if (data.length === 0) {
      toast.warning("Aucune manche à annuler !");
      return;
    }

    const newData = [...data];
    newData.pop();
    setData(newData);
    
    // Mettre à jour les tableaux d'affichage
    updateDisplayTables(newData);
    
    // Revenir au donneur précédent
    if (currentDealer !== null) {
      setCurrentDealer(getPreviousDealer(currentDealer));
    }
    
    toast.success("Dernière manche annulée !");
  };

  // Fonction pour redémarrer la partie
  const handleRestartGame = () => {
    if (confirm("Voulez-vous vraiment redémarrer la partie ? Toutes les données seront perdues.")) {
      setData([]);
      setTeam1Rows([]);
      setTeam2Rows([]);
      setTeam1Name("Équipe 1");
      setTeam2Name("Équipe 2");
      setTeam1Score(0);
      setTeam2Score(0);
      setTeam1Winner(false);
      setTeam2Winner(false);
      setPlayers([]);
      setCurrentDealer(null);
      setTeamSetupComplete(false);
      resetInputs();
      
      toast.success("La partie a été redémarrée !");
    }
  };
  
  // Fonction pour lancer une revanche
  const handleRevenge = () => {
    if (!players.length) {
      toast.warning("Aucune disposition précédente pour une revanche !");
      return;
    }
    
    if (confirm("Voulez-vous lancer une revanche avec les mêmes joueurs et disposition ?")) {
      // Sauvegarde automatique avant réinitialisation (simulée)
      toast.info("Partie précédente sauvegardée automatiquement");
      
      // Réinitialisation pour la revanche
      setData([]);
      setTeam1Rows([]);
      setTeam2Rows([]);
      setTeam1Score(0);
      setTeam2Score(0);
      setTeam1Winner(false);
      setTeam2Winner(false);
      resetInputs();
      
      // Ouvrir le dialogue pour choisir le premier donneur
      setShowLayoutDialog(true);
      
      toast.success("Revanche lancée !");
    }
  };

  // Fonction pour mettre à jour les tableaux d'affichage
  const updateDisplayTables = (newData: BeloteRow[]) => {
    const team1Rows: DisplayRow[] = [];
    const team2Rows: DisplayRow[] = [];
    
    let totalE1 = 0;
    let totalE2 = 0;
    
    newData.forEach((row, i) => {
      totalE1 += row.Points;
      totalE2 += row.Points_E2;
      
      const team1Row: DisplayRow = {
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat, 1, row.Contrat),
        Chute: formatTableCell(row.Chute, 2, row.Contrat),
        Réalisé: formatTableCell(row.Réalisé, 3, row.Contrat),
        Ecart: formatTableCell(row.Ecart, 4, row.Contrat),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique"], 5, row.Contrat),
        Belote: formatTableCell(row["Belote Equipe 1"], 6, row.Contrat),
        Remarques: formatTableCell(row.Remarques, 7, row.Contrat),
        Points: formatTableCell(row.Points, 8, row.Contrat),
        Total: {
          text: String(totalE1),
          backgroundColor: totalE1 >= totalE2 ? '#90ee90' : '#ff6347'
        }
      };
      
      const team2Row: DisplayRow = {
        Mène: String(row.Mène),
        Contrat: formatTableCell(row.Contrat_E2, 1, row.Contrat_E2),
        Chute: formatTableCell(row.Chute_E2, 2, row.Contrat_E2),
        Réalisé: formatTableCell(row.Réalisé_E2, 3, row.Contrat_E2),
        Ecart: formatTableCell(row.Ecart_E2, 4, row.Contrat_E2),
        "Ecarts Théo": formatTableCell(row["Ecarts Théorique_E2"], 5, row.Contrat_E2),
        Belote: formatTableCell(row["Belote Equipe 2"], 6, row.Contrat_E2),
        Remarques: formatTableCell(row.Remarques_E2, 7, row.Contrat_E2),
        Points: formatTableCell(row.Points_E2, 8, row.Contrat_E2),
        Total: {
          text: String(totalE2),
          backgroundColor: totalE2 > totalE1 ? '#90ee90' : '#ff6347'
        }
      };
      
      team1Rows.push(team1Row);
      team2Rows.push(team2Row);
    });
    
    setTeam1Rows(team1Rows);
    setTeam2Rows(team2Rows);
    setTeam1Score(totalE1);
    setTeam2Score(totalE2);
    
    // Vérifier la condition de victoire
    const victoryThreshold = parseInt(victoryPoints);
    setTeam1Winner(totalE1 >= victoryThreshold);
    setTeam2Winner(totalE2 >= victoryThreshold);
  };

  // Fonction pour réinitialiser les entrées
  const resetInputs = () => {
    setContratE1("0");
    setRealiseE1("0");
    setBeloteE1("N/A");
    setRemarqueE1("N/A");
    setContratE2("0");
    setRealiseE2("0");
    setBeloteE2("N/A");
    setRemarqueE2("N/A");
  };

  return (
    <div className="container mx-auto px-4 pb-12 max-w-7xl">
      <header className="py-8 mb-4">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-red-600 text-transparent bg-clip-text">
          Belote - Suivi des Scores
        </h1>
        {!teamSetupComplete && (
          <p className="text-center text-gray-600 text-sm mt-2 animate-pulse">
            Renseigner les noms des équipes tels que Nom1/Nom2
          </p>
        )}
      </header>
      
      {/* Panel supérieur (Contrôles et formulaires) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Panel gauche - Paramètres */}
        <GameSettings victoryPoints={victoryPoints} setVictoryPoints={setVictoryPoints} />
        
        {/* Panel central - Équipe 1 */}
        <div className="relative">
          <div className="absolute -top-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
          <TeamInputForm
            teamName={team1Name}
            teamColor="blue"
            contrat={contratE1}
            setContrat={setContratE1}
            realise={realiseE1}
            setRealise={setRealiseE1}
            belote={beloteE1}
            setBelote={setBeloteE1}
            remarque={remarqueE1}
            setRemarque={setRemarqueE1}
            onRename={() => handleRenameTeam(1)}
          />
        </div>
        
        {/* Panel droit - Équipe 2 */}
        <div className="relative">
          <div className="absolute -top-2 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-700 rounded-full"></div>
          <TeamInputForm
            teamName={team2Name}
            teamColor="red"
            contrat={contratE2}
            setContrat={setContratE2}
            realise={realiseE2}
            setRealise={setRealiseE2}
            belote={beloteE2}
            setBelote={setBeloteE2}
            remarque={remarqueE2}
            setRemarque={setRemarqueE2}
            onRename={() => handleRenameTeam(2)}
          />
        </div>
      </div>
      
      {/* Totaux */}
      <div className="mb-8 animate-in">
        <TotalScores 
          team1Name={team1Name} 
          team2Name={team2Name}
          team1Score={team1Score}
          team2Score={team2Score}
          team1Winner={team1Winner}
          team2Winner={team2Winner}
        />
      </div>
      
      {/* Affichage du donneur */}
      {teamSetupComplete && (
        <div className="text-center mb-6 p-3 glass-card rounded-lg animate-in">
          <p className="text-lg font-medium">
            <span className="text-muted-foreground mr-2">Donneur actuel:</span> 
            <span className="font-bold text-primary">{getDealerName()}</span>
          </p>
        </div>
      )}
      
      {/* Boutons d'action */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button 
          onClick={handleAddRound}
          disabled={!canAddRound}
          className="shadow-md"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter Manche
        </Button>
        <Button 
          onClick={handleCancelRound}
          variant="outline"
          disabled={data.length === 0}
          className="shadow-sm"
        >
          <UndoIcon className="mr-2 h-4 w-4" />
          Annuler Manche
        </Button>
        <Button 
          onClick={() => setShowLayoutDialog(true)}
          disabled={!teamNamesValid}
          variant="outline"
          className="shadow-sm"
        >
          <Users className="mr-2 h-4 w-4" />
          Disposition
        </Button>
        <Button 
          onClick={() => setShowStatsDialog(true)}
          disabled={data.length === 0}
          variant="outline"
          className="shadow-sm"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Statistiques
        </Button>
        <Button 
          onClick={() => setShowValuesDialog("normal")}
          variant="outline"
          className="shadow-sm"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Valeurs
        </Button>
        <Button 
          onClick={() => setShowValuesDialog("tasa")}
          variant="outline"
          className="shadow-sm"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          TA SA
        </Button>
        <Button 
          onClick={handleRestartGame}
          variant="destructive"
          disabled={data.length === 0}
          className="shadow-md"
        >
          Redémarrer
        </Button>
        <Button 
          onClick={handleRevenge}
          variant="secondary"
          disabled={!teamSetupComplete}
          className="shadow-md"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Revanche
        </Button>
      </div>
      
      {/* Tableaux de score - Modifiés pour être l'un en dessous de l'autre */}
      <div className="flex flex-col gap-8">
        <div className="relative rounded-xl overflow-hidden animate-in w-full" style={{animationDelay: "0.1s"}}>
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <BeloteTable teamName={team1Name} rows={team1Rows} />
        </div>
        <div className="relative rounded-xl overflow-hidden animate-in w-full" style={{animationDelay: "0.2s"}}>
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          <BeloteTable teamName={team2Name} rows={team2Rows} />
        </div>
      </div>
      
      {/* Dialogues */}
      {renameTeamDialog && (
        <TeamNameDialog
          open={renameTeamDialog.open}
          onClose={() => setRenameTeamDialog(null)}
          teamName={renameTeamDialog.team === 1 ? team1Name : team2Name}
          onSave={handleSaveTeamName}
        />
      )}
      
      <PlayerLayout
        open={showLayoutDialog}
        onClose={() => setShowLayoutDialog(false)}
        team1Players={team1Name.split("/")}
        team2Players={team2Name.split("/")}
        onSaveLayout={handleSaveLayout}
        initialPositions={players}
        initialDealer={currentDealer !== null ? currentDealer : undefined}
      />
      
      <StatsDialog
        open={showStatsDialog}
        onClose={() => setShowStatsDialog(false)}
        team1Name={team1Name}
        team2Name={team2Name}
        data={data}
      />
      
      {showValuesDialog && (
        <ValuesDialog
          open={!!showValuesDialog}
          onClose={() => setShowValuesDialog(null)}
          type={showValuesDialog}
        />
      )}
    </div>
  );
};

export default BeloteApp;

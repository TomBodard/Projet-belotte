import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import PlayerLayoutModal from "@/components/PlayerLayoutModal";
import ValuesReferenceModal from "@/components/ValuesReferenceModal";
import StatisticsModal from "@/components/StatisticsModal";
import { 
  PlusCircle, 
  XCircle, 
  Download, 
  Save, 
  BarChart, 
  Info, 
  Users, 
  RefreshCw, 
  Repeat
} from "lucide-react";
import { calculateEcart, calculatePoints, calculateTheoreticalPoints } from "@/utils/beloteCalculations";
import { validateRoundInputs } from "@/utils/beloteValidation";

// Constants from the Python code
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

interface ScoreRow {
  mene: number;
  contrat: string;
  chute: string;
  realise: string;
  ecart: number;
  ecartsTheo: number;
  belote: string;
  remarques: string;
  points: number;
  total: number;
}

const BeloteTracker: React.FC = () => {
  // Team names state
  const [team1Name, setTeam1Name] = useState<string>("Équipe 1");
  const [team2Name, setTeam2Name] = useState<string>("Équipe 2");
  const [editingTeam1, setEditingTeam1] = useState<boolean>(false);
  const [editingTeam2, setEditingTeam2] = useState<boolean>(false);
  
  // Victory condition
  const [victoryCondition, setVictoryCondition] = useState<string>("2000");
  
  // Current player inputs
  const [team1Contract, setTeam1Contract] = useState<string>("0");
  const [team1Realise, setTeam1Realise] = useState<string>("0");
  const [team1Belote, setTeam1Belote] = useState<string>("N/A");
  const [team1Remarque, setTeam1Remarque] = useState<string>("N/A");
  
  const [team2Contract, setTeam2Contract] = useState<string>("0");
  const [team2Realise, setTeam2Realise] = useState<string>("0");
  const [team2Belote, setTeam2Belote] = useState<string>("N/A");
  const [team2Remarque, setTeam2Remarque] = useState<string>("N/A");
  
  // Scores and game state
  const [team1Scores, setTeam1Scores] = useState<ScoreRow[]>([]);
  const [team2Scores, setTeam2Scores] = useState<ScoreRow[]>([]);
  const [team1Total, setTeam1Total] = useState<number>(0);
  const [team2Total, setTeam2Total] = useState<number>(0);
  
  // Game settings
  const [teamSetupComplete, setTeamSetupComplete] = useState<boolean>(false);
  const [currentDealer, setCurrentDealer] = useState<number | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  
  // Modal states
  const [showPlayerLayoutModal, setShowPlayerLayoutModal] = useState<boolean>(false);
  const [showValuesModal, setShowValuesModal] = useState<boolean>(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState<boolean>(false);
  
  // Checking if teams are properly named (with the format Name1/Name2)
  useEffect(() => {
    const isTeam1Valid = team1Name.includes('/') && team1Name.split('/').length === 2;
    const isTeam2Valid = team2Name.includes('/') && team2Name.split('/').length === 2;
    
    if (isTeam1Valid && isTeam2Valid && !teamSetupComplete) {
      toast({
        title: "Teams are ready",
        description: "Please set up the player positions",
      });
    }
  }, [team1Name, team2Name, teamSetupComplete]);
  
  // Function to handle adding a new round
  const handleAddRound = () => {
    // Validate inputs
    const validation = validateRoundInputs(
      team1Contract,
      team1Realise,
      team1Belote,
      team1Remarque,
      team2Contract,
      team2Realise,
      team2Belote,
      team2Remarque
    );
    
    if (!validation.valid) {
      toast({
        title: "Invalid Input",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    // Calculate the theoretical gaps and points using our utility functions
    const ecart1 = calculateEcart(team1Contract, team1Realise);
    const ecart2 = calculateEcart(team2Contract, team2Realise);
    
    const [team1Point, chute1] = calculatePoints(
      team1Contract, 
      team1Realise, 
      team1Belote, 
      team1Remarque,
      team2Contract,
      team2Realise,
      team2Belote,
      team2Remarque
    );
    
    const [team2Point, chute2] = calculatePoints(
      team2Contract, 
      team2Realise, 
      team2Belote, 
      team2Remarque,
      team1Contract,
      team1Realise,
      team1Belote,
      team1Remarque
    );
    
    const theo1 = calculateTheoreticalPoints(team1Contract, team1Realise, team1Belote);
    const theo2 = calculateTheoreticalPoints(team2Contract, team2Realise, team2Belote);
    
    const newTeam1Total = team1Total + team1Point;
    const newTeam2Total = team2Total + team2Point;
    
    // Create new rounds
    const newTeam1Round: ScoreRow = {
      mene: team1Scores.length + 1,
      contrat: team1Contract,
      chute: chute1,
      realise: team1Realise,
      ecart: ecart1,
      ecartsTheo: team1Scores.length > 0 ? 
        team1Scores[team1Scores.length-1].ecartsTheo + (team1Contract !== "0" ? ecart1 : 0) : 
        (team1Contract !== "0" ? ecart1 : 0),
      belote: team1Belote === "N/A" ? "" : team1Belote,
      remarques: team1Remarque === "N/A" ? "" : team1Remarque,
      points: team1Point,
      total: newTeam1Total
    };
    
    const newTeam2Round: ScoreRow = {
      mene: team2Scores.length + 1,
      contrat: team2Contract,
      chute: chute2,
      realise: team2Realise,
      ecart: ecart2,
      ecartsTheo: team2Scores.length > 0 ? 
        team2Scores[team2Scores.length-1].ecartsTheo + (team2Contract !== "0" ? ecart2 : 0) : 
        (team2Contract !== "0" ? ecart2 : 0),
      belote: team2Belote === "N/A" ? "" : team2Belote,
      remarques: team2Remarque === "N/A" ? "" : team2Remarque,
      points: team2Point,
      total: newTeam2Total
    };
    
    setTeam1Scores([...team1Scores, newTeam1Round]);
    setTeam2Scores([...team2Scores, newTeam2Round]);
    setTeam1Total(newTeam1Total);
    setTeam2Total(newTeam2Total);
    
    // Reset inputs
    setTeam1Contract("0");
    setTeam1Realise("0");
    setTeam1Belote("N/A");
    setTeam1Remarque("N/A");
    setTeam2Contract("0");
    setTeam2Realise("0");
    setTeam2Belote("N/A");
    setTeam2Remarque("N/A");
    
    // Update dealer
    if (currentDealer !== null) {
      setCurrentDealer((currentDealer + 1) % 4);
    }
    
    // Check for winner
    const victoryValue = parseInt(victoryCondition);
    if (newTeam1Total >= victoryValue) {
      toast({
        title: "Game Over!",
        description: `${team1Name} wins with ${newTeam1Total} points!`,
      });
    } else if (newTeam2Total >= victoryValue) {
      toast({
        title: "Game Over!",
        description: `${team2Name} wins with ${newTeam2Total} points!`,
      });
    }

    // Show success message
    toast({
      title: "Round Added",
      description: `Round ${team1Scores.length + 1} has been added successfully!`,
    });
  };
  
  // Function to handle undoing the last round
  const handleUndoRound = () => {
    if (team1Scores.length === 0) return;
    
    const newTeam1Scores = [...team1Scores];
    const newTeam2Scores = [...team2Scores];
    
    newTeam1Scores.pop();
    newTeam2Scores.pop();
    
    setTeam1Scores(newTeam1Scores);
    setTeam2Scores(newTeam2Scores);
    
    // Update totals
    const newTeam1Total = newTeam1Scores.length > 0 ? newTeam1Scores[newTeam1Scores.length - 1].total : 0;
    const newTeam2Total = newTeam2Scores.length > 0 ? newTeam2Scores[newTeam2Scores.length - 1].total : 0;
    
    setTeam1Total(newTeam1Total);
    setTeam2Total(newTeam2Total);
    
    // Update dealer
    if (currentDealer !== null) {
      setCurrentDealer((currentDealer - 1 + 4) % 4);
    }
    
    toast({
      title: "Round Undone",
      description: "The last round has been removed",
    });
  };
  
  // Function to handle saving the player layout
  const handleSavePlayerLayout = (newPlayers: string[], dealerIndex: number) => {
    setPlayers(newPlayers);
    setCurrentDealer(dealerIndex);
    setTeamSetupComplete(true);
    
    toast({
      title: "Player Layout Saved",
      description: `First dealer: ${newPlayers[dealerIndex]}`,
    });
  };
  
  // Function to restart the game
  const restartGame = () => {
    setTeam1Scores([]);
    setTeam2Scores([]);
    setTeam1Total(0);
    setTeam2Total(0);
    
    toast({
      title: "Game Restarted",
      description: "All scores have been reset",
    });
  };
  
  // Function to handle team name editing
  const handleTeamNameChange = (team: 'team1' | 'team2', value: string) => {
    if (team === 'team1') {
      setTeam1Name(value);
      setEditingTeam1(false);
    } else {
      setTeam2Name(value);
      setEditingTeam2(false);
    }
  };
  
  // Dropdown options
  const contractOptions = Object.keys(CONTRATS);
  const realiseOptions = Object.keys(REALISES);
  const beloteOptions = Object.keys(BELOTE_ANNONCES);
  const remarqueOptions = Object.keys(REMARQUES);
  
  // Determine if teams are properly set up
  const teamsValid = team1Name.includes('/') && team1Name.split('/').length === 2 && 
                     team2Name.includes('/') && team2Name.split('/').length === 2;
  
  // Determine if Add Round button should be enabled
  const addButtonEnabled = teamSetupComplete && 
    ((team1Contract !== "0" && team1Realise !== "0") || 
     (team2Contract !== "0" && team2Realise !== "0"));
  
  return (
    <div className="container mx-auto px-4 py-8 bg-background min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Belote Score Tracker</h1>
        <p className="text-sm text-muted-foreground">
          {!teamSetupComplete ? "Enter team names in the format Name1/Name2" : ""}
        </p>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Settings */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            {editingTeam1 ? (
              <div className="flex gap-2 w-full">
                <Input 
                  value={team1Name} 
                  onChange={(e) => setTeam1Name(e.target.value)}
                  onBlur={() => setEditingTeam1(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTeamNameChange('team1', team1Name)}
                  autoFocus
                />
                <Button 
                  variant="outline" 
                  onClick={() => handleTeamNameChange('team1', team1Name)}
                >
                  Save
                </Button>
              </div>
            ) : (
              <h2 
                className="text-xl font-semibold text-blue-600 cursor-pointer" 
                onClick={() => setEditingTeam1(true)}
              >
                {team1Name}
              </h2>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team1-contract">Contract</Label>
                <select 
                  id="team1-contract"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team1Contract}
                  onChange={(e) => setTeam1Contract(e.target.value)}
                >
                  {contractOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="team1-realise">Realized</Label>
                <select 
                  id="team1-realise"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team1Realise}
                  onChange={(e) => setTeam1Realise(e.target.value)}
                >
                  {realiseOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team1-belote">Belote</Label>
                <select 
                  id="team1-belote"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team1Belote}
                  onChange={(e) => setTeam1Belote(e.target.value)}
                >
                  {beloteOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="team1-remarque">Note</Label>
                <select 
                  id="team1-remarque"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team1Remarque}
                  onChange={(e) => setTeam1Remarque(e.target.value)}
                >
                  {remarqueOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team 2 Settings */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            {editingTeam2 ? (
              <div className="flex gap-2 w-full">
                <Input 
                  value={team2Name} 
                  onChange={(e) => setTeam2Name(e.target.value)}
                  onBlur={() => setEditingTeam2(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTeamNameChange('team2', team2Name)}
                  autoFocus
                />
                <Button 
                  variant="outline" 
                  onClick={() => handleTeamNameChange('team2', team2Name)}
                >
                  Save
                </Button>
              </div>
            ) : (
              <h2 
                className="text-xl font-semibold text-red-600 cursor-pointer" 
                onClick={() => setEditingTeam2(true)}
              >
                {team2Name}
              </h2>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team2-contract">Contract</Label>
                <select 
                  id="team2-contract"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team2Contract}
                  onChange={(e) => setTeam2Contract(e.target.value)}
                >
                  {contractOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="team2-realise">Realized</Label>
                <select 
                  id="team2-realise"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team2Realise}
                  onChange={(e) => setTeam2Realise(e.target.value)}
                >
                  {realiseOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team2-belote">Belote</Label>
                <select 
                  id="team2-belote"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team2Belote}
                  onChange={(e) => setTeam2Belote(e.target.value)}
                >
                  {beloteOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="team2-remarque">Note</Label>
                <select 
                  id="team2-remarque"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={team2Remarque}
                  onChange={(e) => setTeam2Remarque(e.target.value)}
                >
                  {remarqueOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Score Display */}
      <div className="my-6 p-6 border rounded-lg shadow-sm">
        <div className="flex justify-center items-center space-x-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Victory Condition</p>
            <select 
              className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={victoryCondition}
              onChange={(e) => setVictoryCondition(e.target.value)}
            >
              <option value="1000">1000</option>
              <option value="2000">2000</option>
              <option value="3000">3000</option>
            </select>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">{team1Name}</p>
            <p className="text-4xl font-bold text-blue-600">{team1Total}</p>
            {team1Total >= parseInt(victoryCondition) && 
              <span className="text-xl text-yellow-500">🏆</span>}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">{team2Name}</p>
            <p className="text-4xl font-bold text-red-600">{team2Total}</p>
            {team2Total >= parseInt(victoryCondition) && 
              <span className="text-xl text-yellow-500">🏆</span>}
          </div>
        </div>
        
        {currentDealer !== null && players.length > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Current Dealer: <span className="font-medium">{players[currentDealer]}</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Button 
          variant="default" 
          onClick={handleAddRound}
          disabled={!addButtonEnabled}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Round
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleUndoRound}
          disabled={team1Scores.length === 0}
        >
          <XCircle className="mr-2 h-4 w-4" /> Undo Round
        </Button>
        
        <Button variant="outline" onClick={() => {}}>
          <Download className="mr-2 h-4 w-4" /> Load File
        </Button>
        
        <Button variant="outline" onClick={() => {}}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowStatisticsModal(true)}
          disabled={team1Scores.length === 0}
        >
          <BarChart className="mr-2 h-4 w-4" /> Statistics
        </Button>
        
        <Button variant="outline" onClick={() => setShowValuesModal(true)}>
          <Info className="mr-2 h-4 w-4" /> Values
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowPlayerLayoutModal(true)}
          disabled={!teamsValid || teamSetupComplete}
        >
          <Users className="mr-2 h-4 w-4" /> Layout
        </Button>
        
        <Button 
          variant="outline" 
          onClick={restartGame}
          disabled={team1Scores.length === 0}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Restart
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => {}}
          disabled={team1Scores.length === 0}
        >
          <Repeat className="mr-2 h-4 w-4" /> Rematch
        </Button>
      </div>
      
      {/* Score Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Team 1 Table */}
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-semibold p-4 text-blue-600 border-b">{team1Name} Scores</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Realized</TableHead>
                  <TableHead>Diff</TableHead>
                  <TableHead>Belote</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team1Scores.length > 0 ? (
                  team1Scores.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.mene}</TableCell>
                      <TableCell>{row.contrat}</TableCell>
                      <TableCell>{row.chute}</TableCell>
                      <TableCell>{row.realise}</TableCell>
                      <TableCell>{row.ecart}</TableCell>
                      <TableCell>{row.belote}</TableCell>
                      <TableCell>{row.remarques}</TableCell>
                      <TableCell>{row.points}</TableCell>
                      <TableCell className="font-bold">{row.total}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-4">
                      No rounds played yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Team 2 Table */}
        <div className="border rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-semibold p-4 text-red-600 border-b">{team2Name} Scores</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Realized</TableHead>
                  <TableHead>Diff</TableHead>
                  <TableHead>Belote</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team2Scores.length > 0 ? (
                  team2Scores.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.mene}</TableCell>
                      <TableCell>{row.contrat}</TableCell>
                      <TableCell>{row.chute}</TableCell>
                      <TableCell>{row.realise}</TableCell>
                      <TableCell>{row.ecart}</TableCell>
                      <TableCell>{row.belote}</TableCell>
                      <TableCell>{row.remarques}</TableCell>
                      <TableCell>{row.points}</TableCell>
                      <TableCell className="font-bold">{row.total}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-4">
                      No rounds played yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <PlayerLayoutModal
        isOpen={showPlayerLayoutModal}
        onClose={() => setShowPlayerLayoutModal(false)}
        team1Name={team1Name}
        team2Name={team2Name}
        existingPlayers={players}
        existingDealer={currentDealer}
        onSave={handleSavePlayerLayout}
      />
      
      <ValuesReferenceModal 
        isOpen={showValuesModal}
        onClose={() => setShowValuesModal(false)}
      />
      
      <StatisticsModal
        isOpen={showStatisticsModal}
        onClose={() => setShowStatisticsModal(false)}
        team1Name={team1Name}
        team2Name={team2Name}
        team1Scores={team1Scores}
        team2Scores={team2Scores}
      />
    </div>
  );
};

export default BeloteTracker;

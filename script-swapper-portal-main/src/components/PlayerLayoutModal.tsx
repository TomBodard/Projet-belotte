
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface PlayerLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  team1Name: string;
  team2Name: string;
  existingPlayers?: string[];
  existingDealer?: number | null;
  onSave: (players: string[], dealer: number) => void;
}

const PlayerLayoutModal: React.FC<PlayerLayoutModalProps> = ({
  isOpen,
  onClose,
  team1Name,
  team2Name,
  existingPlayers = [],
  existingDealer = null,
  onSave
}) => {
  const [positions, setPositions] = useState<Record<string, string>>({
    "topLeft": "",
    "topRight": "",
    "bottomLeft": "",
    "bottomRight": ""
  });
  
  const [dealer, setDealer] = useState<string>("");
  const [team1Players, setTeam1Players] = useState<string[]>([]);
  const [team2Players, setTeam2Players] = useState<string[]>([]);
  
  useEffect(() => {
    if (team1Name && team1Name.includes('/')) {
      setTeam1Players(team1Name.split('/'));
    }
    
    if (team2Name && team2Name.includes('/')) {
      setTeam2Players(team2Name.split('/'));
    }
    
    // Fill in existing player positions if available
    if (existingPlayers && existingPlayers.length === 4) {
      setPositions({
        "topLeft": existingPlayers[0],
        "topRight": existingPlayers[1],
        "bottomLeft": existingPlayers[2],
        "bottomRight": existingPlayers[3]
      });
      
      if (existingDealer !== null && existingDealer >= 0 && existingDealer < 4) {
        setDealer(existingPlayers[existingDealer]);
      }
    }
  }, [team1Name, team2Name, existingPlayers, existingDealer, isOpen]);
  
  const allPlayers = [...team1Players, ...team2Players];
  
  const handlePositionChange = (position: string, player: string) => {
    // Don't allow the same player to be in multiple positions
    const currentPositions = { ...positions };
    
    // If this player is already in another position, remove them
    Object.keys(currentPositions).forEach(pos => {
      if (currentPositions[pos] === player) {
        currentPositions[pos] = "";
      }
    });
    
    // Set the player in the new position
    currentPositions[position] = player;
    
    // Handle partnerships - if team1Player is set in topLeft, their partner goes to bottomRight
    if (position === "topLeft" && team1Players.includes(player)) {
      const partner = team1Players.find(p => p !== player);
      if (partner) {
        currentPositions["bottomRight"] = partner;
      }
    } else if (position === "topRight" && team1Players.includes(player)) {
      const partner = team1Players.find(p => p !== player);
      if (partner) {
        currentPositions["bottomLeft"] = partner;
      }
    } else if (position === "topLeft" && team2Players.includes(player)) {
      const partner = team2Players.find(p => p !== player);
      if (partner) {
        currentPositions["bottomRight"] = partner;
      }
    } else if (position === "topRight" && team2Players.includes(player)) {
      const partner = team2Players.find(p => p !== player);
      if (partner) {
        currentPositions["bottomLeft"] = partner;
      }
    }
    
    setPositions(currentPositions);
  };
  
  const handleSave = () => {
    // Check if all positions are filled
    if (Object.values(positions).some(pos => !pos) || !dealer) {
      toast({
        title: "Incomplete Layout",
        description: "Please select players for all positions and designate a dealer",
        variant: "destructive"
      });
      return;
    }
    
    // Check for duplicates
    const selectedPlayers = Object.values(positions);
    if (new Set(selectedPlayers).size !== selectedPlayers.length) {
      toast({
        title: "Duplicate Players",
        description: "Each player can only be in one position",
        variant: "destructive"
      });
      return;
    }
    
    // Convert to array in clockwise order and find dealer index
    const playersArray = [
      positions.topLeft,
      positions.topRight,
      positions.bottomRight,
      positions.bottomLeft
    ];
    
    const dealerIndex = playersArray.indexOf(dealer);
    
    onSave(playersArray, dealerIndex);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Player Layout</DialogTitle>
          <DialogDescription>
            Set the positions of each player around the table and choose the first dealer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="col-span-3 text-center mb-4">
            <p className="text-sm font-medium">Table Arrangement</p>
          </div>
          
          {/* Top row */}
          <div></div>
          <div className="border rounded p-3 text-center">
            <Label htmlFor="topLeft" className="text-xs mb-1 block">Top Left</Label>
            <select
              id="topLeft"
              className="w-full text-xs p-1 border rounded"
              value={positions.topLeft}
              onChange={(e) => handlePositionChange("topLeft", e.target.value)}
            >
              <option value="">Select player</option>
              {allPlayers.map(player => (
                <option key={`topLeft-${player}`} value={player}>{player}</option>
              ))}
            </select>
          </div>
          <div className="border rounded p-3 text-center">
            <Label htmlFor="topRight" className="text-xs mb-1 block">Top Right</Label>
            <select
              id="topRight"
              className="w-full text-xs p-1 border rounded"
              value={positions.topRight}
              onChange={(e) => handlePositionChange("topRight", e.target.value)}
            >
              <option value="">Select player</option>
              {allPlayers.map(player => (
                <option key={`topRight-${player}`} value={player}>{player}</option>
              ))}
            </select>
          </div>
          
          {/* Middle row - shows a table graphic */}
          <div></div>
          <div className="aspect-square bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
            Table
          </div>
          <div></div>
          
          {/* Bottom row */}
          <div className="border rounded p-3 text-center">
            <Label htmlFor="bottomLeft" className="text-xs mb-1 block">Bottom Left</Label>
            <select
              id="bottomLeft"
              className="w-full text-xs p-1 border rounded"
              value={positions.bottomLeft}
              onChange={(e) => handlePositionChange("bottomLeft", e.target.value)}
            >
              <option value="">Select player</option>
              {allPlayers.map(player => (
                <option key={`bottomLeft-${player}`} value={player}>{player}</option>
              ))}
            </select>
          </div>
          <div className="border rounded p-3 text-center">
            <Label htmlFor="bottomRight" className="text-xs mb-1 block">Bottom Right</Label>
            <select
              id="bottomRight"
              className="w-full text-xs p-1 border rounded"
              value={positions.bottomRight}
              onChange={(e) => handlePositionChange("bottomRight", e.target.value)}
            >
              <option value="">Select player</option>
              {allPlayers.map(player => (
                <option key={`bottomRight-${player}`} value={player}>{player}</option>
              ))}
            </select>
          </div>
          <div></div>
          
          {/* Dealer selection */}
          <div className="col-span-3 mt-4">
            <Label htmlFor="dealer" className="text-sm font-medium">First Dealer</Label>
            <select
              id="dealer"
              className="w-full mt-1 p-2 border rounded"
              value={dealer}
              onChange={(e) => setDealer(e.target.value)}
            >
              <option value="">Select dealer</option>
              {allPlayers.map(player => (
                <option key={`dealer-${player}`} value={player}>{player}</option>
              ))}
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Layout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerLayoutModal;

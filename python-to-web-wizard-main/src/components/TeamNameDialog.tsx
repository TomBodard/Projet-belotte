
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TeamNameDialogProps {
  open: boolean;
  onClose: () => void;
  teamName: string;
  onSave: (name: string) => void;
}

const TeamNameDialog: React.FC<TeamNameDialogProps> = ({ open, onClose, teamName, onSave }) => {
  const [name, setName] = useState(teamName);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.includes("/") || name.split("/").length !== 2) {
      setError("Le nom doit contenir deux joueurs séparés par '/' (ex: Nom1/Nom2)");
      return;
    }
    setError("");
    onSave(name);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renommer l'équipe</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="team-name">Nom de l'équipe (format: Joueur1/Joueur2)</Label>
          <Input 
            id="team-name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom1/Nom2"
            className="col-span-3"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamNameDialog;

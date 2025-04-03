
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contrat, Realise, BeloteAnnonce, Remarque, CONTRATS, REALISES, BELOTE_ANNONCES, REMARQUES } from "@/types/belote";

interface TeamInputFormProps {
  teamName: string;
  teamColor: string;
  contrat: Contrat;
  setContrat: (value: Contrat) => void;
  realise: Realise;
  setRealise: (value: Realise) => void;
  belote: BeloteAnnonce;
  setBelote: (value: BeloteAnnonce) => void;
  remarque: Remarque;
  setRemarque: (value: Remarque) => void;
  onRename: () => void;
}

const TeamInputForm: React.FC<TeamInputFormProps> = ({
  teamName,
  teamColor,
  contrat,
  setContrat,
  realise,
  setRealise,
  belote,
  setBelote,
  remarque,
  setRemarque,
  onRename
}) => {
  return (
    <div className="border rounded-md p-4 bg-white shadow">
      <h3 
        className="text-lg font-bold mb-3 cursor-pointer hover:underline" 
        style={{ color: teamColor }}
        onClick={onRename}
        onDoubleClick={onRename}
      >
        {teamName}
      </h3>
      
      <div className="grid gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`contrat-${teamName}`}>Contrat :</Label>
          <Select value={contrat} onValueChange={(value) => setContrat(value as Contrat)}>
            <SelectTrigger id={`contrat-${teamName}`}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CONTRATS).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor={`realise-${teamName}`}>Réalisé :</Label>
          <Select value={realise} onValueChange={(value) => setRealise(value as Realise)}>
            <SelectTrigger id={`realise-${teamName}`}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(REALISES).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor={`belote-${teamName}`}>Annonce Belote :</Label>
          <Select value={belote} onValueChange={(value) => setBelote(value as BeloteAnnonce)}>
            <SelectTrigger id={`belote-${teamName}`}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(BELOTE_ANNONCES).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor={`remarque-${teamName}`}>Remarque :</Label>
          <Select value={remarque} onValueChange={(value) => setRemarque(value as Remarque)}>
            <SelectTrigger id={`remarque-${teamName}`}>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(REMARQUES).map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TeamInputForm;

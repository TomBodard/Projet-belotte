
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DisplayRow } from '@/types/belote';

interface BeloteTableProps {
  teamName: string;
  rows: DisplayRow[];
}

const BeloteTable: React.FC<BeloteTableProps> = ({ teamName, rows }) => {
  // Définition des en-têtes du tableau
  const headers = ["Mène", "Contrat", "Chute", "Réalisé", "Ecart", "Ecarts Théo", "Belote", "Remarques", "Points", "Total"];

  return (
    <div className="overflow-x-auto w-full">
      <h3 className="text-lg font-bold mb-2">Tableau {teamName}</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="bg-gray-200 text-center font-bold whitespace-nowrap px-2">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="text-center">{row.Mène}</TableCell>
              <TableCell className="text-center">{row.Contrat}</TableCell>
              <TableCell className="text-center">{row.Chute}</TableCell>
              <TableCell className="text-center">{row.Réalisé}</TableCell>
              <TableCell className="text-center">{row.Ecart}</TableCell>
              <TableCell className="text-center">{row["Ecarts Théo"]}</TableCell>
              <TableCell className="text-center">{row.Belote}</TableCell>
              <TableCell className="text-center">{row.Remarques}</TableCell>
              <TableCell className="text-center">{row.Points}</TableCell>
              <TableCell 
                className="text-center font-semibold" 
                style={{ backgroundColor: row.Total.backgroundColor }}
              >
                {row.Total.text}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BeloteTable;

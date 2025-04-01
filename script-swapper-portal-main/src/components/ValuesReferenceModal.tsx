
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ValuesReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ValuesReferenceModal: React.FC<ValuesReferenceModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Belote Reference Values</DialogTitle>
          <DialogDescription>
            Reference tables for contracts, announcements, and scoring in Belote
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contracts</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["0", "0"],
                  ["80", "80"],
                  ["90", "90"],
                  ["100", "100"],
                  ["110", "110"],
                  ["120", "120"],
                  ["130", "130"],
                  ["140", "140"],
                  ["150", "150"],
                  ["160", "160"],
                  ["Capot", "500"],
                  ["Générale", "1000"]
                ].map(([contract, points], index) => (
                  <TableRow key={index}>
                    <TableCell>{contract}</TableCell>
                    <TableCell>{points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Belote Announcements</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Announcement</TableHead>
                  <TableHead>Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["N/A", "0"],
                  ["Belote", "20"],
                  ["Double Belote", "40"],
                  ["Triple Belote", "60"],
                  ["Quadruple Belote", "80"]
                ].map(([announcement, points], index) => (
                  <TableRow key={index}>
                    <TableCell>{announcement}</TableCell>
                    <TableCell>{points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <h3 className="text-lg font-semibold mt-6">Remarks</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Remark</TableHead>
                  <TableHead>Multiplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["N/A", "1x"],
                  ["Coinche", "2x"],
                  ["Sur Coinche", "4x"]
                ].map(([remark, multiplier], index) => (
                  <TableRow key={index}>
                    <TableCell>{remark}</TableCell>
                    <TableCell>{multiplier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Realized Points</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Points actually won during play (0-160)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-8 gap-2">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160].map((value) => (
              <div key={value} className="px-2 py-1 border rounded text-center">{value}</div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValuesReferenceModal;

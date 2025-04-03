
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BeloteRow } from '@/types/belote';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsDialogProps {
  open: boolean;
  onClose: () => void;
  team1Name: string;
  team2Name: string;
  data: BeloteRow[];
}

const StatsDialog: React.FC<StatsDialogProps> = ({ open, onClose, team1Name, team2Name, data }) => {
  // Calcul des statistiques
  const totalManches = data.length;
  const foisPrisE1 = data.filter(row => row.Contrat > 0).length;
  const foisPrisE2 = data.filter(row => row.Contrat_E2 > 0).length;
  const chutesE1 = data.reduce((sum, row) => sum + row.Chute, 0);
  const chutesE2 = data.reduce((sum, row) => sum + row.Chute_E2, 0);
  
  // Moyennes pour l'équipe 1
  const contratsE1 = data.filter(row => row.Contrat > 0);
  const moyenneContratE1 = contratsE1.length > 0 
    ? Math.round(contratsE1.reduce((sum, row) => sum + row.Contrat, 0) / contratsE1.length) 
    : 0;
  const moyenneRealiseE1 = contratsE1.length > 0 
    ? Math.round(contratsE1.reduce((sum, row) => sum + row.Réalisé, 0) / contratsE1.length) 
    : 0;
  const moyenneEcartsE1 = contratsE1.length > 0 
    ? Math.round(contratsE1.reduce((sum, row) => sum + row.Ecart, 0) / contratsE1.length) 
    : 0;
  
  // Moyennes pour l'équipe 2
  const contratsE2 = data.filter(row => row.Contrat_E2 > 0);
  const moyenneContratE2 = contratsE2.length > 0 
    ? Math.round(contratsE2.reduce((sum, row) => sum + row.Contrat_E2, 0) / contratsE2.length) 
    : 0;
  const moyenneRealiseE2 = contratsE2.length > 0 
    ? Math.round(contratsE2.reduce((sum, row) => sum + row.Réalisé_E2, 0) / contratsE2.length) 
    : 0;
  const moyenneEcartsE2 = contratsE2.length > 0 
    ? Math.round(contratsE2.reduce((sum, row) => sum + row.Ecart_E2, 0) / contratsE2.length) 
    : 0;

  // Préparation des données pour le graphique
  const chartData = data.map((row, index) => {
    // Calculer les scores cumulés
    const scoreE1Cum = data.slice(0, index + 1).reduce((sum, r) => sum + r.Points, 0);
    const scoreE2Cum = data.slice(0, index + 1).reduce((sum, r) => sum + r.Points_E2, 0);
    
    // Calculer les écarts théoriques cumulés avec les scores
    const ecartTheoE1 = row["Ecarts Théorique"];
    const ecartTheoE2 = row["Ecarts Théorique_E2"];
    const theoE1 = scoreE1Cum + ecartTheoE1;
    const theoE2 = scoreE2Cum + ecartTheoE2;
    
    return {
      manche: row.Mène,
      scoreE1: scoreE1Cum,
      scoreE2: scoreE2Cum,
      theoE1,
      theoE2,
      name: `Manche ${row.Mène}`
    };
  });

  const chartConfig = {
    scoreE1: {
      label: `${team1Name} Réel`,
      color: "#3b82f6" // blue-500
    },
    theoE1: {
      label: `${team1Name} Réel + Écart Théo`,
      color: "#60a5fa" // blue-400
    },
    scoreE2: {
      label: `${team2Name} Réel`,
      color: "#f97316" // orange-500
    },
    theoE2: {
      label: `${team2Name} Réel + Écart Théo`,
      color: "#fb923c" // orange-400
    }
  };

  const team1Color = "bg-blue-500";
  const team2Color = "bg-orange-500";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl bg-white dark:bg-gray-900 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Statistiques de la partie
            <div className="mt-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              Évolution des scores et performance des équipes
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Statistiques des deux équipes côte à côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Équipe 1 */}
            <Card className="border shadow-sm overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-900 dark:border-blue-900/20">
              <CardHeader className="pb-2">
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-blue-700 dark:text-blue-400 font-semibold">{team1Name}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Parties prises</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {foisPrisE1}/{totalManches}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chutes</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      {chutesE1}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Contrats</span>
                    <span className="font-mono font-medium">{moyenneContratE1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Réalisé</span>
                    <span className="font-mono font-medium">{moyenneRealiseE1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Écarts</span>
                    <span className="font-mono font-medium">{moyenneEcartsE1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Équipe 2 */}
            <Card className="border shadow-sm overflow-hidden bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/30 dark:to-gray-900 dark:border-orange-900/20">
              <CardHeader className="pb-2">
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-orange-700 dark:text-orange-400 font-semibold">{team2Name}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Parties prises</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                      {foisPrisE2}/{totalManches}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chutes</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      {chutesE2}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Contrats</span>
                    <span className="font-mono font-medium">{moyenneContratE2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Réalisé</span>
                    <span className="font-mono font-medium">{moyenneRealiseE2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moy. Écarts</span>
                    <span className="font-mono font-medium">{moyenneEcartsE2}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Graphique en dessous des statistiques */}
          <Card className="border shadow-sm h-[400px] dark:border-gray-800">
            <CardContent className="p-2 h-full">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={chartData} 
                    margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis 
                      dataKey="manche" 
                      tick={{ fontSize: 12 }}
                      stroke="#9CA3AF"
                      height={50}
                      tickMargin={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#9CA3AF"
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(229, 231, 235, 1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="scoreE1" 
                      name={`${team1Name} Réel`}
                      stroke="#3b82f6" 
                      strokeWidth={2.5} 
                      dot={{ r: 5, strokeWidth: 1 }} 
                      activeDot={{ r: 7, strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="theoE1" 
                      name={`${team1Name} + Théo`}
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={{ r: 4, strokeWidth: 1 }} 
                      opacity={0.7} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scoreE2" 
                      name={`${team2Name} Réel`}
                      stroke="#f97316" 
                      strokeWidth={2.5} 
                      dot={{ r: 5, strokeWidth: 1 }} 
                      activeDot={{ r: 7, strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="theoE2" 
                      name={`${team2Name} + Théo`}
                      stroke="#f97316" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={{ r: 4, strokeWidth: 1 }} 
                      opacity={0.7} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDialog;

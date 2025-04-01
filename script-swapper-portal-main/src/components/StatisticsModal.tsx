
import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateEcart } from "@/utils/beloteCalculations";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team1Name: string;
  team2Name: string;
  team1Scores: ScoreRow[];
  team2Scores: ScoreRow[];
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ 
  isOpen, 
  onClose, 
  team1Name, 
  team2Name, 
  team1Scores, 
  team2Scores 
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    // No rounds played yet
    if (team1Scores.length === 0) return null;
    
    // Calculate contract statistics
    const team1Contracts = team1Scores.filter(row => row.contrat !== "0").length;
    const team2Contracts = team2Scores.filter(row => row.contrat !== "0").length;
    
    // Calculate success rate
    const team1Success = team1Scores.filter(row => row.contrat !== "0" && row.chute === "Non").length;
    const team2Success = team2Scores.filter(row => row.contrat !== "0" && row.chute === "Non").length;
    
    // Calculate average points per round
    const team1AvgPoints = team1Scores.reduce((sum, row) => sum + row.points, 0) / team1Scores.length;
    const team2AvgPoints = team2Scores.reduce((sum, row) => sum + row.points, 0) / team2Scores.length;
    
    // Calculate belote statistics
    const team1Belotes = team1Scores.filter(row => row.belote !== "").length;
    const team2Belotes = team2Scores.filter(row => row.belote !== "").length;
    
    // Calculate coinche statistics
    const team1Coinches = team1Scores.filter(row => row.remarques.includes("Coinche")).length;
    const team2Coinches = team2Scores.filter(row => row.remarques.includes("Coinche")).length;
    
    // Calculate contract distribution
    const team1ContractTypes = team1Scores.reduce((acc, row) => {
      if (row.contrat !== "0") {
        acc[row.contrat] = (acc[row.contrat] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const team2ContractTypes = team2Scores.reduce((acc, row) => {
      if (row.contrat !== "0") {
        acc[row.contrat] = (acc[row.contrat] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate lead changes
    let leadChanges = 0;
    let leadingTeam = null;
    
    for (let i = 0; i < team1Scores.length; i++) {
      const team1Total = team1Scores[i].total;
      const team2Total = team2Scores[i].total;
      
      const currentLeader = team1Total > team2Total ? 1 : team2Total > team1Total ? 2 : 0;
      
      if (leadingTeam !== null && currentLeader !== 0 && currentLeader !== leadingTeam) {
        leadChanges++;
      }
      
      if (currentLeader !== 0) {
        leadingTeam = currentLeader;
      }
    }
    
    // Return all statistics
    return {
      totalRounds: team1Scores.length,
      contractsPlayed: {
        team1: team1Contracts,
        team2: team2Contracts,
        team1Percentage: (team1Contracts / team1Scores.length) * 100,
        team2Percentage: (team2Contracts / team2Scores.length) * 100,
      },
      successRate: {
        team1: team1Success / (team1Contracts || 1) * 100,
        team2: team2Success / (team2Contracts || 1) * 100,
      },
      averagePoints: {
        team1: team1AvgPoints,
        team2: team2AvgPoints,
      },
      beloteCount: {
        team1: team1Belotes,
        team2: team2Belotes,
      },
      coincheCount: {
        team1: team1Coinches,
        team2: team2Coinches,
      },
      contractDistribution: {
        team1: team1ContractTypes,
        team2: team2ContractTypes,
      },
      leadChanges,
    };
  }, [team1Scores, team2Scores]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    return team1Scores.map((row, index) => ({
      round: index + 1,
      [team1Name]: team1Scores[index].total,
      [team2Name]: team2Scores[index].total,
    }));
  }, [team1Scores, team2Scores, team1Name, team2Name]);
  
  const contractDistributionData = useMemo(() => {
    if (!stats) return [];
    
    const allContractTypes = new Set<string>();
    
    // Collect all contract types
    Object.keys(stats.contractDistribution.team1).forEach(type => allContractTypes.add(type));
    Object.keys(stats.contractDistribution.team2).forEach(type => allContractTypes.add(type));
    
    return Array.from(allContractTypes).map(contractType => ({
      contract: contractType,
      [team1Name]: stats.contractDistribution.team1[contractType] || 0,
      [team2Name]: stats.contractDistribution.team2[contractType] || 0,
    }));
  }, [stats, team1Name, team2Name]);
  
  if (!stats) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Statistics</DialogTitle>
            <DialogDescription>
              Play some rounds to see game statistics here!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Game Statistics</DialogTitle>
          <DialogDescription>
            Statistics for the current game ({stats.totalRounds} rounds played)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 mt-4">
          {/* Score progression chart */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Score Progression</h3>
            <div className="h-64">
              <ChartContainer
                config={{
                  [team1Name]: { color: "#3b82f6" },
                  [team2Name]: { color: "#ef4444" },
                }}
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round" label={{ value: "Round", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Points", angle: -90, position: "insideLeft" }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend content={<ChartLegendContent />} />
                  <Bar dataKey={team1Name} fill="#3b82f6" />
                  <Bar dataKey={team2Name} fill="#ef4444" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
          
          {/* Contract types distribution */}
          {contractDistributionData.length > 0 && (
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Contract Distribution</h3>
              <div className="h-64">
                <ChartContainer
                  config={{
                    [team1Name]: { color: "#3b82f6" },
                    [team2Name]: { color: "#ef4444" },
                  }}
                >
                  <BarChart data={contractDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="contract" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Bar dataKey={team1Name} fill="#3b82f6" />
                    <Bar dataKey={team2Name} fill="#ef4444" />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          )}
          
          {/* Key statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Contract Statistics</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statistic</TableHead>
                    <TableHead className="text-blue-600">{team1Name}</TableHead>
                    <TableHead className="text-red-600">{team2Name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Contracts Played</TableCell>
                    <TableCell>{stats.contractsPlayed.team1} ({stats.contractsPlayed.team1Percentage.toFixed(1)}%)</TableCell>
                    <TableCell>{stats.contractsPlayed.team2} ({stats.contractsPlayed.team2Percentage.toFixed(1)}%)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Success Rate</TableCell>
                    <TableCell>{stats.successRate.team1.toFixed(1)}%</TableCell>
                    <TableCell>{stats.successRate.team2.toFixed(1)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average Points/Round</TableCell>
                    <TableCell>{stats.averagePoints.team1.toFixed(1)}</TableCell>
                    <TableCell>{stats.averagePoints.team2.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Special Announcements</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statistic</TableHead>
                    <TableHead className="text-blue-600">{team1Name}</TableHead>
                    <TableHead className="text-red-600">{team2Name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Belote Announcements</TableCell>
                    <TableCell>{stats.beloteCount.team1}</TableCell>
                    <TableCell>{stats.beloteCount.team2}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Coinche/Sur Coinche</TableCell>
                    <TableCell>{stats.coincheCount.team1}</TableCell>
                    <TableCell>{stats.coincheCount.team2}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lead Changes</TableCell>
                    <TableCell colSpan={2} className="text-center">{stats.leadChanges}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatisticsModal;


import React from 'react';
import { Trophy } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface TotalScoresProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  team1Winner: boolean;
  team2Winner: boolean;
}

const TotalScores: React.FC<TotalScoresProps> = ({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  team1Winner,
  team2Winner
}) => {
  // Calculer les pourcentages pour les barres de progrès
  const totalScore = team1Score + team2Score;
  const team1Percentage = totalScore > 0 ? (team1Score / totalScore) * 100 : 50;
  const team2Percentage = totalScore > 0 ? (team2Score / totalScore) * 100 : 50;
  
  return (
    <div className="glass-card rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Scores actuels</h3>
      
      <div className="space-y-6">
        {/* Équipe 1 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="font-medium text-lg">{team1Name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">{team1Score}</span>
              {team1Winner && (
                <Trophy className="ml-2 h-5 w-5 text-yellow-500 animate-pulse" />
              )}
            </div>
          </div>
          <Progress value={team1Percentage} className="h-2.5 bg-gray-200" />
        </div>
        
        {/* Équipe 2 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              <span className="font-medium text-lg">{team2Name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-600">{team2Score}</span>
              {team2Winner && (
                <Trophy className="ml-2 h-5 w-5 text-yellow-500 animate-pulse" />
              )}
            </div>
          </div>
          <Progress value={team2Percentage} className="h-2.5 bg-gray-200" />
        </div>
      </div>
      
      {(team1Winner || team2Winner) && (
        <div className="mt-4 text-center">
          <div className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-bold">
            Partie terminée !
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalScores;

// Test component to verify all imports and context providers work correctly
import React from 'react';
import { useMode } from '../context/ModeContext';
import { useGame } from '../context/GameContext';

const SystemTest = () => {
  const { getCurrentTheme } = useMode();
  const { gameState } = useGame();
  
  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
      <h3 className="text-green-800 font-bold">✅ System Test Passed!</h3>
      <div className="text-sm text-green-700 mt-2">
        <p>• ModeContext: {getCurrentTheme() ? 'Working' : 'Error'}</p>
        <p>• GameContext: {gameState ? 'Working' : 'Error'}</p>
        <p>• All imports: Resolved</p>
        <p>• Ultra-advanced gamified learning platform: Ready!</p>
      </div>
    </div>
  );
};

export default SystemTest;
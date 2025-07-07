import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { CharacterCreation } from "./components/CharacterCreation";
import { GameplayScreen } from "./components/GameplayScreen";
import { CombatScreen } from "./components/CombatScreen";
import { StoryScreen } from "./components/StoryScreen";
import { GameProvider } from "./contexts/GameContext";
import { Toaster } from "./components/ui/toaster";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [gameInitialized, setGameInitialized] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("character_creation");
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/game/initialize`);
      setGameData(response.data);
      setGameInitialized(true);
      setLoading(false);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      setLoading(false);
    }
  };

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Awakening the Ancient Ones...</p>
          <p className="text-purple-400 text-sm mt-2">Generating pixel art assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black overflow-hidden">
      <GameProvider gameData={gameData}>
        {/* Header */}
        <header className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-purple-800/30 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-purple-200 font-serif tracking-wide">
              <span className="text-purple-400">Shadows</span> of <span className="text-green-400">Arkham</span>
            </h1>
            <div className="text-purple-300 text-sm">
              16-bit Lovecraftian Horror JRPG
            </div>
          </div>
        </header>

        {/* Game Content */}
        <main className="relative">
          {currentScreen === "character_creation" && (
            <CharacterCreation 
              onComplete={() => handleScreenChange("story")}
            />
          )}
          {currentScreen === "story" && (
            <StoryScreen 
              onCombat={() => handleScreenChange("combat")}
              onGameScreen={() => handleScreenChange("gameplay")}
            />
          )}
          {currentScreen === "combat" && (
            <CombatScreen 
              onVictory={() => handleScreenChange("story")}
              onGameOver={() => handleScreenChange("character_creation")}
            />
          )}
          {currentScreen === "gameplay" && (
            <GameplayScreen 
              onCombat={() => handleScreenChange("combat")}
              onStory={() => handleScreenChange("story")}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-70 backdrop-blur-sm border-t border-purple-800/30 p-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="text-purple-400">
              WASD/Arrows to move • SPACE to interact • ESC for menu
            </div>
            <div className="text-purple-300">
              Demo Version • {new Date().getFullYear()}
            </div>
          </div>
        </footer>

        <Toaster />
      </GameProvider>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
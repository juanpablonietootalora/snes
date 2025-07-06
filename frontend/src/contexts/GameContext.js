import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const GameProvider = ({ children, gameData }) => {
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [party, setParty] = useState([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [storyScenes, setStoryScenes] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [combatState, setCombatState] = useState(null);
  const [sanityMeter, setSanityMeter] = useState(100);
  const [madnessLevel, setMadnessLevel] = useState(0);

  useEffect(() => {
    if (gameData) {
      setStoryScenes(gameData.story_scenes || []);
      setEnemies(gameData.enemies || []);
      setGameState(gameData.game_state || null);
    }
  }, [gameData]);

  const createCharacter = async (name, characterClass) => {
    try {
      const response = await axios.post(`${API}/character/create`, {
        name,
        character_class: characterClass
      });
      
      const newCharacter = response.data;
      setCurrentCharacter(newCharacter);
      setParty([newCharacter]);
      
      return newCharacter;
    } catch (error) {
      console.error("Failed to create character:", error);
      throw error;
    }
  };

  const getCharacterAbilities = async (characterClass) => {
    try {
      const response = await axios.get(`${API}/character/abilities/${characterClass}`);
      return response.data.abilities;
    } catch (error) {
      console.error("Failed to get abilities:", error);
      return [];
    }
  };

  const startCombat = async () => {
    try {
      if (!gameState?.id) {
        throw new Error("No game state available");
      }

      const response = await axios.post(`${API}/combat/start?game_state_id=${gameState.id}`);
      setCombatState(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to start combat:", error);
      throw error;
    }
  };

  const updateSanity = (amount) => {
    setSanityMeter(prev => {
      const newSanity = Math.max(0, Math.min(100, prev + amount));
      
      // Check for madness levels
      if (newSanity < 25 && madnessLevel < 1) {
        setMadnessLevel(1);
      } else if (newSanity < 50 && madnessLevel < 2) {
        setMadnessLevel(2);
      } else if (newSanity < 75 && madnessLevel < 3) {
        setMadnessLevel(3);
      }
      
      return newSanity;
    });
  };

  const nextScene = () => {
    if (currentScene < storyScenes.length - 1) {
      setCurrentScene(currentScene + 1);
    }
  };

  const previousScene = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
    }
  };

  const value = {
    currentCharacter,
    party,
    currentScene,
    storyScenes,
    enemies,
    gameState,
    combatState,
    sanityMeter,
    madnessLevel,
    createCharacter,
    getCharacterAbilities,
    startCombat,
    updateSanity,
    nextScene,
    previousScene,
    setCurrentCharacter,
    setParty,
    setCurrentScene,
    setCombatState
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
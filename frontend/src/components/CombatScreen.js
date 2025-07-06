import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useGame } from "../contexts/GameContext";
import { useToast } from "../hooks/use-toast";

export const CombatScreen = ({ onVictory, onGameOver }) => {
  const { 
    currentCharacter, 
    enemies, 
    startCombat, 
    combatState, 
    updateSanity,
    sanityMeter 
  } = useGame();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [combatLog, setCombatLog] = useState([]);
  const [playerAction, setPlayerAction] = useState(null);
  const [enemyStates, setEnemyStates] = useState([]);
  const [characterState, setCharacterState] = useState(null);
  const [turnPhase, setTurnPhase] = useState("select_action"); // "select_action", "executing", "enemy_turn"
  const [pactAvailable, setPactAvailable] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    initializeCombat();
  }, []);

  const initializeCombat = async () => {
    try {
      setIsLoading(true);
      
      // Use demo enemies if combat state isn't available
      const demoEnemies = enemies.slice(0, 2);
      
      if (currentCharacter) {
        setCharacterState({
          ...currentCharacter,
          hp: currentCharacter.hp,
          sanity: sanityMeter,
          atb: 0
        });
      }
      
      setEnemyStates(demoEnemies.map(enemy => ({
        ...enemy,
        hp: enemy.hp,
        atb: 0
      })));
      
      addToCombatLog("Combat begins! The air grows thick with eldritch energy...");
      
      if (sanityMeter < 50) {
        addToCombatLog("Your sanity is low - the horrors seem more real than ever!");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize combat:", error);
      setIsLoading(false);
    }
  };

  const addToCombatLog = (message) => {
    setCombatLog(prev => [...prev, { message, timestamp: Date.now() }]);
  };

  const executePlayerAction = (action) => {
    setPlayerAction(action);
    setTurnPhase("executing");
    
    let damage = 0;
    let sanityLoss = 0;
    let selfDamage = 0;
    
    switch (action) {
      case "lucky_shot":
        damage = Math.floor(Math.random() * 999) + 1;
        addToCombatLog(`${characterState.name} fires a Lucky Shot for ${damage} damage!`);
        break;
      case "blood_magic":
        damage = 75;
        selfDamage = 25;
        addToCombatLog(`${characterState.name} casts Blood Magic, sacrificing 25 HP for 75 damage!`);
        break;
      case "analyze":
        addToCombatLog(`${characterState.name} analyzes the enemy, revealing weaknesses!`);
        break;
      case "dagons_embrace":
        const healAmount = Math.floor(characterState.hp * 0.5);
        setCharacterState(prev => ({...prev, hp: Math.min(prev.hp + healAmount, currentCharacter.max_hp)}));
        sanityLoss = 10;
        addToCombatLog(`${characterState.name} heals for ${healAmount} HP but loses 10 sanity!`);
        break;
      case "pact_cthulhu":
        if (pactAvailable) {
          damage = 200;
          selfDamage = 50;
          sanityLoss = 30;
          setPactAvailable(false);
          addToCombatLog(`${characterState.name} forms a pact with Cthulhu! Massive damage but at terrible cost!`);
        }
        break;
      default:
        damage = 30;
        addToCombatLog(`${characterState.name} attacks for ${damage} damage!`);
    }
    
    // Apply damage to random enemy
    if (damage > 0) {
      setEnemyStates(prev => {
        const newStates = [...prev];
        const aliveEnemies = newStates.filter(e => e.hp > 0);
        if (aliveEnemies.length > 0) {
          const targetIndex = newStates.findIndex(e => e.id === aliveEnemies[0].id);
          newStates[targetIndex] = {
            ...newStates[targetIndex],
            hp: Math.max(0, newStates[targetIndex].hp - damage)
          };
          
          if (newStates[targetIndex].hp === 0) {
            addToCombatLog(`${newStates[targetIndex].name} is defeated!`);
          }
        }
        return newStates;
      });
    }
    
    // Apply self damage
    if (selfDamage > 0) {
      setCharacterState(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - selfDamage)
      }));
    }
    
    // Apply sanity loss
    if (sanityLoss > 0) {
      updateSanity(-sanityLoss);
    }
    
    // Check victory condition
    setTimeout(() => {
      if (enemyStates.every(e => e.hp <= 0)) {
        addToCombatLog("Victory! The horrors retreat... for now.");
        setTimeout(() => onVictory(), 2000);
        return;
      }
      
      // Enemy turn
      setTurnPhase("enemy_turn");
      executeEnemyTurn();
    }, 1500);
  };

  const executeEnemyTurn = () => {
    const aliveEnemies = enemyStates.filter(e => e.hp > 0);
    
    if (aliveEnemies.length === 0) {
      onVictory();
      return;
    }
    
    aliveEnemies.forEach((enemy, index) => {
      setTimeout(() => {
        const abilities = enemy.abilities || ["Attack"];
        const randomAbility = abilities[Math.floor(Math.random() * abilities.length)];
        
        let damage = 0;
        let sanityDamage = 0;
        
        switch (randomAbility) {
          case "Dark Chant":
            sanityDamage = 15;
            addToCombatLog(`${enemy.name} chants in an ancient tongue! You lose 15 sanity!`);
            break;
          case "Tentacle Lash":
            damage = 35;
            sanityDamage = 10;
            addToCombatLog(`${enemy.name} lashes out with tentacles for ${damage} damage!`);
            break;
          case "Mind Rend":
            sanityDamage = 25;
            addToCombatLog(`${enemy.name} assaults your mind directly! You lose 25 sanity!`);
            break;
          case "Forbidden Knowledge":
            sanityDamage = 20;
            addToCombatLog(`${enemy.name} whispers forbidden truths! Your sanity crumbles!`);
            break;
          default:
            damage = 25;
            addToCombatLog(`${enemy.name} attacks for ${damage} damage!`);
        }
        
        // Apply damage
        if (damage > 0) {
          setCharacterState(prev => ({
            ...prev,
            hp: Math.max(0, prev.hp - damage)
          }));
        }
        
        // Apply sanity damage
        if (sanityDamage > 0) {
          updateSanity(-sanityDamage);
        }
        
        // Check defeat condition
        if (characterState && characterState.hp <= 0) {
          addToCombatLog("You have been defeated by the cosmic horrors...");
          setTimeout(() => onGameOver(), 2000);
          return;
        }
        
        // End enemy turn
        if (index === aliveEnemies.length - 1) {
          setTimeout(() => {
            setTurnPhase("select_action");
            setCurrentTurn(prev => prev + 1);
          }, 1000);
        }
      }, index * 1000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Entering Combat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Combat Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-serif text-purple-200 text-center mb-2">
            Cosmic Horror Combat
          </h1>
          <p className="text-center text-purple-400">
            Turn {currentTurn + 1} - {turnPhase === "select_action" ? "Your Turn" : turnPhase === "executing" ? "Executing..." : "Enemy Turn"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Section */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">
                {characterState?.name || "Your Character"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {characterState?.sprite_image && (
                <div className="w-24 h-24 mx-auto bg-gray-800 rounded-lg border-2 border-purple-600 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`data:image/png;base64,${characterState.sprite_image}`}
                    alt={characterState.name}
                    className="w-full h-full object-cover pixel-art"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">HP:</span>
                  <span className="text-red-300">{characterState?.hp || 0}/{currentCharacter?.max_hp || 100}</span>
                </div>
                <Progress 
                  value={characterState ? (characterState.hp / currentCharacter.max_hp) * 100 : 0} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-sm">
                  <span className="text-blue-300">Sanity:</span>
                  <span className="text-blue-300">{sanityMeter}/100</span>
                </div>
                <Progress 
                  value={sanityMeter} 
                  className="h-2"
                />
              </div>
              
              {/* Action Buttons */}
              {turnPhase === "select_action" && (
                <div className="space-y-2">
                  <h3 className="text-purple-300 font-semibold">Actions:</h3>
                  
                  {currentCharacter?.abilities?.map((ability, index) => {
                    const abilityActions = {
                      "Lucky Shot": "lucky_shot",
                      "Blood Magic": "blood_magic", 
                      "Analyze": "analyze",
                      "Dagon's Embrace": "dagons_embrace"
                    };
                    
                    const actionKey = abilityActions[ability] || "attack";
                    
                    return (
                      <Button
                        key={index}
                        onClick={() => executePlayerAction(actionKey)}
                        className="w-full bg-purple-900 hover:bg-purple-800 text-purple-100 border border-purple-700 text-sm"
                      >
                        {ability}
                      </Button>
                    );
                  })}
                  
                  {/* Pact Abilities */}
                  {pactAvailable && (
                    <div className="border-t border-purple-800/30 pt-2">
                      <Button
                        onClick={() => executePlayerAction("pact_cthulhu")}
                        className="w-full bg-red-900 hover:bg-red-800 text-red-100 border border-red-700 text-sm"
                      >
                        🐙 Pact with Cthulhu
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Combat Log */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">Combat Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto space-y-2 bg-gray-900/50 p-3 rounded border border-purple-800/30">
                {combatLog.map((entry, index) => (
                  <div key={index} className="text-purple-300 text-sm">
                    {entry.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enemies Section */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">Enemies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enemyStates.map((enemy, index) => (
                <div key={index} className="border border-purple-800/30 rounded-lg p-3 bg-gray-900/30">
                  <div className="flex items-center gap-3 mb-2">
                    {enemy.sprite_image && (
                      <div className="w-12 h-12 bg-gray-800 rounded border border-red-600 flex items-center justify-center overflow-hidden">
                        <img 
                          src={`data:image/png;base64,${enemy.sprite_image}`}
                          alt={enemy.name}
                          className="w-full h-full object-cover pixel-art"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-purple-200 font-semibold">{enemy.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-red-900/50 text-red-300"
                      >
                        {enemy.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-300">HP:</span>
                      <span className="text-red-300">{enemy.hp}/{enemy.max_hp}</span>
                    </div>
                    <Progress 
                      value={enemy.hp > 0 ? (enemy.hp / enemy.max_hp) * 100 : 0} 
                      className="h-1"
                    />
                  </div>
                  
                  {enemy.hp <= 0 && (
                    <Badge variant="destructive" className="mt-2">
                      Defeated
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
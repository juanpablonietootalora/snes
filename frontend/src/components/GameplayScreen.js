import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useGame } from "../contexts/GameContext";
import { useToast } from "../hooks/use-toast";

export const GameplayScreen = ({ onCombat, onStory }) => {
  const { 
    currentCharacter, 
    sanityMeter, 
    madnessLevel,
    updateSanity 
  } = useGame();
  
  const [playerPosition, setPlayerPosition] = useState({ x: 5, y: 5 });
  const [gameMap, setGameMap] = useState(null);
  const [interactables, setInteractables] = useState([]);
  const [currentArea, setCurrentArea] = useState("arkham_streets");
  const [inventory, setInventory] = useState([
    "Ancient Tome", "Silver Cross", "Ritual Candle", "Investigator's Notes"
  ]);
  const [gameLog, setGameLog] = useState([
    "You find yourself in the fog-shrouded streets of Arkham...",
    "The ancient cobblestones seem to whisper beneath your feet.",
    "Use WASD to move, SPACE to interact with objects."
  ]);
  
  const { toast } = useToast();

  // Game areas with pixel art representations
  const areas = {
    arkham_streets: {
      name: "Arkham Streets",
      width: 12,
      height: 8,
      tiles: [
        "############",
        "#..........#",
        "#..##......#",
        "#..##..L...#",
        "#......L...#",
        "#..C.......#",
        "#..........#",
        "############"
      ],
      description: "The fog-shrouded streets of Arkham. Gas lamps (L) flicker ominously.",
      interactables: [
        { x: 7, y: 3, type: "lamp", name: "Gas Lamp", action: "examine_lamp" },
        { x: 7, y: 4, type: "lamp", name: "Flickering Lamp", action: "examine_lamp" },
        { x: 3, y: 5, type: "cultist", name: "Suspicious Figure", action: "talk_cultist" }
      ]
    },
    library_entrance: {
      name: "Miskatonic Library",
      width: 10,
      height: 6,
      tiles: [
        "##########",
        "#........#",
        "#..DOOR..#",
        "#........#",
        "#..B..B..#",
        "##########"
      ],
      description: "The imposing entrance to Miskatonic University Library.",
      interactables: [
        { x: 5, y: 2, type: "door", name: "Library Door", action: "enter_library" },
        { x: 3, y: 4, type: "book", name: "Ancient Book", action: "examine_book" },
        { x: 6, y: 4, type: "book", name: "Forbidden Tome", action: "examine_book" }
      ]
    }
  };

  // Initialize game map
  useEffect(() => {
    const area = areas[currentArea];
    setGameMap(area);
    setInteractables(area.interactables);
  }, [currentArea]);

  // Keyboard controls
  const handleKeyPress = useCallback((event) => {
    if (!gameMap) return;
    
    const { key } = event;
    let newX = playerPosition.x;
    let newY = playerPosition.y;
    
    switch (key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        newY = Math.max(1, playerPosition.y - 1);
        break;
      case 's':
      case 'arrowdown':
        newY = Math.min(gameMap.height - 2, playerPosition.y + 1);
        break;
      case 'a':
      case 'arrowleft':
        newX = Math.max(1, playerPosition.x - 1);
        break;
      case 'd':
      case 'arrowright':
        newX = Math.min(gameMap.width - 2, playerPosition.x + 1);
        break;
      case ' ':
      case 'enter':
        handleInteraction();
        event.preventDefault();
        return;
      case 'escape':
        // Open menu or pause
        toast({
          title: "Game Paused",
          description: "Press ESC again to resume",
          variant: "default"
        });
        event.preventDefault();
        return;
      default:
        return;
    }
    
    // Check if position is valid (not a wall)
    if (gameMap.tiles[newY] && gameMap.tiles[newY][newX] !== '#') {
      setPlayerPosition({ x: newX, y: newY });
      
      // Add movement to game log occasionally
      if (Math.random() < 0.1) {
        const messages = [
          "Your footsteps echo in the misty streets...",
          "The shadows seem to shift as you move...",
          "A chill runs down your spine...",
          "You hear distant whispers in the fog..."
        ];
        addToGameLog(messages[Math.floor(Math.random() * messages.length)]);
      }
    }
    
    event.preventDefault();
  }, [playerPosition, gameMap, toast]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const addToGameLog = (message) => {
    setGameLog(prev => [...prev.slice(-10), message]); // Keep last 10 messages
  };

  const handleInteraction = () => {
    // Check if player is near any interactable
    const nearbyInteractable = interactables.find(item => 
      Math.abs(item.x - playerPosition.x) <= 1 && 
      Math.abs(item.y - playerPosition.y) <= 1
    );
    
    if (nearbyInteractable) {
      handleInteractionAction(nearbyInteractable);
    } else {
      addToGameLog("There's nothing to interact with here.");
    }
  };

  const handleInteractionAction = (interactable) => {
    switch (interactable.action) {
      case "examine_lamp":
        addToGameLog(`You examine the ${interactable.name}. The flame flickers unnaturally...`);
        updateSanity(-2);
        break;
      case "talk_cultist":
        addToGameLog("The figure whispers: 'The stars are almost right...' then vanishes!");
        updateSanity(-10);
        break;
      case "enter_library":
        addToGameLog("You push open the heavy library doors...");
        setCurrentArea("library_entrance");
        break;
      case "examine_book":
        addToGameLog(`You find a ${interactable.name}. Its pages contain forbidden knowledge!`);
        updateSanity(-5);
        setInventory(prev => [...prev, interactable.name]);
        break;
      default:
        addToGameLog(`You interact with ${interactable.name}.`);
    }
    
    toast({
      title: "Interaction",
      description: `Interacted with ${interactable.name}`,
      variant: "default"
    });
  };

  const renderGameMap = () => {
    if (!gameMap) return null;
    
    return (
      <div className="game-map bg-gray-900 p-4 rounded-lg border border-purple-800/30 font-mono text-sm">
        {gameMap.tiles.map((row, y) => (
          <div key={y} className="flex">
            {row.split('').map((tile, x) => {
              const isPlayer = playerPosition.x === x && playerPosition.y === y;
              const interactable = interactables.find(item => item.x === x && item.y === y);
              
              let tileChar = tile;
              let tileClass = "w-6 h-6 flex items-center justify-center ";
              
              if (isPlayer) {
                tileChar = "@";
                tileClass += "text-blue-400 bg-blue-900/50 animate-pulse";
              } else if (interactable) {
                switch (interactable.type) {
                  case "lamp":
                    tileChar = "🏮";
                    tileClass += "text-yellow-400";
                    break;
                  case "cultist":
                    tileChar = "👤";
                    tileClass += "text-red-400";
                    break;
                  case "door":
                    tileChar = "🚪";
                    tileClass += "text-brown-400";
                    break;
                  case "book":
                    tileChar = "📚";
                    tileClass += "text-purple-400";
                    break;
                  default:
                    tileChar = "?";
                    tileClass += "text-green-400";
                }
              } else {
                switch (tile) {
                  case '#':
                    tileChar = "█";
                    tileClass += "text-gray-600";
                    break;
                  case '.':
                    tileChar = "·";
                    tileClass += "text-gray-400";
                    break;
                  case 'L':
                    tileChar = "🕯️";
                    tileClass += "text-yellow-300";
                    break;
                  case 'C':
                    tileChar = "🗿";
                    tileClass += "text-gray-500";
                    break;
                  default:
                    tileClass += "text-gray-300";
                }
              }
              
              return (
                <span key={x} className={tileClass}>
                  {tileChar}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-serif text-purple-200 text-center mb-2">
            {gameMap?.name || "Loading..."}
          </h1>
          <p className="text-center text-purple-400">
            {gameMap?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character Status */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">
                {currentCharacter?.name || "Investigator"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentCharacter?.sprite_image && (
                <div className="w-24 h-24 mx-auto bg-gray-800 rounded-lg border-2 border-purple-600 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`data:image/png;base64,${currentCharacter.sprite_image}`}
                    alt={currentCharacter.name}
                    className="w-full h-full object-cover pixel-art"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-300">HP:</span>
                  <span className="text-red-300">{currentCharacter?.hp || 0}/{currentCharacter?.max_hp || 100}</span>
                </div>
                <Progress 
                  value={currentCharacter ? (currentCharacter.hp / currentCharacter.max_hp) * 100 : 0} 
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
              
              {madnessLevel > 0 && (
                <Badge variant="destructive" className="bg-red-900 text-red-300">
                  Madness Level: {madnessLevel}
                </Badge>
              )}
              
              <div className="pt-2 border-t border-purple-800/30">
                <h3 className="text-purple-300 font-semibold mb-2">Inventory:</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {inventory.map((item, index) => (
                    <div key={index} className="text-xs text-purple-400 bg-gray-900/50 p-1 rounded">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Map */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">
                Exploration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderGameMap()}
              
              <div className="mt-4 text-center">
                <p className="text-purple-400 text-sm">
                  @ = You | 🏮 = Lamp | 👤 = NPC | 📚 = Book | 🚪 = Door
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Game Log & Controls */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">Game Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48 overflow-y-auto space-y-1 bg-gray-900/50 p-3 rounded border border-purple-800/30">
                {gameLog.map((entry, index) => (
                  <div key={index} className="text-purple-300 text-sm">
                    {entry}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-purple-300 font-semibold">Controls:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-purple-400">WASD - Move</div>
                  <div className="text-purple-400">SPACE - Interact</div>
                  <div className="text-purple-400">ESC - Menu</div>
                  <div className="text-purple-400">Arrows - Move</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={onStory}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-blue-100 border border-blue-700"
                  size="sm"
                >
                  📖 Story Mode
                </Button>
                <Button
                  onClick={onCombat}
                  className="w-full bg-red-900 hover:bg-red-800 text-red-100 border border-red-700"
                  size="sm"
                >
                  ⚔️ Enter Combat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
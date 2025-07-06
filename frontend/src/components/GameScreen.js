import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useGame } from "../contexts/GameContext";
import { useToast } from "../hooks/use-toast";

export const GameScreen = ({ onCombat, onStory }) => {
  const { 
    currentCharacter, 
    party, 
    enemies, 
    sanityMeter, 
    madnessLevel,
    updateSanity 
  } = useGame();
  
  const [currentLocation, setCurrentLocation] = useState("arkham_streets");
  const [inventory, setInventory] = useState([
    "Ancient Tome", "Silver Cross", "Ritual Candle", "Investigator's Notes"
  ]);
  const [discoveries, setDiscoveries] = useState([]);
  const [ritualProgress, setRitualProgress] = useState(0);
  
  const { toast } = useToast();

  const locations = {
    arkham_streets: {
      name: "Arkham Streets",
      description: "The fog-shrouded streets of Arkham lie before you. Gas lamps flicker ominously in the mist, casting dancing shadows that seem to move independently.",
      actions: ["Investigate Alley", "Visit Library", "Check Newspaper", "Perform Ritual"],
      danger: "low"
    },
    miskatonic_library: {
      name: "Miskatonic University Library",
      description: "Towering shelves of ancient tomes stretch into the darkness. The air is thick with the scent of old parchment and something else... something wrong.",
      actions: ["Research Occult", "Find Hidden Section", "Examine Symbols", "Consult Librarian"],
      danger: "medium"
    },
    abandoned_warehouse: {
      name: "Abandoned Warehouse",
      description: "A decrepit warehouse on the docks. Strange symbols are carved into the walls, and the air hums with otherworldly energy.",
      actions: ["Investigate Ritual Circle", "Search Crates", "Examine Symbols", "Prepare Ambush"],
      danger: "high"
    }
  };

  const handleLocationAction = (action) => {
    let sanityChange = 0;
    let discoveryMade = false;
    
    switch (action) {
      case "Investigate Alley":
        const alleyResults = [
          "You find strange footprints that don't match any known animal...",
          "A homeless man whispers about 'the watchers in the walls'...",
          "You discover a piece of torn fabric with unusual symbols..."
        ];
        const alleyResult = alleyResults[Math.floor(Math.random() * alleyResults.length)];
        toast({
          title: "Investigation Result",
          description: alleyResult,
          variant: "default"
        });
        sanityChange = -2;
        break;
        
      case "Research Occult":
        const researchResults = [
          "You uncover references to the 'Sleeping God' in multiple texts...",
          "Ancient diagrams show ritual circles similar to those found in the warehouse...",
          "A passage mentions 'the convergence when stars align'..."
        ];
        const researchResult = researchResults[Math.floor(Math.random() * researchResults.length)];
        toast({
          title: "Research Discovery",
          description: researchResult,
          variant: "default"
        });
        sanityChange = -5;
        discoveryMade = true;
        break;
        
      case "Investigate Ritual Circle":
        toast({
          title: "Ritual Circle",
          description: "The circle pulses with malevolent energy. You can feel it calling to something beyond the veil...",
          variant: "destructive"
        });
        sanityChange = -10;
        setRitualProgress(prev => prev + 20);
        break;
        
      case "Perform Ritual":
        if (inventory.includes("Ritual Candle") && inventory.includes("Ancient Tome")) {
          toast({
            title: "Ritual Performed",
            description: "The candle flickers as you recite the ancient words. Reality seems to bend around you...",
            variant: "default"
          });
          sanityChange = -15;
          setRitualProgress(prev => prev + 30);
        } else {
          toast({
            title: "Missing Components",
            description: "You need a Ritual Candle and Ancient Tome to perform the ritual.",
            variant: "destructive"
          });
        }
        break;
        
      default:
        toast({
          title: "Action Taken",
          description: `You ${action.toLowerCase()}. The shadows seem to watch your every move...`,
          variant: "default"
        });
        sanityChange = Math.floor(Math.random() * 5) - 2;
    }
    
    if (sanityChange !== 0) {
      updateSanity(sanityChange);
    }
    
    if (discoveryMade) {
      const newDiscovery = `Discovery ${discoveries.length + 1}: ${action}`;
      setDiscoveries(prev => [...prev, newDiscovery]);
    }
    
    // Check for random events
    if (Math.random() < 0.3) {
      triggerRandomEvent();
    }
  };

  const triggerRandomEvent = () => {
    const events = [
      {
        title: "Strange Whispers",
        description: "You hear whispers in a language that predates humanity...",
        sanityLoss: -5
      },
      {
        title: "Shadowy Figure",
        description: "A figure in the corner of your vision disappears when you look directly at it...",
        sanityLoss: -3
      },
      {
        title: "Eldritch Insight",
        description: "A sudden flash of cosmic knowledge floods your mind...",
        sanityLoss: -8
      },
      {
        title: "Protective Ward",
        description: "You find a protective symbol that eases your troubled mind...",
        sanityLoss: 5
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    
    toast({
      title: event.title,
      description: event.description,
      variant: event.sanityLoss > 0 ? "default" : "destructive"
    });
    
    updateSanity(event.sanityLoss);
  };

  const currentLocationData = locations[currentLocation];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-serif text-purple-200 text-center mb-2">
            Exploring the Shadows
          </h1>
          <p className="text-center text-purple-400">
            Navigate the eldritch mysteries of Arkham
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
                <p className="text-xs text-purple-400 italic">
                  "{currentCharacter?.dark_secret || "A dark secret weighs heavily on your mind..."}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location & Actions */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">
                {currentLocationData.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-purple-300 text-sm leading-relaxed">
                {currentLocationData.description}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${
                    currentLocationData.danger === "low" ? "bg-green-900/50 text-green-300" :
                    currentLocationData.danger === "medium" ? "bg-yellow-900/50 text-yellow-300" :
                    "bg-red-900/50 text-red-300"
                  }`}
                >
                  Danger: {currentLocationData.danger}
                </Badge>
                
                {ritualProgress > 0 && (
                  <Badge className="bg-purple-900/50 text-purple-300">
                    Ritual Progress: {ritualProgress}%
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-purple-300 font-semibold">Available Actions:</h3>
                {currentLocationData.actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={() => handleLocationAction(action)}
                    className="w-full bg-purple-900 hover:bg-purple-800 text-purple-100 border border-purple-700 text-sm justify-start"
                  >
                    {action}
                  </Button>
                ))}
              </div>
              
              <div className="pt-2 border-t border-purple-800/30">
                <h3 className="text-purple-300 font-semibold mb-2">Travel To:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(locations).map(([key, location]) => (
                    <Button
                      key={key}
                      onClick={() => setCurrentLocation(key)}
                      disabled={currentLocation === key}
                      variant="outline"
                      className="text-sm bg-gray-900/50 border-purple-700 hover:bg-purple-900/30"
                    >
                      {location.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Information */}
          <Card className="bg-black/80 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif">Game Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
                  <TabsTrigger value="inventory" className="text-purple-300">Inventory</TabsTrigger>
                  <TabsTrigger value="discoveries" className="text-purple-300">Discoveries</TabsTrigger>
                  <TabsTrigger value="enemies" className="text-purple-300">Enemies</TabsTrigger>
                </TabsList>
                
                <TabsContent value="inventory" className="space-y-2">
                  <div className="max-h-40 overflow-y-auto">
                    {inventory.map((item, index) => (
                      <div key={index} className="bg-gray-900/50 p-2 rounded border border-purple-800/30">
                        <span className="text-purple-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="discoveries" className="space-y-2">
                  <div className="max-h-40 overflow-y-auto">
                    {discoveries.length > 0 ? (
                      discoveries.map((discovery, index) => (
                        <div key={index} className="bg-gray-900/50 p-2 rounded border border-purple-800/30">
                          <span className="text-purple-300 text-sm">{discovery}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-purple-400 text-sm italic">No discoveries yet...</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="enemies" className="space-y-2">
                  <div className="max-h-40 overflow-y-auto">
                    {enemies.slice(0, 3).map((enemy, index) => (
                      <div key={index} className="bg-gray-900/50 p-2 rounded border border-purple-800/30">
                        <div className="flex items-center gap-2">
                          {enemy.sprite_image && (
                            <div className="w-8 h-8 bg-gray-800 rounded border border-red-600 flex items-center justify-center overflow-hidden">
                              <img 
                                src={`data:image/png;base64,${enemy.sprite_image}`}
                                alt={enemy.name}
                                className="w-full h-full object-cover pixel-art"
                              />
                            </div>
                          )}
                          <span className="text-purple-300 text-sm">{enemy.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={onStory}
            className="bg-blue-900 hover:bg-blue-800 text-blue-100 border border-blue-700"
          >
            📖 Return to Story
          </Button>
          <Button
            onClick={onCombat}
            className="bg-red-900 hover:bg-red-800 text-red-100 border border-red-700"
          >
            ⚔️ Enter Combat
          </Button>
        </div>
      </div>
    </div>
  );
};
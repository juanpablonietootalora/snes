import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useGame } from "../contexts/GameContext";
import { useToast } from "../hooks/use-toast";
import { CharacterPortraits } from "./CharacterPortraits";

const CHARACTER_CLASSES = [
  {
    id: "detective",
    name: "Detective",
    description: "A hardened investigator with a dark secret",
    darkSecret: "Bears a Shoggoth's eye that grants vision but ages him rapidly",
    stats: { hp: 90, sanity: 100, strength: 7, intelligence: 8, will: 6 },
    abilities: ["Lucky Shot", "Investigate", "Sixth Sense"],
    color: "bg-amber-900",
    accent: "border-amber-600"
  },
  {
    id: "witch",
    name: "Witch",
    description: "A practitioner of blood magic and forbidden arts",
    darkSecret: "Her spells cost HP as they require blood sacrifice",
    stats: { hp: 70, sanity: 80, strength: 5, intelligence: 9, will: 8 },
    abilities: ["Blood Magic", "Hex", "Eldritch Blast"],
    color: "bg-purple-900",
    accent: "border-purple-600"
  },
  {
    id: "scientist",
    name: "Scientist",
    description: "A researcher touched by cosmic knowledge",
    darkSecret: "Her body mutates from Nyarlathotep's experiments",
    stats: { hp: 80, sanity: 90, strength: 6, intelligence: 10, will: 5 },
    abilities: ["Analyze", "Alchemical Bomb", "Mutation"],
    color: "bg-green-900",
    accent: "border-green-600"
  },
  {
    id: "healer",
    name: "Healer",
    description: "A corrupted medical practitioner",
    darkSecret: "His cures spread Yog-Sothoth's plagues",
    stats: { hp: 85, sanity: 95, strength: 5, intelligence: 7, will: 9 },
    abilities: ["Dagon's Embrace", "Purify", "Plague Touch"],
    color: "bg-red-900",
    accent: "border-red-600"
  }
];

export const CharacterCreation = ({ onComplete }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [characterName, setCharacterName] = useState("");
  const [abilities, setAbilities] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createdCharacter, setCreatedCharacter] = useState(null);
  
  const { createCharacter, getCharacterAbilities } = useGame();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedClass) {
      loadAbilities(selectedClass.id);
    }
  }, [selectedClass]);

  const loadAbilities = async (classId) => {
    try {
      const abilityList = await getCharacterAbilities(classId);
      setAbilities(abilityList);
    } catch (error) {
      console.error("Failed to load abilities:", error);
    }
  };

  const handleCreateCharacter = async () => {
    if (!characterName.trim() || !selectedClass) {
      toast({
        title: "Invalid Input",
        description: "Please enter a name and select a class",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const character = await createCharacter(characterName, selectedClass.id);
      setCreatedCharacter(character);
      
      toast({
        title: "Character Created!",
        description: `${character.name} the ${selectedClass.name} has been created.`,
        variant: "default"
      });
      
      // Auto-advance after a short delay
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create character. Please try again.",
        variant: "destructive"
      });
      console.error("Character creation failed:", error);
    } finally {
      setCreating(false);
    }
  };

  if (createdCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-black/80 backdrop-blur-sm border-purple-800/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-serif text-purple-200">
              Character Created!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 w-32 h-32 bg-gray-800 rounded-lg border-2 border-purple-600 flex items-center justify-center overflow-hidden">
                {createdCharacter.sprite_image ? (
                  <img 
                    src={`data:image/png;base64,${createdCharacter.sprite_image}`}
                    alt={createdCharacter.name}
                    className="w-full h-full object-cover pixel-art"
                  />
                ) : (
                  <div className="text-purple-400 text-xs text-center">
                    {CharacterPortraits[selectedClass.id]}
                    <br />Character Sprite
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-purple-200 mb-2">
                {createdCharacter.name}
              </h2>
              <p className="text-purple-400 mb-4">
                The {selectedClass.name}
              </p>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-800/30">
                <p className="text-sm text-purple-300 italic">
                  "{createdCharacter.dark_secret}"
                </p>
              </div>
            </div>
            
            <div className="text-center text-purple-400">
              <p>Entering the shadows of Arkham...</p>
              <div className="animate-pulse mt-2">●●●</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-purple-200 mb-2">
            Choose Your Investigator
          </h1>
          <p className="text-purple-400 text-lg">
            Each carries a burden that may doom them... or save humanity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {CHARACTER_CLASSES.map((charClass) => (
            <Card 
              key={charClass.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedClass?.id === charClass.id 
                  ? `${charClass.color} border-2 ${charClass.accent} shadow-lg shadow-purple-500/50` 
                  : 'bg-black/60 border-gray-700 hover:border-purple-600'
              }`}
              onClick={() => setSelectedClass(charClass)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center mb-2">
                  <div className="mb-2">
                    {CharacterPortraits[charClass.id]}
                  </div>
                  <CardTitle className="text-xl text-purple-200 font-serif">
                    {charClass.name}
                  </CardTitle>
                </div>
                <p className="text-sm text-purple-400 text-center">
                  {charClass.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-purple-300">
                    HP: <span className="text-red-400">{charClass.stats.hp}</span>
                  </div>
                  <div className="text-purple-300">
                    Sanity: <span className="text-blue-400">{charClass.stats.sanity}</span>
                  </div>
                  <div className="text-purple-300">
                    STR: <span className="text-orange-400">{charClass.stats.strength}</span>
                  </div>
                  <div className="text-purple-300">
                    INT: <span className="text-green-400">{charClass.stats.intelligence}</span>
                  </div>
                </div>
                
                <Separator className="bg-purple-800/30" />
                
                <div className="space-y-2">
                  <p className="text-xs text-purple-300 font-semibold">Abilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {charClass.abilities.map((ability, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-purple-900/50 text-purple-300 border-purple-700"
                      >
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedClass && (
          <Card className="bg-black/80 backdrop-blur-sm border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-200 font-serif">
                {selectedClass.name} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-red-800/30">
                <p className="text-sm text-red-300 font-semibold mb-2">Dark Secret:</p>
                <p className="text-red-400 italic">"{selectedClass.darkSecret}"</p>
              </div>
              
              {abilities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-purple-300 font-semibold">Abilities:</p>
                  <div className="space-y-1">
                    {abilities.map((ability, index) => (
                      <div key={index} className="text-sm text-purple-400 bg-purple-900/20 p-2 rounded">
                        {ability}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-300 text-sm font-medium mb-2">
                    Character Name
                  </label>
                  <Input
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter your character's name..."
                    className="bg-gray-900/50 border-purple-800/50 text-purple-200 placeholder-purple-400"
                    maxLength={30}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateCharacter}
                  disabled={!characterName.trim() || creating}
                  className="w-full bg-purple-900 hover:bg-purple-800 text-purple-100 border border-purple-700"
                  size="lg"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
                      Creating Character...
                    </div>
                  ) : (
                    "Create Character"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
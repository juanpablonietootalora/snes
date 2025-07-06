import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useGame } from "../contexts/GameContext";
import { useToast } from "../hooks/use-toast";

export const StoryScreen = ({ onCombat, onGameScreen }) => {
  const { 
    storyScenes, 
    currentScene, 
    currentCharacter, 
    updateSanity, 
    nextScene, 
    previousScene,
    sanityMeter,
    madnessLevel
  } = useGame();
  
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const { toast } = useToast();

  const currentStoryScene = storyScenes[currentScene];

  useEffect(() => {
    if (currentStoryScene) {
      startTypingEffect();
    }
  }, [currentScene, currentStoryScene]);

  const startTypingEffect = () => {
    setDisplayedText("");
    setTextIndex(0);
    setDialogueIndex(0);
    setShowChoices(false);
    setIsTyping(true);
    
    if (currentStoryScene.description) {
      typeText(currentStoryScene.description, 0);
    }
  };

  const typeText = (text, index) => {
    if (index < text.length) {
      setDisplayedText(prev => prev + text[index]);
      setTextIndex(index + 1);
      setTimeout(() => typeText(text, index + 1), 50);
    } else {
      setIsTyping(false);
      // Start dialogue after description
      if (currentStoryScene.dialogue && currentStoryScene.dialogue.length > 0) {
        setTimeout(() => {
          setDialogueIndex(0);
          showNextDialogue();
        }, 1000);
      } else {
        setTimeout(() => setShowChoices(true), 500);
      }
    }
  };

  const showNextDialogue = () => {
    if (dialogueIndex < currentStoryScene.dialogue.length) {
      // Show dialogue with typing effect or immediately
      setTimeout(() => {
        setDialogueIndex(dialogueIndex + 1);
        if (dialogueIndex + 1 < currentStoryScene.dialogue.length) {
          setTimeout(() => showNextDialogue(), 2000);
        } else {
          setTimeout(() => setShowChoices(true), 1000);
        }
      }, 100);
    }
  };

  const handleChoice = (choice) => {
    // Apply sanity effects based on choice
    const sanityEffects = {
      "enter_library": -5,
      "examine_victims": -10,
      "seek_knowledge": -15,
      "main_entrance": -3,
      "back_entrance": -2,
      "examine_symbols": -8
    };

    const sanityChange = sanityEffects[choice.action] || 0;
    if (sanityChange !== 0) {
      updateSanity(sanityChange);
      
      if (sanityChange < 0) {
        toast({
          title: "Sanity Lost",
          description: `The horror of your choice costs you ${Math.abs(sanityChange)} sanity.`,
          variant: "destructive"
        });
      }
    }

    // Handle different actions
    switch (choice.action) {
      case "enter_library":
      case "examine_victims":
      case "seek_knowledge":
      case "main_entrance":
      case "back_entrance":
      case "examine_symbols":
        if (currentScene < storyScenes.length - 1) {
          nextScene();
        } else {
          // End of story, go to combat
          onCombat();
        }
        break;
      case "start_combat":
        onCombat();
        break;
      case "explore_world":
        onGameScreen();
        break;
      default:
        break;
    }
  };

  const skipText = () => {
    if (isTyping) {
      setDisplayedText(currentStoryScene.description);
      setTextIndex(currentStoryScene.description.length);
      setIsTyping(false);
      setDialogueIndex(currentStoryScene.dialogue.length);
      setShowChoices(true);
    }
  };

  if (!currentStoryScene) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-purple-400">Loading story...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Background Image */}
        {currentStoryScene.background_image && (
          <div className="fixed inset-0 opacity-20 z-0">
            <img 
              src={`data:image/png;base64,${currentStoryScene.background_image}`}
              alt="Scene background"
              className="w-full h-full object-cover pixel-art"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          </div>
        )}

        {/* Story Content */}
        <div className="relative z-10">
          <Card className="bg-black/90 backdrop-blur-sm border-purple-800/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-serif text-purple-200 text-center">
                {currentStoryScene.title}
              </CardTitle>
              
              {/* Sanity & Character Status */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                  {currentCharacter && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded border border-purple-600 flex items-center justify-center">
                        {currentCharacter.sprite_image && (
                          <img 
                            src={`data:image/png;base64,${currentCharacter.sprite_image}`}
                            alt={currentCharacter.name}
                            className="w-full h-full object-cover pixel-art"
                          />
                        )}
                      </div>
                      <span className="text-purple-300 text-sm font-medium">
                        {currentCharacter.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 text-sm">Sanity:</span>
                    <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          sanityMeter > 50 ? 'bg-blue-500' : 
                          sanityMeter > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sanityMeter}%` }}
                      />
                    </div>
                    <span className="text-blue-300 text-sm">{sanityMeter}/100</span>
                  </div>
                  
                  {madnessLevel > 0 && (
                    <Badge variant="destructive" className="bg-red-900 text-red-300">
                      Madness Lv.{madnessLevel}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Story Description */}
              <div className="bg-gray-900/50 p-6 rounded-lg border border-purple-800/30">
                <p className="text-purple-200 text-lg leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
                
                {isTyping && (
                  <Button 
                    onClick={skipText}
                    variant="ghost" 
                    className="mt-4 text-purple-400 hover:text-purple-300"
                    size="sm"
                  >
                    Skip Text
                  </Button>
                )}
              </div>
              
              {/* Dialogue */}
              {dialogueIndex > 0 && (
                <div className="space-y-3">
                  {currentStoryScene.dialogue.slice(0, dialogueIndex).map((line, index) => (
                    <div key={index} className="bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-600">
                      <p className="text-purple-300 italic">{line}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Choices */}
              {showChoices && currentStoryScene.choices && (
                <div className="space-y-4">
                  <h3 className="text-xl font-serif text-purple-200 border-b border-purple-800/30 pb-2">
                    What do you choose?
                  </h3>
                  
                  <div className="grid gap-3">
                    {currentStoryScene.choices.map((choice, index) => (
                      <Button
                        key={index}
                        onClick={() => handleChoice(choice)}
                        variant="outline"
                        className="justify-start text-left p-4 h-auto bg-gray-900/50 border-purple-700 hover:bg-purple-900/30 hover:border-purple-600"
                      >
                        <div>
                          <div className="text-purple-200 font-medium">
                            {choice.text}
                          </div>
                          {choice.sanity_cost && (
                            <div className="text-red-400 text-sm mt-1">
                              Sanity Cost: {choice.sanity_cost}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Special Demo Actions */}
                  <div className="pt-4 border-t border-purple-800/30">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleChoice({action: "start_combat", text: "Face the Horror"})}
                        className="bg-red-900 hover:bg-red-800 text-red-100 border border-red-700"
                      >
                        🗡️ Enter Combat
                      </Button>
                      <Button
                        onClick={() => handleChoice({action: "explore_world", text: "Explore"})}
                        className="bg-green-900 hover:bg-green-800 text-green-100 border border-green-700"
                      >
                        🌍 Explore World
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={previousScene}
              disabled={currentScene === 0}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300"
            >
              ← Previous Scene
            </Button>
            
            <div className="flex items-center gap-2">
              {storyScenes.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentScene ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={nextScene}
              disabled={currentScene >= storyScenes.length - 1}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300"
            >
              Next Scene →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
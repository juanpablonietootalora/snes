import asyncio
from typing import List, Optional
from .models import GameCharacter, Enemy, GameState, CombatState, StoryScene, CharacterClass
from .image_service import ImageService
import logging

logger = logging.getLogger(__name__)

class GameService:
    def __init__(self):
        self.image_service = ImageService()
        self.story_scenes = self._initialize_story_scenes()
        self.enemies = self._initialize_enemies()
    
    def _initialize_story_scenes(self) -> List[StoryScene]:
        """Initialize the story scenes for the demo"""
        return [
            StoryScene(
                title="The Whispering Shadows",
                description="Arkham, 1928. Strange disappearances plague the city. Four unlikely allies gather in the shadows of the old library, each harboring dark secrets that may be the key to stopping an ancient evil from awakening.",
                dialogue=[
                    "Detective Murphy: 'The missing persons reports... they all mention the same thing. Whispers in the dark.'",
                    "Witch Morgana: 'The old ones stir. I can feel their presence growing stronger.'",
                    "Dr. Eliza Cross: 'My experiments have shown unusual cellular mutations in the victims.'",
                    "Healer Marcus: 'The plague spreads not through flesh, but through the soul itself.'"
                ],
                choices=[
                    {"text": "Investigate the library", "action": "enter_library"},
                    {"text": "Examine the victims", "action": "examine_victims"},
                    {"text": "Seek ancient knowledge", "action": "seek_knowledge"}
                ],
                scene_type="story"
            ),
            StoryScene(
                title="The Cursed Library",
                description="The Miskatonic University library stands before you, its gothic architecture shrouded in an unnatural mist. The air itself seems to whisper forbidden secrets.",
                dialogue=[
                    "As you approach the library, the temperature drops suddenly.",
                    "Ancient symbols begin to glow faintly on the stone walls.",
                    "You hear chanting from within... but the library was supposed to be empty."
                ],
                choices=[
                    {"text": "Enter through the main door", "action": "main_entrance"},
                    {"text": "Find a back entrance", "action": "back_entrance"},
                    {"text": "Investigate the glowing symbols", "action": "examine_symbols"}
                ],
                scene_type="story"
            )
        ]
    
    def _initialize_enemies(self) -> List[Enemy]:
        """Initialize demo enemies"""
        return [
            Enemy(
                name="Masked Cultist",
                type="cultist",
                hp=45,
                max_hp=45,
                sanity_damage=10,
                abilities=["Dark Chant", "Ritual Blade"],
                description="A hooded figure wearing a fish-like mask, wielding ancient daggers inscribed with blasphemous runes."
            ),
            Enemy(
                name="Shoggoth Spawn",
                type="cosmic_horror",
                hp=80,
                max_hp=80,
                sanity_damage=25,
                abilities=["Tentacle Lash", "Mind Rend", "Shapeshift"],
                description="A writhing mass of eyes and tentacles, defying all natural law and reason."
            ),
            Enemy(
                name="The Whispering Librarian",
                type="boss",
                hp=150,
                max_hp=150,
                sanity_damage=35,
                abilities=["Forbidden Knowledge", "Reality Tear", "Summon Shadows"],
                description="Once the head librarian, now transformed into something that should not exist, speaking truths that shatter minds."
            )
        ]
    
    async def create_character(self, name: str, character_class: CharacterClass) -> GameCharacter:
        """Create a new character with generated sprite"""
        
        # Define character-specific attributes
        character_data = {
            CharacterClass.DETECTIVE: {
                "dark_secret": "Bears a Shoggoth's eye that grants vision but ages him rapidly",
                "abilities": ["Lucky Shot", "Investigate", "Sixth Sense"],
                "hp": 90,
                "max_hp": 90
            },
            CharacterClass.WITCH: {
                "dark_secret": "Her spells cost HP as they require blood sacrifice",
                "abilities": ["Blood Magic", "Hex", "Eldritch Blast"],
                "hp": 70,
                "max_hp": 70
            },
            CharacterClass.SCIENTIST: {
                "dark_secret": "Her body mutates from Nyarlathotep's experiments",
                "abilities": ["Analyze", "Alchemical Bomb", "Mutation"],
                "hp": 80,
                "max_hp": 80
            },
            CharacterClass.HEALER: {
                "dark_secret": "His cures spread Yog-Sothoth's plagues",
                "abilities": ["Dagon's Embrace", "Purify", "Plague Touch"],
                "hp": 85,
                "max_hp": 85
            }
        }
        
        char_info = character_data[character_class]
        
        # Generate character sprite
        sprite_response = await self.image_service.generate_character_sprite(
            character_class.value, 
            name
        )
        
        character = GameCharacter(
            name=name,
            character_class=character_class,
            dark_secret=char_info["dark_secret"],
            abilities=char_info["abilities"],
            hp=char_info["hp"],
            max_hp=char_info["max_hp"],
            sprite_image=sprite_response.image_base64 if sprite_response.success else None
        )
        
        return character
    
    async def generate_enemy_sprites(self) -> List[Enemy]:
        """Generate sprites for all enemies"""
        updated_enemies = []
        
        for enemy in self.enemies:
            sprite_response = await self.image_service.generate_enemy_sprite(
                enemy.name, 
                enemy.type
            )
            
            enemy.sprite_image = sprite_response.image_base64 if sprite_response.success else None
            updated_enemies.append(enemy)
        
        return updated_enemies
    
    async def generate_scene_backgrounds(self) -> List[StoryScene]:
        """Generate background images for story scenes"""
        updated_scenes = []
        
        for scene in self.story_scenes:
            if scene.title == "The Whispering Shadows":
                bg_response = await self.image_service.generate_background(
                    "Dark library exterior at night, gothic architecture, mysterious mist, 1920s Arkham setting"
                )
            elif scene.title == "The Cursed Library":
                bg_response = await self.image_service.generate_background(
                    "Ancient library interior, towering bookshelves, glowing occult symbols, eerie atmosphere"
                )
            else:
                bg_response = await self.image_service.generate_background(
                    "Generic dark atmospheric scene, 1920s setting"
                )
            
            scene.background_image = bg_response.image_base64 if bg_response.success else None
            updated_scenes.append(scene)
        
        return updated_scenes
    
    def get_character_abilities(self, character_class: CharacterClass) -> List[str]:
        """Get abilities for a character class"""
        abilities = {
            CharacterClass.DETECTIVE: [
                "Lucky Shot - Random damage 1-999",
                "Investigate - Reveal enemy weaknesses", 
                "Sixth Sense - Detect hidden threats"
            ],
            CharacterClass.WITCH: [
                "Blood Magic - Powerful spells that cost HP",
                "Hex - Curse enemies with status effects",
                "Eldritch Blast - Dark energy attack"
            ],
            CharacterClass.SCIENTIST: [
                "Analyze - Study enemy patterns",
                "Alchemical Bomb - Area damage with poison",
                "Mutation - Transform body parts for combat"
            ],
            CharacterClass.HEALER: [
                "Dagon's Embrace - Heal 50% HP but lower Sanity resistance",
                "Purify - Remove curses and poison",
                "Plague Touch - Heal allies by damaging enemies"
            ]
        }
        return abilities.get(character_class, [])
    
    def calculate_combat_turn_order(self, party: List[GameCharacter], enemies: List[Enemy]) -> List[str]:
        """Calculate ATB-style turn order"""
        # Simple implementation - in real game this would be more complex
        all_combatants = []
        
        for char in party:
            all_combatants.append(("character", char.id))
        
        for enemy in enemies:
            all_combatants.append(("enemy", enemy.id))
        
        # Shuffle for demo purposes
        import random
        random.shuffle(all_combatants)
        
        return [f"{entity_type}:{entity_id}" for entity_type, entity_id in all_combatants]
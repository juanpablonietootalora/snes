from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum

class CharacterClass(str, Enum):
    DETECTIVE = "detective"
    WITCH = "witch"
    SCIENTIST = "scientist"
    HEALER = "healer"

class GameCharacter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    character_class: CharacterClass
    level: int = 1
    hp: int = 100
    max_hp: int = 100
    sanity: int = 100
    max_sanity: int = 100
    experience: int = 0
    abilities: List[str] = []
    dark_secret: str = ""
    sprite_image: Optional[str] = None  # base64 encoded
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Enemy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # "cultist", "cosmic_horror", "boss"
    hp: int
    max_hp: int
    sanity_damage: int = 0
    abilities: List[str] = []
    sprite_image: Optional[str] = None  # base64 encoded
    description: str = ""

class GameState(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: str
    current_scene: str = "character_creation"
    party: List[GameCharacter] = []
    current_story_progress: int = 0
    inventory: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CombatState(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_state_id: str
    party: List[GameCharacter]
    enemies: List[Enemy]
    current_turn: int = 0
    turn_order: List[str] = []  # character/enemy ids
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ImageGenerationRequest(BaseModel):
    prompt: str
    image_type: str  # "character", "enemy", "background", "ui_element"
    style_modifiers: Optional[str] = "16-bit pixel art SNES style, dark Lovecraftian palette with deep purples, sickly greens, and smoky blacks"

class ImageGenerationResponse(BaseModel):
    success: bool
    image_base64: Optional[str] = None
    error_message: Optional[str] = None

class StoryScene(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    dialogue: List[str] = []
    choices: List[Dict[str, Any]] = []
    background_image: Optional[str] = None  # base64 encoded
    scene_type: str = "story"  # "story", "combat", "puzzle"
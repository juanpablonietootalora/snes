from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import our game models and services
from .models import (
    GameCharacter, Enemy, GameState, CombatState, StoryScene, 
    CharacterClass, ImageGenerationRequest, ImageGenerationResponse
)
from .game_service import GameService
from .image_service import ImageService

# Initialize services lazily
game_service = None
image_service = None

def get_game_service():
    global game_service
    if game_service is None:
        game_service = GameService()
    return game_service

def get_image_service():
    global image_service
    if image_service is None:
        image_service = ImageService()
    return image_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models for API
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class CharacterCreateRequest(BaseModel):
    name: str
    character_class: CharacterClass

class GameStateResponse(BaseModel):
    game_state: GameState
    story_scenes: List[StoryScene]
    enemies: List[Enemy]

# Original endpoints
@api_router.get("/")
async def root():
    return {"message": "Welcome to the Lovecraftian Horror JRPG API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Game endpoints
@api_router.post("/character/create", response_model=GameCharacter)
async def create_character(request: CharacterCreateRequest):
    """Create a new character with generated sprite"""
    try:
        character = await get_game_service().create_character(
            request.name, 
            request.character_class
        )
        
        # Save to database
        await db.characters.insert_one(character.dict())
        
        return character
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/character/abilities/{character_class}")
async def get_character_abilities(character_class: CharacterClass):
    """Get abilities for a character class"""
    abilities = get_game_service().get_character_abilities(character_class)
    return {"character_class": character_class, "abilities": abilities}

@api_router.get("/game/initialize")
async def initialize_game():
    """Initialize the game with story scenes and enemies"""
    try:
        # Generate story scene backgrounds
        story_scenes = await get_game_service().generate_scene_backgrounds()
        
        # Generate enemy sprites
        enemies = await get_game_service().generate_enemy_sprites()
        
        # Create initial game state
        game_state = GameState(
            player_id="demo_player",
            current_scene="character_creation",
            party=[],
            current_story_progress=0,
            inventory=[]
        )
        
        # Save to database
        await db.game_states.insert_one(game_state.dict())
        
        return GameStateResponse(
            game_state=game_state,
            story_scenes=story_scenes,
            enemies=enemies
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/story/scenes")
async def get_story_scenes():
    """Get all story scenes"""
    try:
        scenes = await get_game_service().generate_scene_backgrounds()
        return {"scenes": scenes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/enemies")
async def get_enemies():
    """Get all enemies with sprites"""
    try:
        enemies = await get_game_service().generate_enemy_sprites()
        return {"enemies": enemies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/image/generate", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """Generate a custom image"""
    try:
        response = await get_image_service().generate_image(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/combat/start")
async def start_combat(game_state_id: str):
    """Start combat with demo enemies"""
    try:
        # Get game state
        game_state_doc = await db.game_states.find_one({"id": game_state_id})
        if not game_state_doc:
            raise HTTPException(status_code=404, detail="Game state not found")
        
        game_state = GameState(**game_state_doc)
        
        # Get enemies for combat
        enemies = await get_game_service().generate_enemy_sprites()
        # Use first two enemies for demo
        demo_enemies = enemies[:2]
        
        # Calculate turn order
        turn_order = get_game_service().calculate_combat_turn_order(game_state.party, demo_enemies)
        
        # Create combat state
        combat_state = CombatState(
            game_state_id=game_state_id,
            party=game_state.party,
            enemies=demo_enemies,
            turn_order=turn_order,
            current_turn=0,
            is_active=True
        )
        
        # Save to database
        await db.combat_states.insert_one(combat_state.dict())
        
        return combat_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

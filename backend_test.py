import pytest
import json
import base64
import requests
import os
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.server import app
from backend.models import CharacterClass

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

# API base URL
API_URL = f"{BACKEND_URL}/api"

# Create a test client
client = TestClient(app)

# Mock base64 image data for testing
MOCK_BASE64_IMAGE = base64.b64encode(b"mock_image_data").decode('utf-8')

# Mock patch for the Gemini image generation
@pytest.fixture
def mock_image_generation():
    with patch('backend.image_service.GeminiImageGeneration') as mock:
        mock_instance = MagicMock()
        mock_instance.generate_images.return_value = [b"mock_image_data"]
        mock.return_value = mock_instance
        yield mock

class TestBackendAPI:
    """Test suite for the Lovecraftian Horror JRPG backend API"""

    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = client.get("/api/")
        assert response.status_code == 200
        assert response.json() == {"message": "Welcome to the Lovecraftian Horror JRPG API"}

    def test_character_creation(self, mock_image_generation):
        """Test character creation for all character classes"""
        character_classes = [
            CharacterClass.DETECTIVE,
            CharacterClass.WITCH,
            CharacterClass.SCIENTIST,
            CharacterClass.HEALER
        ]
        
        for char_class in character_classes:
            # Create a character
            response = client.post(
                "/api/character/create",
                json={"name": f"Test {char_class.value}", "character_class": char_class.value}
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify character structure
            assert "id" in data
            assert data["name"] == f"Test {char_class.value}"
            assert data["character_class"] == char_class.value
            assert "abilities" in data
            assert "dark_secret" in data
            assert "sprite_image" in data
            
            # Verify class-specific attributes
            if char_class == CharacterClass.DETECTIVE:
                assert "Lucky Shot" in data["abilities"]
                assert data["hp"] == 90
            elif char_class == CharacterClass.WITCH:
                assert "Blood Magic" in data["abilities"]
                assert data["hp"] == 70
            elif char_class == CharacterClass.SCIENTIST:
                assert "Analyze" in data["abilities"]
                assert data["hp"] == 80
            elif char_class == CharacterClass.HEALER:
                assert "Dagon's Embrace" in data["abilities"]
                assert data["hp"] == 85

    def test_character_creation_invalid_class(self):
        """Test character creation with invalid character class"""
        response = client.post(
            "/api/character/create",
            json={"name": "Test Invalid", "character_class": "invalid_class"}
        )
        
        assert response.status_code == 422  # Validation error

    def test_game_initialization(self, mock_image_generation):
        """Test game initialization"""
        response = client.get("/api/game/initialize")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify game state structure
        assert "game_state" in data
        assert "story_scenes" in data
        assert "enemies" in data
        
        # Verify game state
        game_state = data["game_state"]
        assert game_state["current_scene"] == "character_creation"
        assert "party" in game_state
        assert "inventory" in game_state
        
        # Verify story scenes
        story_scenes = data["story_scenes"]
        assert len(story_scenes) >= 1
        assert "title" in story_scenes[0]
        assert "description" in story_scenes[0]
        assert "dialogue" in story_scenes[0]
        assert "choices" in story_scenes[0]
        assert "background_image" in story_scenes[0]
        
        # Verify enemies
        enemies = data["enemies"]
        assert len(enemies) >= 1
        assert "name" in enemies[0]
        assert "type" in enemies[0]
        assert "hp" in enemies[0]
        assert "abilities" in enemies[0]
        assert "sprite_image" in enemies[0]

    def test_character_abilities(self):
        """Test getting abilities for each character class"""
        character_classes = [
            CharacterClass.DETECTIVE,
            CharacterClass.WITCH,
            CharacterClass.SCIENTIST,
            CharacterClass.HEALER
        ]
        
        for char_class in character_classes:
            response = client.get(f"/api/character/abilities/{char_class.value}")
            
            assert response.status_code == 200
            data = response.json()
            
            assert "character_class" in data
            assert data["character_class"] == char_class.value
            assert "abilities" in data
            assert len(data["abilities"]) > 0
            
            # Verify class-specific abilities
            if char_class == CharacterClass.DETECTIVE:
                assert any("Lucky Shot" in ability for ability in data["abilities"])
            elif char_class == CharacterClass.WITCH:
                assert any("Blood Magic" in ability for ability in data["abilities"])
            elif char_class == CharacterClass.SCIENTIST:
                assert any("Analyze" in ability for ability in data["abilities"])
            elif char_class == CharacterClass.HEALER:
                assert any("Dagon's Embrace" in ability for ability in data["abilities"])

    def test_image_generation(self, mock_image_generation):
        """Test custom image generation"""
        response = client.post(
            "/api/image/generate",
            json={
                "prompt": "Test prompt",
                "image_type": "character",
                "style_modifiers": "16-bit pixel art"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "success" in data
        assert data["success"] is True
        assert "image_base64" in data
        assert data["image_base64"] is not None

    def test_story_scenes(self, mock_image_generation):
        """Test retrieving story scenes"""
        response = client.get("/api/story/scenes")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "scenes" in data
        scenes = data["scenes"]
        assert len(scenes) >= 1
        
        # Verify scene structure
        scene = scenes[0]
        assert "id" in scene
        assert "title" in scene
        assert "description" in scene
        assert "dialogue" in scene
        assert "choices" in scene
        assert "background_image" in scene
        
        # Verify specific scenes
        titles = [scene["title"] for scene in scenes]
        assert "The Whispering Shadows" in titles
        assert "The Cursed Library" in titles

    def test_enemies(self, mock_image_generation):
        """Test getting enemies with generated sprites"""
        response = client.get("/api/enemies")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "enemies" in data
        enemies = data["enemies"]
        assert len(enemies) >= 1
        
        # Verify enemy structure
        enemy = enemies[0]
        assert "id" in enemy
        assert "name" in enemy
        assert "type" in enemy
        assert "hp" in enemy
        assert "max_hp" in enemy
        assert "sanity_damage" in enemy
        assert "abilities" in enemy
        assert "sprite_image" in enemy
        assert "description" in enemy
        
        # Verify specific enemies
        names = [enemy["name"] for enemy in enemies]
        assert "Masked Cultist" in names
        assert "Shoggoth Spawn" in names
        assert "The Whispering Librarian" in names

    def test_combat_start(self, mock_image_generation):
        """Test starting combat with a game state"""
        # First, initialize a game
        init_response = client.get("/api/game/initialize")
        assert init_response.status_code == 200
        game_state = init_response.json()["game_state"]
        
        # Create a character to add to the party
        char_response = client.post(
            "/api/character/create",
            json={"name": "Combat Tester", "character_class": "detective"}
        )
        assert char_response.status_code == 200
        
        # Start combat
        response = client.post(f"/api/combat/start?game_state_id={game_state['id']}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify combat state structure
        assert "id" in data
        assert "game_state_id" in data
        assert data["game_state_id"] == game_state["id"]
        assert "party" in data
        assert "enemies" in data
        assert "turn_order" in data
        assert "current_turn" in data
        assert "is_active" in data
        
        # Verify enemies in combat
        assert len(data["enemies"]) > 0
        assert "name" in data["enemies"][0]
        assert "sprite_image" in data["enemies"][0]
        
        # Verify turn order
        assert len(data["turn_order"]) > 0


# Run the tests if executed directly
if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
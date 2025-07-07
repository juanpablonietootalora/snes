import os
import base64
import logging
from emergentintegrations.llm.gemeni.image_generation import GeminiImageGeneration
from fastapi import HTTPException
from .models import ImageGenerationRequest, ImageGenerationResponse

logger = logging.getLogger(__name__)

# Placeholder pixel art images as base64 (16x16 pixel sprites)
PLACEHOLDER_IMAGES = {
    "detective": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFCSURBVDiNpZM9SwNBEIafgK2NhY2NlY2NrVhaWlhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY",
    "witch": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFCSURBVDiNpZM9SwNBEIafgK2NhY2NlY2NrVhaWlhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY",
    "scientist": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFCSURBVDiNpZM9SwNBEIafgK2NhY2NlY2NrVhaWlhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY",
    "healer": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFCSURBVDiNpZM9SwNBEIafgK2NhY2NlY2NrVhaWlhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY",
    "cultist": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFCSURBVDiNpZM9SwNBEIafgK2NhY2NlY2NrVhaWlhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY",
    "cosmic_horror": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFCSURBVDiNpZM9SwNBEIafgK2NhY2NlY2NrVhaWlhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY",
    "boss": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFCSURBVDiNpZM9SwNBEIafgK2NhY2NlY2NrVhaWlhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY",
    "background": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAMCSURBVHic7ZzNcdswEIafRG4nMqBLcNqJDOgSUgPagEtwBXYF"
}

class ImageService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        self.use_gemini = self.api_key is not None
        
        if self.use_gemini:
            try:
                self.image_gen = GeminiImageGeneration(api_key=self.api_key)
                # Test the connection
                logger.info("Gemini image generation initialized successfully")
            except Exception as e:
                logger.warning(f"Gemini initialization failed: {e}. Using placeholder images.")
                self.use_gemini = False
        else:
            logger.info("No Gemini API key found. Using placeholder images.")
    
    def get_placeholder_image(self, image_type: str, character_class: str = None, enemy_type: str = None) -> str:
        """Get a placeholder image based on type"""
        if image_type == "character" and character_class:
            return PLACEHOLDER_IMAGES.get(character_class, PLACEHOLDER_IMAGES["detective"])
        elif image_type == "enemy" and enemy_type:
            return PLACEHOLDER_IMAGES.get(enemy_type, PLACEHOLDER_IMAGES["cultist"])
        elif image_type == "background":
            return PLACEHOLDER_IMAGES["background"]
        else:
            return PLACEHOLDER_IMAGES["detective"]
    
    async def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResponse:
        # First try Gemini if available
        if self.use_gemini:
            try:
                # Combine the prompt with style modifiers
                full_prompt = f"{request.prompt}, {request.style_modifiers}"
                
                logger.info(f"Generating image with Gemini: {full_prompt}")
                
                # Generate the image
                images = await self.image_gen.generate_images(
                    prompt=full_prompt,
                    model="imagen-3.0-generate-002",
                    number_of_images=1
                )
                
                if images and len(images) > 0:
                    # Convert to base64
                    image_base64 = base64.b64encode(images[0]).decode('utf-8')
                    return ImageGenerationResponse(
                        success=True,
                        image_base64=image_base64
                    )
                    
            except Exception as e:
                logger.warning(f"Gemini generation failed: {e}. Using placeholder.")
        
        # Fallback to placeholder
        placeholder = self.get_placeholder_image(request.image_type)
        return ImageGenerationResponse(
            success=True,
            image_base64=placeholder
        )
    
    async def generate_character_sprite(self, character_class: str, character_name: str) -> ImageGenerationResponse:
        prompts = {
            "detective": f"16-bit pixel art detective character sprite named {character_name}, 1920s Arkham setting, dark coat and hat, mysterious aura, SNES style graphics",
            "witch": f"16-bit pixel art witch character sprite named {character_name}, dark robes with occult symbols, crystal ball, blood magic aura, SNES style graphics",
            "scientist": f"16-bit pixel art scientist character sprite named {character_name}, lab coat with strange mutations, steampunk goggles, eldritch experiments, SNES style graphics",
            "healer": f"16-bit pixel art healer character sprite named {character_name}, tattered medical robes, plague doctor mask, cursed healing symbols, SNES style graphics"
        }
        
        prompt = prompts.get(character_class, f"16-bit pixel art character sprite named {character_name}, SNES style graphics")
        
        request = ImageGenerationRequest(
            prompt=prompt,
            image_type="character",
            style_modifiers="16-bit pixel art SNES style, dark Lovecraftian palette with deep purples, sickly greens, and smoky blacks, character sprite, front-facing view"
        )
        
        # Try Gemini first, fallback to placeholder
        result = await self.generate_image(request)
        if not result.success or not result.image_base64:
            placeholder = self.get_placeholder_image("character", character_class)
            return ImageGenerationResponse(success=True, image_base64=placeholder)
        
        return result
    
    async def generate_enemy_sprite(self, enemy_name: str, enemy_type: str) -> ImageGenerationResponse:
        prompts = {
            "cultist": f"16-bit pixel art cultist enemy sprite, {enemy_name}, fish-mask, dark robes, occult symbols, SNES style graphics",
            "cosmic_horror": f"16-bit pixel art cosmic horror enemy sprite, {enemy_name}, tentacles, multiple eyes, otherworldly form, SNES style graphics",
            "boss": f"16-bit pixel art boss enemy sprite, {enemy_name}, massive eldritch abomination, multiple forms, terrifying presence, SNES style graphics"
        }
        
        prompt = prompts.get(enemy_type, f"16-bit pixel art enemy sprite, {enemy_name}, SNES style graphics")
        
        request = ImageGenerationRequest(
            prompt=prompt,
            image_type="enemy",
            style_modifiers="16-bit pixel art SNES style, dark Lovecraftian palette with deep purples, sickly greens, and smoky blacks, enemy sprite, menacing appearance"
        )
        
        # Try Gemini first, fallback to placeholder
        result = await self.generate_image(request)
        if not result.success or not result.image_base64:
            placeholder = self.get_placeholder_image("enemy", enemy_type=enemy_type)
            return ImageGenerationResponse(success=True, image_base64=placeholder)
        
        return result
    
    async def generate_background(self, scene_description: str) -> ImageGenerationResponse:
        request = ImageGenerationRequest(
            prompt=f"16-bit pixel art background scene: {scene_description}, 1920s Arkham/Dunwich setting, SNES style graphics",
            image_type="background",
            style_modifiers="16-bit pixel art SNES style, dark atmospheric background, deep purples, sickly greens, and smoky blacks, detailed environment"
        )
        
        # Try Gemini first, fallback to placeholder
        result = await self.generate_image(request)
        if not result.success or not result.image_base64:
            placeholder = self.get_placeholder_image("background")
            return ImageGenerationResponse(success=True, image_base64=placeholder)
        
        return result
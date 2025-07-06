import os
import base64
import logging
from emergentintegrations.llm.gemeni.image_generation import GeminiImageGeneration
from fastapi import HTTPException
from .models import ImageGenerationRequest, ImageGenerationResponse

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        self.image_gen = GeminiImageGeneration(api_key=self.api_key)
    
    async def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResponse:
        try:
            # Combine the prompt with style modifiers
            full_prompt = f"{request.prompt}, {request.style_modifiers}"
            
            logger.info(f"Generating image with prompt: {full_prompt}")
            
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
            else:
                return ImageGenerationResponse(
                    success=False,
                    error_message="No image was generated"
                )
                
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return ImageGenerationResponse(
                success=False,
                error_message=str(e)
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
        
        return await self.generate_image(request)
    
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
        
        return await self.generate_image(request)
    
    async def generate_background(self, scene_description: str) -> ImageGenerationResponse:
        request = ImageGenerationRequest(
            prompt=f"16-bit pixel art background scene: {scene_description}, 1920s Arkham/Dunwich setting, SNES style graphics",
            image_type="background",
            style_modifiers="16-bit pixel art SNES style, dark atmospheric background, deep purples, sickly greens, and smoky blacks, detailed environment"
        )
        
        return await self.generate_image(request)

# Global instance
image_service = ImageService()
import os
import base64
import logging
from emergentintegrations.llm.gemeni.image_generation import GeminiImageGeneration
from fastapi import HTTPException
from .models import ImageGenerationRequest, ImageGenerationResponse
from PIL import Image, ImageDraw
import io

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        self.use_gemini = self.api_key is not None
        
        if self.use_gemini:
            try:
                self.image_gen = GeminiImageGeneration(api_key=self.api_key)
                logger.info("Gemini image generation initialized successfully")
            except Exception as e:
                logger.warning(f"Gemini initialization failed: {e}. Using placeholder images.")
                self.use_gemini = False
        else:
            logger.info("No Gemini API key found. Using placeholder images.")
    
    def create_placeholder_sprite(self, character_class: str = "detective", enemy_type: str = "cultist") -> str:
        """Create a simple 64x64 pixel art sprite"""
        # Create a 64x64 image
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Color schemes for different types
        colors = {
            "detective": [(139, 69, 19), (160, 82, 45), (210, 180, 140)],  # Brown detective
            "witch": [(75, 0, 130), (138, 43, 226), (106, 90, 205)],       # Purple witch
            "scientist": [(34, 139, 34), (50, 205, 50), (124, 252, 0)],     # Green scientist
            "healer": [(178, 34, 34), (220, 20, 60), (255, 99, 71)],        # Red healer
            "cultist": [(25, 25, 112), (72, 61, 139), (123, 104, 238)],     # Dark blue cultist
            "cosmic_horror": [(85, 107, 47), (107, 142, 35), (154, 205, 50)], # Olive horror
            "boss": [(139, 0, 0), (205, 92, 92), (255, 160, 122)]           # Dark red boss
        }
        
        sprite_type = character_class if character_class in colors else enemy_type
        color_scheme = colors.get(sprite_type, colors["detective"])
        
        # Draw a simple humanoid figure
        # Head
        draw.ellipse([22, 8, 42, 28], fill=color_scheme[2])
        
        # Body
        draw.rectangle([26, 28, 38, 48], fill=color_scheme[0])
        
        # Arms
        draw.rectangle([18, 30, 26, 44], fill=color_scheme[1])
        draw.rectangle([38, 30, 46, 44], fill=color_scheme[1])
        
        # Legs
        draw.rectangle([28, 48, 34, 58], fill=color_scheme[0])
        draw.rectangle([34, 48, 40, 58], fill=color_scheme[0])
        
        # Add class-specific details
        if character_class == "detective":
            # Hat
            draw.rectangle([20, 8, 44, 14], fill=(0, 0, 0))
        elif character_class == "witch":
            # Pointed hat
            draw.polygon([(32, 2), (26, 18), (38, 18)], fill=(25, 25, 112))
        elif character_class == "scientist":
            # Goggles
            draw.ellipse([24, 12, 28, 16], fill=(255, 255, 255))
            draw.ellipse([36, 12, 40, 16], fill=(255, 255, 255))
        elif character_class == "healer":
            # Cross symbol
            draw.rectangle([30, 32, 34, 42], fill=(255, 255, 255))
            draw.rectangle([26, 36, 38, 38], fill=(255, 255, 255))
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str
    
    def create_placeholder_background(self) -> str:
        """Create a simple background image"""
        img = Image.new('RGB', (256, 192), (25, 25, 112))  # Dark blue base
        draw = ImageDraw.Draw(img)
        
        # Draw some atmospheric elements
        # Fog/mist effect
        for i in range(50):
            x = i * 5
            y = 150 + (i % 20)
            draw.ellipse([x, y, x+10, y+8], fill=(75, 75, 112))
        
        # Buildings silhouette
        for i in range(0, 256, 40):
            height = 120 + (i % 40)
            draw.rectangle([i, height, i+35, 192], fill=(15, 15, 30))
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str
    
    async def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResponse:
        # First try Gemini if available
        if self.use_gemini:
            try:
                full_prompt = f"{request.prompt}, {request.style_modifiers}"
                logger.info(f"Generating image with Gemini: {full_prompt}")
                
                images = await self.image_gen.generate_images(
                    prompt=full_prompt,
                    model="imagen-3.0-generate-002",
                    number_of_images=1
                )
                
                if images and len(images) > 0:
                    image_base64 = base64.b64encode(images[0]).decode('utf-8')
                    return ImageGenerationResponse(
                        success=True,
                        image_base64=image_base64
                    )
                    
            except Exception as e:
                logger.warning(f"Gemini generation failed: {e}. Using placeholder.")
        
        # Fallback to programmatically generated placeholder
        if request.image_type == "background":
            placeholder = self.create_placeholder_background()
        else:
            # For characters and enemies, extract the type from prompt or use default
            placeholder = self.create_placeholder_sprite()
            
        return ImageGenerationResponse(
            success=True,
            image_base64=placeholder
        )
    
    async def generate_character_sprite(self, character_class: str, character_name: str) -> ImageGenerationResponse:
        # Try Gemini first if available
        if self.use_gemini:
            try:
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
                
                result = await self.generate_image(request)
                if result.success and result.image_base64:
                    return result
                    
            except Exception as e:
                logger.warning(f"Character sprite generation failed: {e}")
        
        # Use programmatically generated placeholder
        placeholder = self.create_placeholder_sprite(character_class=character_class)
        return ImageGenerationResponse(success=True, image_base64=placeholder)
    
    async def generate_enemy_sprite(self, enemy_name: str, enemy_type: str) -> ImageGenerationResponse:
        # Try Gemini first if available
        if self.use_gemini:
            try:
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
                
                result = await self.generate_image(request)
                if result.success and result.image_base64:
                    return result
                    
            except Exception as e:
                logger.warning(f"Enemy sprite generation failed: {e}")
        
        # Use programmatically generated placeholder
        placeholder = self.create_placeholder_sprite(enemy_type=enemy_type)
        return ImageGenerationResponse(success=True, image_base64=placeholder)
    
    async def generate_background(self, scene_description: str) -> ImageGenerationResponse:
        # Try Gemini first if available
        if self.use_gemini:
            try:
                request = ImageGenerationRequest(
                    prompt=f"16-bit pixel art background scene: {scene_description}, 1920s Arkham/Dunwich setting, SNES style graphics",
                    image_type="background",
                    style_modifiers="16-bit pixel art SNES style, dark atmospheric background, deep purples, sickly greens, and smoky blacks, detailed environment"
                )
                
                result = await self.generate_image(request)
                if result.success and result.image_base64:
                    return result
                    
            except Exception as e:
                logger.warning(f"Background generation failed: {e}")
        
        # Use programmatically generated placeholder
        placeholder = self.create_placeholder_background()
        return ImageGenerationResponse(success=True, image_base64=placeholder)
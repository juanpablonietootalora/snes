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
    
    def create_snes_healer_sprite(self) -> str:
        """Create an authentic SNES-style healer sprite using 16-bit techniques"""
        # Create a 64x64 sprite for better detail
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # SNES-era color palette for healer (plague doctor theme)
        colors = {
            # Plague doctor mask (dark leather)
            'mask_dark': (45, 35, 25),
            'mask_med': (65, 50, 35),
            'mask_light': (85, 65, 45),
            
            # Beak (weathered brown)
            'beak_dark': (70, 45, 25),
            'beak_light': (95, 65, 40),
            
            # Robes (deep crimson)
            'robe_shadow': (80, 20, 20),
            'robe_dark': (120, 30, 30),
            'robe_med': (160, 40, 40),
            'robe_light': (200, 60, 60),
            
            # Cross/medical symbol (bone white)
            'cross_white': (240, 235, 220),
            'cross_shadow': (200, 195, 180),
            
            # Eyes (glowing through mask)
            'eye_glow': (255, 200, 100),
            'eye_core': (255, 255, 150),
            
            # Gloves (dark leather)
            'glove_dark': (40, 30, 20),
            'glove_light': (60, 45, 30),
            
            # Outline
            'outline': (15, 10, 10)
        }
        
        # Main outline shape (SNES games used clean outlines)
        # Head/Mask outline
        draw.ellipse([18, 12, 46, 35], outline=colors['outline'], width=1)
        
        # Body outline
        draw.rectangle([20, 35, 44, 58], outline=colors['outline'], width=1)
        
        # Robe outline
        draw.polygon([(16, 40), (48, 40), (52, 62), (12, 62)], outline=colors['outline'], width=1)
        
        # Fill the mask (plague doctor mask with proper shading)
        # Base mask color
        draw.ellipse([19, 13, 45, 34], fill=colors['mask_med'])
        
        # Mask shading (left side darker for depth)
        draw.ellipse([19, 13, 35, 34], fill=colors['mask_dark'])
        draw.ellipse([29, 13, 45, 34], fill=colors['mask_light'])
        
        # Plague doctor beak
        # Beak base
        draw.polygon([(32, 28), (26, 36), (38, 36)], fill=colors['beak_dark'])
        # Beak highlight
        draw.polygon([(32, 28), (29, 33), (32, 34)], fill=colors['beak_light'])
        
        # Eyes (glowing through mask holes)
        draw.ellipse([24, 18, 28, 22], fill=colors['eye_glow'])
        draw.ellipse([25, 19, 27, 21], fill=colors['eye_core'])
        
        draw.ellipse([36, 18, 40, 22], fill=colors['eye_glow'])
        draw.ellipse([37, 19, 39, 21], fill=colors['eye_core'])
        
        # Body (medical robes with proper SNES shading)
        # Main robe body
        draw.rectangle([21, 36, 43, 57], fill=colors['robe_med'])
        
        # Robe shadows (left side and bottom)
        draw.rectangle([21, 36, 28, 57], fill=colors['robe_dark'])
        draw.rectangle([21, 50, 43, 57], fill=colors['robe_shadow'])
        
        # Robe highlights (right side)
        draw.rectangle([36, 36, 43, 49], fill=colors['robe_light'])
        
        # Extended robe bottom
        draw.polygon([(17, 41), (47, 41), (51, 61), (13, 61)], fill=colors['robe_dark'])
        draw.polygon([(17, 41), (47, 41), (47, 55), (17, 55)], fill=colors['robe_med'])
        
        # Medical cross on chest (SNES-style clean lines)
        # Vertical part of cross
        draw.rectangle([30, 42, 34, 52], fill=colors['cross_white'])
        draw.rectangle([30, 42, 32, 52], fill=colors['cross_shadow'])
        
        # Horizontal part of cross
        draw.rectangle([26, 45, 38, 49], fill=colors['cross_white'])
        draw.rectangle([26, 45, 38, 47], fill=colors['cross_shadow'])
        
        # Arms/sleeves
        # Left arm
        draw.ellipse([12, 38, 22, 48], fill=colors['robe_dark'])
        draw.ellipse([14, 40, 20, 46], fill=colors['robe_med'])
        
        # Right arm
        draw.ellipse([42, 38, 52, 48], fill=colors['robe_dark'])
        draw.ellipse([44, 40, 50, 46], fill=colors['robe_med'])
        
        # Gloved hands
        # Left hand
        draw.ellipse([10, 44, 16, 50], fill=colors['glove_dark'])
        draw.ellipse([12, 45, 15, 48], fill=colors['glove_light'])
        
        # Right hand
        draw.ellipse([48, 44, 54, 50], fill=colors['glove_dark'])
        draw.ellipse([49, 45, 52, 48], fill=colors['glove_light'])
        
        # Feet (just visible under robe)
        draw.ellipse([24, 58, 30, 62], fill=colors['glove_dark'])
        draw.ellipse([34, 58, 40, 62], fill=colors['glove_dark'])
        
        # Add some weathering/detail (SNES games had small details)
        # Small stains on robe
        draw.rectangle([25, 45, 26, 46], fill=colors['robe_shadow'])
        draw.rectangle([38, 50, 39, 51], fill=colors['robe_shadow'])
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str
    
    def create_placeholder_sprite(self, character_class: str = "detective", enemy_type: str = "cultist") -> str:
        """Create SNES-style sprites with improved techniques"""
        if character_class == "healer":
            return self.create_snes_healer_sprite()
        
        # For other classes, use the original method but improved
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Enhanced color schemes with SNES-style palettes
        colors = {
            "detective": {
                'outline': (20, 15, 10),
                'coat_dark': (70, 45, 20),
                'coat_med': (100, 65, 30),
                'coat_light': (130, 85, 40),
                'hat': (25, 20, 15),
                'skin': (210, 180, 140),
                'badge': (255, 215, 0)
            },
            "witch": {
                'outline': (25, 0, 35),
                'robe_dark': (50, 20, 80),
                'robe_med': (75, 35, 120),
                'robe_light': (100, 50, 160),
                'hat': (35, 15, 60),
                'skin': (210, 180, 140),
                'crystal': (200, 200, 255)
            },
            "scientist": {
                'outline': (20, 30, 20),
                'coat_white': (240, 240, 240),
                'coat_shadow': (200, 200, 200),
                'coat_med': (220, 220, 220),
                'goggles': (120, 120, 120),
                'mutation': (100, 255, 100),
                'skin': (210, 180, 140),
                'glass': (180, 220, 255)
            },
            "cultist": {
                'outline': (15, 15, 40),
                'robe_dark': (25, 25, 112),
                'robe_med': (72, 61, 139),
                'robe_light': (123, 104, 238),
                'mask': (40, 40, 60),
                'skin': (180, 160, 120),
                'eyes': (255, 0, 0)
            },
            "cosmic_horror": {
                'outline': (30, 40, 20),
                'body_dark': (85, 107, 47),
                'body_med': (107, 142, 35),
                'body_light': (154, 205, 50),
                'tentacles': (60, 80, 30),
                'eyes': (255, 255, 100),
                'slime': (120, 180, 60)
            },
            "boss": {
                'outline': (40, 0, 0),
                'body_dark': (139, 0, 0),
                'body_med': (205, 92, 92),
                'body_light': (255, 160, 122),
                'flames': (255, 100, 0),
                'eyes': (255, 255, 255),
                'shadows': (80, 0, 0)
            }
        }
        
        # Determine sprite type and get colors
        if character_class in colors:
            sprite_type = character_class
        elif enemy_type in colors:
            sprite_type = enemy_type
        else:
            sprite_type = "detective"
            
        color_scheme = colors[sprite_type]
        
        # Draw with outlines (SNES style)
        # Head outline and fill
        draw.ellipse([22, 8, 42, 28], outline=color_scheme['outline'], width=1)
        draw.ellipse([23, 9, 41, 27], fill=color_scheme['skin'])
        
        # Body outline and fill
        draw.rectangle([26, 28, 38, 48], outline=color_scheme['outline'], width=1)
        
        # Use appropriate body color based on sprite type
        if 'coat_med' in color_scheme:
            body_color = color_scheme['coat_med']
        elif 'robe_med' in color_scheme:
            body_color = color_scheme['robe_med']
        elif 'body_med' in color_scheme:
            body_color = color_scheme['body_med']
        else:
            body_color = (100, 100, 100)  # fallback
            
        draw.rectangle([27, 29, 37, 47], fill=body_color)
        
        # Add class-specific details with proper SNES styling
        if character_class == "detective":
            # Detective hat with proper shading
            draw.rectangle([20, 8, 44, 14], fill=color_scheme['hat'])
            draw.rectangle([20, 8, 44, 11], fill=(10, 8, 5))  # Hat shadow
            # Badge
            draw.rectangle([29, 32, 35, 38], fill=color_scheme['badge'])
            
        elif character_class == "witch":
            # Pointed hat with shading
            draw.polygon([(32, 2), (26, 18), (38, 18)], fill=color_scheme['hat'])
            draw.polygon([(32, 2), (29, 12), (32, 15)], fill=(20, 8, 40))  # Hat highlight
            # Crystal ball
            draw.ellipse([40, 20, 48, 28], fill=color_scheme['crystal'])
            
        elif character_class == "scientist":
            # Goggles with reflection
            draw.ellipse([24, 12, 28, 16], fill=color_scheme['goggles'])
            draw.ellipse([36, 12, 40, 16], fill=color_scheme['goggles'])
            draw.ellipse([25, 13, 27, 15], fill=color_scheme['glass'])
            draw.ellipse([37, 13, 39, 15], fill=color_scheme['glass'])
            # Lab coat
            draw.rectangle([24, 28, 40, 48], fill=color_scheme['coat_white'])
            draw.rectangle([24, 28, 28, 48], fill=color_scheme['coat_shadow'])
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str
    
    def create_placeholder_background(self) -> str:
        """Create a SNES-style background with proper techniques"""
        img = Image.new('RGB', (256, 192), (25, 25, 60))  # Dark blue base
        draw = ImageDraw.Draw(img)
        
        # SNES-style layered background
        # Sky gradient
        for y in range(0, 100):
            color_intensity = int(25 + (y * 0.3))
            draw.line([(0, y), (256, y)], fill=(color_intensity, color_intensity, 60 + y // 3))
        
        # Building silhouettes with SNES-style details
        building_colors = [(15, 15, 30), (20, 20, 35), (25, 25, 40)]
        
        for i in range(0, 256, 40):
            height = 120 + (i % 40)
            color = building_colors[i // 80 % len(building_colors)]
            
            # Main building
            draw.rectangle([i, height, i+35, 192], fill=color)
            
            # Windows
            for row in range(height + 10, 192, 15):
                for col in range(i + 5, i + 30, 8):
                    if (row + col) % 30 < 15:  # Some windows lit
                        draw.rectangle([col, row, col+3, row+3], fill=(255, 255, 150))
                    else:
                        draw.rectangle([col, row, col+3, row+3], fill=(40, 40, 70))
        
        # Fog effect (SNES-style transparency simulation)
        for i in range(50):
            x = i * 5
            y = 150 + (i % 20)
            alpha_sim = (75, 75, 112) if i % 2 == 0 else (85, 85, 122)
            draw.ellipse([x, y, x+10, y+8], fill=alpha_sim)
        
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
        
        # Fallback to SNES-style placeholder
        if request.image_type == "background":
            placeholder = self.create_placeholder_background()
        else:
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
        
        # Use SNES-style placeholder
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
        
        # Use SNES-style placeholder
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
        
        # Use SNES-style placeholder
        placeholder = self.create_placeholder_background()
        return ImageGenerationResponse(success=True, image_base64=placeholder)
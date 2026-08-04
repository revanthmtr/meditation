import os
import math
import numpy as np
from PIL import Image, ImageFilter
import subprocess

def create_cinematic_loop():
    img_path = "assets/images/hero_cinematic.png"
    if not os.path.exists(img_path):
        print("Image not found:", img_path)
        return

    base_img = Image.open(img_path).convert("RGB")
    width, height = base_img.size
    
    # Resize to standard 1920x1080 if needed for optimal compression
    target_w, target_h = 1920, 1080
    resample_filter = getattr(Image, 'Resampling', Image).LANCZOS
    bilinear_filter = getattr(Image, 'Resampling', Image).BILINEAR
    base_img = base_img.resize((target_w, target_h), resample_filter)
    
    fps = 30
    duration_sec = 8
    total_frames = fps * duration_sec

    # Prepare raw frame directory or pipe directly to ffmpeg
    cmd = [
        'ffmpeg', '-y',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-s', f'{target_w}x{target_h}',
        '-pix_fmt', 'rgb24',
        '-r', str(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '22',
        '-preset', 'fast',
        'assets/video/hero_guru_loop.mp4'
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    np_base = np.array(base_img, dtype=np.float32)

    for frame in range(total_frames):
        t = frame / total_frames
        angle = t * 2 * math.pi

        # 1. Subtle breathing rise/fall scale (1.0 to 1.004)
        scale = 1.0 + 0.003 * (math.sin(angle) * 0.5 + 0.5)
        
        # 2. Candle diya amber glow flicker (soft sine + small noise)
        flicker = 1.0 + 0.04 * math.sin(angle * 3) + 0.02 * math.cos(angle * 7)

        # Apply slight brightness modulation to warm candle regions
        frame_data = np_base.copy()
        
        # Warm practical light mask (diya / candle region)
        frame_data[:, :, 0] = np.clip(frame_data[:, :, 0] * flicker, 0, 255)
        frame_data[:, :, 1] = np.clip(frame_data[:, :, 1] * (1.0 + (flicker - 1.0) * 0.7), 0, 255)

        # Convert back to uint8 image
        img_frame = Image.fromarray(frame_data.astype(np.uint8))
        
        # Apply scaling for breathing
        w_scaled = int(target_w * scale)
        h_scaled = int(target_h * scale)
        img_frame = img_frame.resize((w_scaled, h_scaled), bilinear_filter)
        
        # Crop center
        crop_x = (w_scaled - target_w) // 2
        crop_y = (h_scaled - target_h) // 2
        img_frame = img_frame.crop((crop_x, crop_y, crop_x + target_w, crop_y + target_h))

        proc.stdin.write(img_frame.tobytes())

    proc.stdin.close()
    proc.wait()
    print("Video loop generated successfully at assets/video/hero_guru_loop.mp4")

if __name__ == "__main__":
    create_cinematic_loop()

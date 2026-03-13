#!/usr/bin/env python3
"""
Reorder frames per show from hardest to easiest to identify.

Uses image analysis heuristics:
- Face-like high-contrast center regions = easier (likely close-ups)
- Low contrast, uniform images = harder (likely wide/establishing shots)
- More edge detail in center = easier (faces have lots of edges)

Renames frames so 1.jpg = hardest, 6.jpg = easiest.
"""

from pathlib import Path
from PIL import Image
import numpy as np
import shutil

FRAMES_DIR = Path(__file__).parent.parent / "public" / "frames"


def get_difficulty_score(img_path: str) -> float:
    """
    Lower score = harder to identify (should be shown first).
    Higher score = easier to identify (shown last).
    
    Analyzes:
    1. Center region contrast (faces have high contrast)
    2. Edge density in center (faces have many edges)
    3. Skin-tone pixel ratio (more skin = likely a face close-up)
    """
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img, dtype=np.float64)
    
    h, w = arr.shape[:2]
    
    # Center crop (middle 40% of image - where faces usually are)
    cy, cx = h // 2, w // 2
    ch, cw = int(h * 0.4), int(w * 0.4)
    center = arr[cy - ch // 2:cy + ch // 2, cx - cw // 2:cx + cw // 2]
    
    # 1. Center contrast (std dev of luminance in center)
    gray_center = np.mean(center, axis=2)
    center_contrast = np.std(gray_center)
    
    # 2. Edge density in center (simple gradient magnitude)
    if gray_center.shape[0] > 2 and gray_center.shape[1] > 2:
        gx = np.diff(gray_center, axis=1)
        gy = np.diff(gray_center, axis=0)
        edge_density = np.mean(np.abs(gx)) + np.mean(np.abs(gy))
    else:
        edge_density = 0
    
    # 3. Skin tone detection (rough heuristic for RGB)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    skin_mask = (r > 80) & (g > 50) & (b > 30) & \
                (r > g) & (r > b) & \
                ((r - g) > 15) & \
                (np.abs(r - g) < 100)
    skin_ratio = np.sum(skin_mask) / (h * w)
    
    # Combine scores (higher = easier to identify)
    score = center_contrast * 0.4 + edge_density * 0.4 + skin_ratio * 100 * 0.2
    
    return score


def reorder_show(show_dir: Path):
    """Reorder frames in a show directory from hardest to easiest."""
    frames = sorted(show_dir.glob("*.jpg"))
    if len(frames) != 6:
        print(f"  ⚠ Skipping {show_dir.name}: {len(frames)} frames (need 6)")
        return False
    
    # Score each frame
    scored = []
    for f in frames:
        try:
            score = get_difficulty_score(str(f))
            scored.append((f, score))
        except Exception as e:
            print(f"  ⚠ Error scoring {f.name}: {e}")
            return False
    
    # Sort: lowest score first (hardest), highest last (easiest)
    scored.sort(key=lambda x: x[1])
    
    # Check if already in order
    current_order = [f.name for f, _ in scored]
    if current_order == ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]:
        print(f"  ✓ Already ordered")
        return True
    
    # Rename via temp files to avoid conflicts
    tmp_dir = show_dir / "_tmp"
    tmp_dir.mkdir(exist_ok=True)
    
    for i, (orig_file, score) in enumerate(scored, 1):
        shutil.copy2(orig_file, tmp_dir / f"{i}.jpg")
    
    # Move back
    for i in range(1, 7):
        shutil.move(str(tmp_dir / f"{i}.jpg"), str(show_dir / f"{i}.jpg"))
    
    tmp_dir.rmdir()
    
    order_info = " → ".join([f"{f.name}({s:.0f})" for f, s in scored])
    print(f"  ✅ Reordered: {order_info}")
    return True


def main():
    shows = sorted(FRAMES_DIR.iterdir())
    shows = [s for s in shows if s.is_dir() and not s.name.startswith(".")]
    
    print(f"Reordering frames for {len(shows)} shows...\n")
    
    success = 0
    for show_dir in shows:
        print(f"Processing: {show_dir.name}")
        if reorder_show(show_dir):
            success += 1
    
    print(f"\n✅ Reordered {success}/{len(shows)} shows")


if __name__ == "__main__":
    main()

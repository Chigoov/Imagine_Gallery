import os
import subprocess
import struct

SRC_LOGO = "C:/Users/HYPE AMD/Downloads/VIBE CODING/DAILY TASK/Imagine-Gallery-assets/imagine-gallery-logo.png"
APP_ROOT = "C:/Users/HYPE AMD/Downloads/VIBE CODING/Imagine App"

def run_ffmpeg(args):
    cmd = ["ffmpeg", "-y"] + args
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        raise RuntimeError(f"FFmpeg failed: {res.stderr}")

def create_transparent_scaled(src, dst, width, height):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    run_ffmpeg([
        "-i", src,
        "-vf", f"scale={width}:{height}:flags=lanczos",
        "-frames:v", "1",
        "-update", "1",
        dst
    ])

def create_solid_bg_scaled(src, dst, total_w, total_h, inner_w, inner_h, bg_hex="0x0F1012"):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    run_ffmpeg([
        "-f", "lavfi", "-i", f"color=c={bg_hex}:s={total_w}x{total_h}",
        "-i", src,
        "-filter_complex", f"[1:v]scale={inner_w}:{inner_h}:flags=lanczos[logo];[0:v][logo]overlay=(W-w)/2:(H-h)/2",
        "-frames:v", "1",
        "-update", "1",
        dst
    ])

def create_ico(png_paths, ico_dst):
    # Standard modern ICO containing PNGs
    entries = []
    png_data = []
    offset = 6 + len(png_paths) * 16

    for p in png_paths:
        with open(p, "rb") as f:
            data = f.read()
        w, h = struct.unpack(">LL", data[16:24])
        b_w = 0 if w >= 256 else w
        b_h = 0 if h >= 256 else h
        size = len(data)
        entry = struct.pack("<BBBBHHII", b_w, b_h, 0, 0, 1, 32, size, offset)
        entries.append(entry)
        png_data.append(data)
        offset += size

    header = struct.pack("<HHH", 0, 1, len(png_paths))
    with open(ico_dst, "wb") as f:
        f.write(header)
        for e in entries:
            f.write(e)
        for d in png_data:
            f.write(d)
    print("Created ICO:", ico_dst)

def main():
    print("Generating Web/PWA assets...")
    # Public web assets
    create_transparent_scaled(SRC_LOGO, f"{APP_ROOT}/public/favicon.png", 64, 64)
    create_transparent_scaled(SRC_LOGO, f"{APP_ROOT}/public/favicon-32.png", 32, 32)
    create_transparent_scaled(SRC_LOGO, f"{APP_ROOT}/public/icon-192.png", 192, 192)
    create_transparent_scaled(SRC_LOGO, f"{APP_ROOT}/public/icon-512.png", 512, 512)
    create_solid_bg_scaled(SRC_LOGO, f"{APP_ROOT}/public/apple-touch-icon.png", 180, 180, 150, 150, "0x0F1012")
    create_transparent_scaled(SRC_LOGO, f"{APP_ROOT}/public/logo.png", 512, 512)

    print("Generating Android mipmap icons...")
    # Android mipmaps
    mipmaps = [
        ("mipmap-mdpi", 48, 108),
        ("mipmap-hdpi", 72, 162),
        ("mipmap-xhdpi", 96, 216),
        ("mipmap-xxhdpi", 144, 324),
        ("mipmap-xxxhdpi", 192, 432),
    ]

    for folder, icon_size, fg_size in mipmaps:
        res_dir = f"{APP_ROOT}/android/app/src/main/res/{folder}"
        # Foreground for adaptive icon (108dp, scaled)
        create_transparent_scaled(SRC_LOGO, f"{res_dir}/ic_launcher_foreground.png", fg_size, fg_size)
        # Legacy square / round icon with dark background
        inner_icon_size = int(icon_size * 0.85)
        create_solid_bg_scaled(SRC_LOGO, f"{res_dir}/ic_launcher.png", icon_size, icon_size, inner_icon_size, inner_icon_size, "0x0F1012")
        create_solid_bg_scaled(SRC_LOGO, f"{res_dir}/ic_launcher_round.png", icon_size, icon_size, inner_icon_size, inner_icon_size, "0x0F1012")

    print("Generating Android splash screens...")
    splashes = [
        ("drawable/splash.png", 480, 320, 160),
        ("drawable-port-mdpi/splash.png", 320, 480, 160),
        ("drawable-port-hdpi/splash.png", 480, 800, 240),
        ("drawable-port-xhdpi/splash.png", 720, 1280, 360),
        ("drawable-port-xxhdpi/splash.png", 960, 1600, 480),
        ("drawable-port-xxxhdpi/splash.png", 1280, 1920, 600),
        ("drawable-land-mdpi/splash.png", 480, 320, 160),
        ("drawable-land-hdpi/splash.png", 800, 480, 240),
        ("drawable-land-xhdpi/splash.png", 1280, 720, 360),
        ("drawable-land-xxhdpi/splash.png", 1600, 960, 480),
        ("drawable-land-xxxhdpi/splash.png", 1920, 1280, 600),
    ]
    for rel_path, sw, sh, logo_size in splashes:
        dst = f"{APP_ROOT}/android/app/src/main/res/{rel_path}"
        create_solid_bg_scaled(SRC_LOGO, dst, sw, sh, logo_size, logo_size, "0x090A0B")

    print("Generating Electron desktop assets...")
    # Electron desktop assets
    create_transparent_scaled(SRC_LOGO, f"{APP_ROOT}/electron/assets/appIcon.png", 512, 512)
    create_solid_bg_scaled(SRC_LOGO, f"{APP_ROOT}/electron/assets/splash.png", 480, 800, 280, 280, "0x090A0B")

    # Generate multi-size PNGs for ICO
    ico_png_sizes = [16, 24, 32, 48, 64, 128, 256]
    ico_pngs = []
    tmp_dir = f"{APP_ROOT}/public/.temp_ico"
    os.makedirs(tmp_dir, exist_ok=True)
    for sz in ico_png_sizes:
        p = f"{tmp_dir}/ico_{sz}.png"
        create_transparent_scaled(SRC_LOGO, p, sz, sz)
        ico_pngs.append(p)
    create_ico(ico_pngs, f"{APP_ROOT}/electron/assets/appIcon.ico")

    # Clean up temp
    for p in ico_pngs:
        try: os.remove(p)
        except: pass
    try: os.rmdir(tmp_dir)
    except: pass

    # Remove test_legacy if exists
    try: os.remove(f"{APP_ROOT}/public/test_legacy.png")
    except: pass

    print("All assets generated successfully!")

if __name__ == "__main__":
    main()

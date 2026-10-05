"""
把 src/icon/ 下的头像原图居中裁成正方形、缩到 128px，输出到 src/assets/avatars/。
页面只引用 src/assets/avatars/ 里的缩略图；src/icon/ 的原图保持不动、也不会被打包。

替换或新增头像后重新运行：
    python scripts/make-avatars.py

需要 Pillow（pip install pillow）。
"""
from pathlib import Path

from PIL import Image, ImageOps, ImageStat

# 地图上的头像是 32px（--origin-pin-size），最高按 3x 屏算 ≈ 96px，128px 留一点余量
SIZE = 128
SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}

root = Path(__file__).resolve().parent.parent
source_dir = root / "src" / "icon"
output_dir = root / "src" / "assets" / "avatars"
output_dir.mkdir(parents=True, exist_ok=True)

for path in sorted(source_dir.iterdir()):
    if path.suffix.lower() not in SUFFIXES:
        continue
    with Image.open(path) as image:
        # exif_transpose：手机照片常把旋转写在 EXIF 里，不处理会横着显示
        square = ImageOps.fit(ImageOps.exif_transpose(image).convert("RGB"), (SIZE, SIZE), Image.LANCZOS)
    target = output_dir / f"{path.stem}.jpg"
    square.save(target, "JPEG", quality=85, optimize=True, progressive=True)
    print(f"{path.name:>10} -> {target.relative_to(root).as_posix()} ({target.stat().st_size / 1024:.1f} KB)")
    # 纯色图（比如导出失败的全白图）在地图上只是一个空圆，多半不是想要的头像
    if max(ImageStat.Stat(square).stddev) < 1:
        print(f"{'':>10}    [警告] 这张图是纯色的，地图上会显示成空白圆，请检查 {path.relative_to(root).as_posix()}")

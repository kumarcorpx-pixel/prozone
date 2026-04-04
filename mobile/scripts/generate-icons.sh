#!/bin/bash
# Generate iOS app icons from a source 1024x1024 PNG
# Usage: ./generate-icons.sh source-icon.png

set -e

SOURCE="${1:-icon-source.png}"

if [ ! -f "$SOURCE" ]; then
  echo "Usage: $0 <source-1024x1024.png>"
  echo ""
  echo "Create a 1024x1024 PNG icon with:"
  echo "  - Navy (#0f2340) background"
  echo "  - Gold 'Y' letter or YABS logo centered"
  echo "  - No transparency (App Store rejects it)"
  echo "  - No rounded corners (iOS adds them automatically)"
  exit 1
fi

# Check for sips (macOS built-in)
if ! command -v sips &> /dev/null; then
  echo "Error: sips not found. This script requires macOS."
  exit 1
fi

OUTDIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$OUTDIR"

# iOS required sizes
declare -a SIZES=(20 29 40 58 60 76 80 87 120 152 167 180 1024)

for SIZE in "${SIZES[@]}"; do
  sips -z "$SIZE" "$SIZE" "$SOURCE" --out "$OUTDIR/icon-${SIZE}.png" > /dev/null 2>&1
  echo "Generated icon-${SIZE}.png"
done

# Write Contents.json
cat > "$OUTDIR/Contents.json" << 'ICONJSON'
{
  "images": [
    { "size": "20x20", "idiom": "iphone", "filename": "icon-40.png", "scale": "2x" },
    { "size": "20x20", "idiom": "iphone", "filename": "icon-60.png", "scale": "3x" },
    { "size": "29x29", "idiom": "iphone", "filename": "icon-58.png", "scale": "2x" },
    { "size": "29x29", "idiom": "iphone", "filename": "icon-87.png", "scale": "3x" },
    { "size": "40x40", "idiom": "iphone", "filename": "icon-80.png", "scale": "2x" },
    { "size": "40x40", "idiom": "iphone", "filename": "icon-120.png", "scale": "3x" },
    { "size": "60x60", "idiom": "iphone", "filename": "icon-120.png", "scale": "2x" },
    { "size": "60x60", "idiom": "iphone", "filename": "icon-180.png", "scale": "3x" },
    { "size": "20x20", "idiom": "ipad", "filename": "icon-20.png", "scale": "1x" },
    { "size": "20x20", "idiom": "ipad", "filename": "icon-40.png", "scale": "2x" },
    { "size": "29x29", "idiom": "ipad", "filename": "icon-29.png", "scale": "1x" },
    { "size": "29x29", "idiom": "ipad", "filename": "icon-58.png", "scale": "2x" },
    { "size": "40x40", "idiom": "ipad", "filename": "icon-40.png", "scale": "1x" },
    { "size": "40x40", "idiom": "ipad", "filename": "icon-80.png", "scale": "2x" },
    { "size": "76x76", "idiom": "ipad", "filename": "icon-76.png", "scale": "1x" },
    { "size": "76x76", "idiom": "ipad", "filename": "icon-152.png", "scale": "2x" },
    { "size": "83.5x83.5", "idiom": "ipad", "filename": "icon-167.png", "scale": "2x" },
    { "size": "1024x1024", "idiom": "ios-marketing", "filename": "icon-1024.png", "scale": "1x" }
  ],
  "info": { "version": 1, "author": "xcode" }
}
ICONJSON

echo ""
echo "Done! Icons generated in $OUTDIR"
echo "Open Xcode and verify Assets.xcassets → AppIcon"

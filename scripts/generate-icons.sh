#!/bin/bash
# Generate PWA icons from the SVG source
# Requires: rsvg-convert (librsvg2-bin) or ImageMagick (convert)
# Usage: bash scripts/generate-icons.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ICONS_DIR="$PROJECT_DIR/public/icons"
SVG_FILE="$ICONS_DIR/icon.svg"

if command -v rsvg-convert &> /dev/null; then
  echo "Using rsvg-convert..."
  rsvg-convert -w 192 -h 192 "$SVG_FILE" -o "$ICONS_DIR/icon-192.png"
  rsvg-convert -w 512 -h 512 "$SVG_FILE" -o "$ICONS_DIR/icon-512.png"
  rsvg-convert -w 512 -h 512 "$SVG_FILE" -o "$ICONS_DIR/icon-maskable.png"
  echo "Icons generated successfully!"
elif command -v convert &> /dev/null; then
  echo "Using ImageMagick..."
  convert -background none -resize 192x192 "$SVG_FILE" "$ICONS_DIR/icon-192.png"
  convert -background none -resize 512x512 "$SVG_FILE" "$ICONS_DIR/icon-512.png"
  convert -background none -resize 512x512 "$SVG_FILE" "$ICONS_DIR/icon-maskable.png"
  echo "Icons generated successfully!"
else
  echo "ERROR: Neither rsvg-convert nor ImageMagick found."
  echo "Install one of:"
  echo "  sudo apt install librsvg2-bin"
  echo "  sudo apt install imagemagick"
  exit 1
fi

#!/usr/bin/env bash
# Turn gifs/*.gif and the fudu/ stills into sprite sheets under public/sprites/.
# Re-runnable: change the heights below and run again.
#
#   ./tools/make-sprites.sh
#
# Heights are 2x the on-screen size in main.ts, for retina displays.
set -euo pipefail
cd "$(dirname "$0")/.."

BUBU_H=240   # drawn at 120
DUDU_H=340   # drawn at 170
FUDU_H=140   # drawn at 70

mkdir -p public/sprites
manifest=""
generated=""

for gif in gifs/bubu*.gif gifs/dudu*.gif; do
  name=$(basename "$gif" .gif)
  case "$name" in
    dudu*) height=$DUDU_H ;;
    *)     height=$BUBU_H ;;
  esac

  # Union bounding box across every frame. Per-frame -trim would crop each
  # frame to its own bounds, giving unequal cells and a jittering sprite.
  box=$(magick "$gif" -coalesce -background none -flatten -trim -format '%wx%h%O' info:)

  # -coalesce: rebuild partial GIF frames into whole ones (these are disposal=2)
  # +repage:   drop the virtual-canvas offsets that -crop leaves behind
  # +append:   join frames into one row
  magick "$gif" -coalesce -crop "$box" +repage \
    -resize "x${height}" -background none +append \
    "public/sprites/${name}.png"

  frames=$(magick identify -format '%n\n' "$gif" | head -1)
  read -r fw fh <<< "$(magick "$gif" -coalesce -crop "$box" +repage \
    -resize "x${height}" -format '%w %h ' info: | awk '{print $1, $2}')"

  # Playback speed from the source. GIF delays are centiseconds per frame and
  # are near-uniform within each of these, so one mean fps per sheet replays
  # them at roughly their original speed without storing every frame's delay.
  fps=$(magick identify -format '%T\n' "$gif" |
    awk '{s+=$1; n++} END {printf "%.1f", (s>0 ? 100/(s/n) : 12)}')

  manifest+="    ${name}: { src: \"sprites/${name}.png\", w: ${fw}, h: ${fh}, frames: ${frames}, fps: ${fps} },"$'\n'
  generated+=" ${name}"
  printf '%-8s %4s frames  %4dx%-4d cell  %5dx%-4d sheet  %5s fps\n' \
    "$name" "$frames" "$fw" "$fh" "$((fw * frames))" "$fh" "$fps"
done

# The fudu stills. Numbered in sorted filename order to match the bubu/dudu
# naming; the names are internal, so adding a file and reshuffling them is
# harmless. Each becomes a one-frame "sheet" so it rides the same draw path.
i=0
for still in fudu/*; do
  [ -e "$still" ] || continue
  i=$((i + 1))
  name="fudu${i}"

  # Is the image a cutout sitting on flat white, or a photograph? Checking two
  # opposite corners separates them: a white-backed cutout has both near 1.0,
  # a photo has a real scene running to the edge.
  corner=$(magick "$still" -format \
    '%[fx:min(min(min(p{0,0}.r,p{0,0}.g),p{0,0}.b),min(min(p{w-1,h-1}.r,p{w-1,h-1}.g),p{w-1,h-1}.b))]' \
    info:)

  if awk -v c="$corner" 'BEGIN {exit !(c > 0.9)}'; then
    # Floodfill inward from all four corners, so background that wraps around
    # the subject clears too. The fuzz stays low: these subjects are themselves
    # pale, and a loose match eats into them.
    magick "$still" -alpha set -fuzz 5% -fill none \
      -draw 'color 0,0 floodfill' \
      -draw 'color %[fx:w-1],0 floodfill' \
      -draw 'color 0,%[fx:h-1] floodfill' \
      -draw 'color %[fx:w-1],%[fx:h-1] floodfill' \
      -trim +repage -resize "x${FUDU_H}" "public/sprites/${name}.png"
    how="white-cutout"
  else
    # No isolatable background. Both of these are round dishes shot square-on
    # and centred, so a circular mask lifts the dish out and leaves the table
    # behind -- the only way to get a non-rectangular sprite out of a photo.
    # The -alpha flags are load-bearing and easy to get backwards: the mask
    # needs alpha OFF so its greyscale reads as coverage, the photo needs alpha
    # SET so there is a channel for CopyOpacity to write into. Getting this
    # wrong composites silently and leaves a plain square.
    magick "$still" -resize "${FUDU_H}x${FUDU_H}^" -gravity center \
      -extent "${FUDU_H}x${FUDU_H}" -alpha set \
      \( -size "${FUDU_H}x${FUDU_H}" xc:black -fill white \
         -draw "circle $((FUDU_H / 2)),$((FUDU_H / 2)) $((FUDU_H / 2)),1" \
         -alpha off \) \
      -compose CopyOpacity -composite "public/sprites/${name}.png"
    how="circle-mask"
  fi

  read -r fw fh <<< "$(magick identify -format '%w %h' "public/sprites/${name}.png")"
  # Stills, so one frame and fps never gets used -- kept only so every entry
  # in SHEETS has the same shape.
  manifest+="    ${name}: { src: \"sprites/${name}.png\", w: ${fw}, h: ${fh}, frames: 1, fps: 1 },"$'\n'
  generated+=" ${name}"
  printf '%-8s %4s frame   %4dx%-4d cell  %5dx%-4d sheet  %s  (%s)\n' \
    "$name" 1 "$fw" "$fh" "$fw" "$fh" "      " "$how"
done

# Drop sprites whose source is gone. Without this, deleting a gif or a still
# leaves an orphan PNG behind and, until the next run, a SHEETS entry pointing
# at it.
for png in public/sprites/*.png; do
  [ -e "$png" ] || continue
  base=$(basename "$png" .png)
  case " $generated " in
    *" $base "*) ;;
    *) rm "$png"; echo "removed stale ${png} (source gone)" ;;
  esac
done

# The four numbers per sheet, generated rather than transcribed by hand.
cat > src/sprites.ts <<EOF
// GENERATED by tools/make-sprites.sh -- do not edit by hand.
// Single-row sheets, so columns === frames. Stills are frames: 1.
export const SHEETS = {
${manifest%$'\n'}
} as const;

export type SheetName = keyof typeof SHEETS;
EOF

echo
echo "wrote public/sprites/*.png and src/sprites.ts"

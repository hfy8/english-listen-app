#!/bin/bash
set -euo pipefail

export MINIMAX_API_HOST="https://api.minimaxi.com"
export MINIMAX_API_KEY="sk-cp-QzrjJVpQohKdGi7iztALPS4mU2EURP9UOaHNE86XY-2wOhTYYrT70txXKS9eWG1jRXP7I_p0Va5e5pAUIxjg22vIpR6gcWidKqVadnNHi3R-IHPy9YFZX-g"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="/home/rs8568/.openclaw/workspace/skills/yh-minimax-multimodal-toolkit/scripts/tts"
OUTPUT_DIR="$SCRIPT_DIR/public/audio/words"

mkdir -p "$OUTPUT_DIR"

# 107 unique words
words=(
  ant apple arm baby bag ball banana bear bee bird black blue boat book bread brother brown
  cake card cat chair chicken cloud coat coffee cold cow dad desk dog doll dress duck ear egg
  eight elephant eleven eye face fish five foot four frog game glove grandma grandpa green
  grey hand hat head horse hot juice kite leg milk monkey moon mouth mum nine nose one
  orange panda pen pencil pig pink purple rabbit rain red rice salt school seven sheep shirt
  shoe sister six snake snow sock star sugar sun tea teacher ten three tiger toy twelve
  twenty two warm water white wind yellow zebra
)

# Use a native English voice
VOICE="male-qn-qingse"  # Male, native English

total=${#words[@]}
count=0

for word in "${words[@]}"; do
  count=$((count + 1))
  outfile="$OUTPUT_DIR/${word}.mp3"
  
  if [ -f "$outfile" ]; then
    echo "[$count/$total] Skip (exists): $word"
    continue
  fi
  
  echo "[$count/$total] Generating: $word -> $outfile"
  bash "$SKILL_DIR/generate_voice.sh" tts "$word" -v "$VOICE" -o "$outfile" 2>&1
  
  if [ $? -eq 0 ]; then
    echo "  ✓ Done: $word"
  else
    echo "  ✗ Failed: $word"
  fi
  
  # Small delay to avoid API rate limiting
  sleep 0.5
done

echo ""
echo "=== Generation complete ==="
ls -la "$OUTPUT_DIR" | wc -l
echo "Total files in $OUTPUT_DIR"
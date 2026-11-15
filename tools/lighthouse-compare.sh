#!/usr/bin/env bash
# Lighthouse comparison of Phase 1 (v1.0) and Phase 2 (v2.0), CR-50.
# Usage: serve the v1.0 build on :5001 and the v2.0 build on :5002, then run this script.
# Each page is measured three times with Lighthouse's default mobile settings; the median is kept.
set -e
out=${1:-lighthouse-runs}
mkdir -p "$out"
for v in 1 2; do
  for page in home work; do
    url="http://localhost:500$v/"; [ "$page" = work ] && url="http://localhost:500$v/#/knowledge"
    for r in 1 2 3; do
      npx lighthouse@12.2.1 "$url" --quiet --output=json --output-path="$out/v$v-$page-$r.json" \
        --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox"
    done
  done
done

#!/usr/bin/env bash
# @file API tests for server/index.js, with real assertions (CR-14).
#
# Peer review (Aggarwal, 2026): the Phase 1 script printed results without
# checking them, and it deleted the real data files at the end. Now:
#  - the server runs against a throw-away DATA_DIR, so real data is never touched
#  - every check compares the actual HTTP status with the expected one
#  - the script exits with status 1 if any check fails, so CI fails too
# Usage: npm run test:api   (from the repository root)
set -u
DATA_DIR="$(mktemp -d)"
PORT=5099
URL="http://localhost:$PORT"
J='Content-Type: application/json'
FAILED=0

(cd server && DATA_DIR="$DATA_DIR" PORT=$PORT exec node index.js >/dev/null 2>&1) &
PID=$!
trap 'kill $PID 2>/dev/null; rm -rf "$DATA_DIR"' EXIT
for _ in $(seq 1 30); do curl -s "$URL/posts" >/dev/null && break; sleep 0.2; done

status() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
check() { # check "<name>" <expected> <actual>
  if [ "$2" = "$3" ]; then printf 'PASS  %-46s %s\n' "$1" "$3"; else printf 'FAIL  %-46s expected %s, got %s\n' "$1" "$2" "$3"; FAILED=1; fi
}
token() { curl -s -X POST "$URL/auth/login" -H "$J" -d "{\"username\":\"$1\",\"password\":\"$2\"}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).token'; }

check "register a new user"                    201 "$(status -X POST "$URL/auth/register" -H "$J" -d '{"username":"ann","password":"pw-ann"}')"
status -X POST "$URL/auth/register" -H "$J" -d '{"username":"bob","password":"pw-bob"}' >/dev/null
check "register a taken name"                  400 "$(status -X POST "$URL/auth/register" -H "$J" -d '{"username":"ann","password":"x"}')"
check "login with a wrong password"            401 "$(status -X POST "$URL/auth/login" -H "$J" -d '{"username":"ann","password":"x"}')"
TA=$(token ann pw-ann); TB=$(token bob pw-bob)
check "create a post without a token"          401 "$(status -X POST "$URL/posts" -H "$J" -d '{"content":"hi"}')"
ID=$(curl -s -X POST "$URL/posts" -H "Authorization: Bearer $TA" -H "$J" -d '{"content":"hi"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
check "comment without a token"                401 "$(status -X POST "$URL/posts/$ID/comments" -H "$J" -d '{"author":"mallory","content":"x"}')"
curl -s -X POST "$URL/posts/$ID/comments" -H "Authorization: Bearer $TB" -H "$J" -d '{"author":"mallory","content":"nice"}' >/dev/null
AUTHOR=$(curl -s "$URL/posts" | node -pe 'JSON.parse(require("fs").readFileSync(0))[0].comments[0].author')
check "comment author comes from the token"    bob "$AUTHOR"
check "like without a token"                   401 "$(status -X POST "$URL/posts/$ID/likes" -H "$J" -d '{"author":"x"}')"
check "like with a token"                      200 "$(status -X POST "$URL/posts/$ID/likes" -H "Authorization: Bearer $TB" -H "$J" -d '{}')"
IMAGE=$(node -e 'process.stdout.write(JSON.stringify({content:"pic",image:"data:image/png;base64,"+Buffer.alloc(1000000).toString("base64")}))')
check "1 MB image fits the body limit"         201 "$(echo "$IMAGE" | status -X POST "$URL/posts" -H "Authorization: Bearer $TA" -H "$J" --data-binary @-)"
check "delete without a token"                 401 "$(status -X DELETE "$URL/posts/$ID")"
check "delete by another user"                 403 "$(status -X DELETE "$URL/posts/$ID" -H "Authorization: Bearer $TB")"
check "delete by the author"                   200 "$(status -X DELETE "$URL/posts/$ID" -H "Authorization: Bearer $TA")"
if grep -q 'pw-ann' "$DATA_DIR/users.json"; then check "passwords are hashed" hashed plain; else check "passwords are hashed" hashed hashed; fi

# A corrupt posts file must be left alone, not replaced with an empty list.
printf '[{"id":"keep-me"' > "$DATA_DIR/posts.json"
check "corrupt data file: request refused"     500 "$(status -X POST "$URL/posts" -H "Authorization: Bearer $TA" -H "$J" -d '{"content":"x"}')"
check "corrupt data file: left unchanged"      '[{"id":"keep-me"' "$(cat "$DATA_DIR/posts.json")"

[ -f server/users.json ] && check "real data folder untouched" absent present || check "real data folder untouched" absent absent
[ $FAILED -eq 0 ] && echo "All API checks passed." || echo "Some API checks FAILED."
exit $FAILED

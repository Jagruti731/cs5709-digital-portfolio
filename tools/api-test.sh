#!/usr/bin/env bash
# Checks the API server's security fixes with curl. Run from the repository root.
set -u
(cd server && PORT=5099 exec node index.js >/dev/null 2>&1) &
PID=$!; sleep 1.5
j() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
J='Content-Type: application/json'
token() { curl -s -X POST localhost:5099/auth/login -H "$J" -d "{\"username\":\"$1\",\"password\":\"$2\"}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).token'; }
echo "register                 $(j -X POST localhost:5099/auth/register -H "$J" -d '{"username":"ann","password":"pw-ann"}')  (expect 201)"
j -X POST localhost:5099/auth/register -H "$J" -d '{"username":"bob","password":"pw-bob"}' >/dev/null
echo "wrong password           $(j -X POST localhost:5099/auth/login -H "$J" -d '{"username":"ann","password":"x"}')  (expect 401)"
TA=$(token ann pw-ann); TB=$(token bob pw-bob)
ID=$(curl -s -X POST localhost:5099/posts -H "Authorization: Bearer $TA" -H "$J" -d '{"content":"hi"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
echo "delete without token     $(j -X DELETE localhost:5099/posts/$ID)  (expect 401)"
echo "delete by another user   $(j -X DELETE localhost:5099/posts/$ID -H "Authorization: Bearer $TB")  (expect 403)"
echo "delete by author         $(j -X DELETE localhost:5099/posts/$ID -H "Authorization: Bearer $TA")  (expect 200)"
grep -q 'pw-ann' server/users.json && echo "password stored in plain text: YES" || echo "password stored in plain text: no"
kill $PID; rm -f server/users.json server/sessions.json server/posts.json

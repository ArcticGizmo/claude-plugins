import { writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));

const { session_id, permission_mode } = input;
if (session_id && permission_mode) {
  writeFileSync(
    join(homedir(), ".claude", "sessions", `${session_id}.mode`),
    permission_mode
  );
}

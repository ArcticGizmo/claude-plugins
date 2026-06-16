import { execSync } from "child_process";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));

const eventType = process.argv[2] || "Unknown";
const { session_id, tool_name, message, transcript_path } = input;

// Derive a readable session label from the transcript path or session_id
let sessionLabel = session_id ? session_id.slice(0, 8) : "unknown";
if (transcript_path) {
  const parts = transcript_path.replace(/\\/g, "/").split("/");
  // transcript_path: ~/.claude/projects/{encoded-project-dir}/session.jsonl
  const projectDir = parts[parts.length - 2];
  if (projectDir) {
    // e.g. "C--Users-UserName-Documents-git-project-name" -> "project-name" (last segment)
    const segments = projectDir.split("-").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && last.length > 2) sessionLabel = last;
  }
}

function xmlEscape(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let title, body;
switch (eventType) {
  case "PermissionRequest":
    title = "Permission requested";
    body = `[${sessionLabel}] Allow use of ${tool_name || "tool"}?`;
    break;
  case "Stop":
    title = "Claude finished";
    body = `[${sessionLabel}] Task complete`;
    break;
  case "StopFailure":
    title = "Claude stopped with error";
    body = `[${sessionLabel}] Check the session for issues`;
    break;
  case "Notification":
    title = "Claude notification";
    body = `[${sessionLabel}] ${String(message || "").slice(0, 120)}`;
    break;
  default:
    title = "Claude Code";
    body = `[${sessionLabel}]`;
}

const toastXml = `<toast><visual><binding template="ToastGeneric"><text>${xmlEscape(title)}</text><text>${xmlEscape(body)}</text></binding></visual></toast>`;

const psScript = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
$xml.LoadXml('${toastXml.replace(/'/g, "''")}')
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show($toast)
`.trim();

// EncodedCommand avoids all shell-escaping concerns
const encoded = Buffer.from(psScript, "utf16le").toString("base64");
execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`, {
  stdio: "ignore",
  timeout: 5000,
});

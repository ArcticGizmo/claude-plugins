#!/usr/bin/env node
import { logToFile } from "./debug";
import { readFileSync } from "fs";

async function main() {
  try {
    // Read all input from standard input (stdin)
    const rawInput = readFileSync(0, 'utf-8');
    
    if (!rawInput.trim()) {
      console.error("No input received on stdin.");
      process.exit(1);
    }

    // Parse the Claude event JSON data
    const eventData = JSON.parse(rawInput);

    // Extract tool input details passed by Claude Code
    const toolName = eventData.tool_name;
    const toolInput = eventData.tool_input || {};
    
    // Example: Intercepting a Bash command
    if (toolName === 'Bash' && toolInput.command) {
      const command = toolInput.command;
      
      // Add custom validation or logic here
      if (command.includes('rm -rf')) {
        console.error("Dangerous command blocked by hook!");
        process.exit(2); // Exit code 2 blocks Claude and provides feedback
      }
    }

    // Exit 0 allows Claude to proceed smoothly
    process.exit(0);

  } catch (error) {
    console.error("Error parsing hook input:", error.message);
    process.exit(2);
  }
}

main();
#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const fs = require('node:fs');
const path = require('node:path');

// Target file: 'output.txt' in the same directory as this script
const filePath = path.join(__dirname, 'output.txt');

writeFileSync(filePath, 'lol');

process.exit(2)

// try {
//   // Read standard input (file descriptor 0)
//   const input = readFileSync(0, 'utf-8');
//   const context = JSON.parse(input);

//   console.log("Hook triggered for event:", context.event);
//   // Do something with context here

// } catch (error) {
//   console.error("Failed to parse Claude stdin:", error);
//   process.exit(1);
// }
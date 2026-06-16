import { appendFileSync } from 'node:fs';
import { join } from 'path';

export const logToFile = (pluginName, data) => {
  if (typeof data !== 'string') {
    data = JSON.stringify(data, undefined, 2);
  }
  // Constructs an absolute path relative to this script
  const filePath = join(import.meta.dirname, '..', `${pluginName}-debug.txt`);
  appendFileSync(filePath, data + '\n');
}
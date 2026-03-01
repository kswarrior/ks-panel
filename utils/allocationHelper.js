const { v4: uuidv4 } = require('uuid');

function parsePorts(input) {
  if (!input) return [];
  const ports = [];
  input.split(',').map(p => p.trim()).forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1024 && end <= 65535) {
        for (let i = start; i <= end; i++) ports.push(i);
      }
    } else {
      const num = Number(part);
      if (!isNaN(num) && num >= 1024 && num <= 65535) ports.push(num);
    }
  });
  return [...new Set(ports)]; // dedupe
}

module.exports = { parsePorts, uuidv4 }; // export for use

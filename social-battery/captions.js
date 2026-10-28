// Writes captions.srt from the CAPTIONS list in src/scene.js (for YouTube/TikTok caption upload).
const { CAPTIONS } = require('./src/scene.js'), fs = require('fs');
const ts = (s) => { const ms = Math.round(s * 1000), p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
fs.writeFileSync('captions.srt', CAPTIONS.map(([a, b, text], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${text}\n`).join('\n'));
console.log('wrote captions.srt');

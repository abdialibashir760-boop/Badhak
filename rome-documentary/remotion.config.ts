import { Config } from '@remotion/cli/config';
import fs from 'node:fs';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
// Use the system Chromium when the Remotion-managed one cannot be downloaded (e.g. restricted network).
for (const p of ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome']) if (fs.existsSync(p)) Config.setBrowserExecutable(p);

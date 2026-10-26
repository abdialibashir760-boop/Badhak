// Renders the YouTube thumbnails (1280×720 PNG) for both languages and both designs -> out/thumbnails/
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const browserExecutable = process.env.REMOTION_BROWSER || undefined;
mkdirSync('out/thumbnails', {recursive: true});
const serveUrl = await bundle({entryPoint: resolve('src/index.ts')});
for (const lang of ['en', 'tr']) {
  for (const variant of ['A', 'B']) {
    const inputProps = {lang, variant};
    const composition = await selectComposition({serveUrl, id: 'Thumbnail', inputProps, browserExecutable});
    const output = `out/thumbnails/thumbnail-${lang}-${variant}.png`;
    await renderStill({composition, serveUrl, output, frame: 0, inputProps, browserExecutable});
    console.log('wrote', output);
  }
}

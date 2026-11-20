// Regenerate every README visual (docs/) and the full-length videos (release-assets/, not tracked) from the code.
//   node tools/media.mjs [--docs-only]
// Each item is one call of tools/video.mjs, so the media are produced by the same deterministic exporter users run.
import {spawnSync} from 'node:child_process';
import {statSync} from 'node:fs';
import {path} from './lib.mjs';

const DOCS=[
 ['docs/hero.gif','--mode grid --fit --gif --from 10.2 --to 15.8 --fps 12 --width 960 --colors 160'],
 ['docs/mouth-closeup.gif','--mode closeup --strip --gif --from 12.3 --to 17.3 --fps 20 --width 640 --colors 128'],
 ['docs/styles.png','--mode grid --fit --still 13.6 --width 1600'],
 ['docs/stage-24.png','--mode stage --style kosoy3 --still 20.4 --width 1280'],
 ['docs/tempos.png','--mode tempos --style grani3 --still 6.1 --width 1280'],
 ['docs/mouth-shapes.png','--mode sheet --style kosoy3 --still 0 --width 1280'],
 ['docs/v1-pairs.png','--page v1.html --still 2.2 --width 1280'],
];
const RELEASE=[
 ['release-assets/all-12-styles.mp4','--mode grid --fps 30 --width 1920 --crf 20'],
 ['release-assets/mouth-closeup.mp4','--mode closeup --strip --fps 30 --width 1280 --crf 18'],
 ['release-assets/stage-24-tempo-B.mp4','--mode stage --style kosoy3 --fps 30 --width 1920 --crf 18'],
 ['release-assets/four-tempos-26.mp4','--mode tempos --style grani3 --fps 30 --width 1920 --crf 20'],
];
const jobs=process.argv.includes('--docs-only')?DOCS:[...DOCS,...RELEASE];
for(const [out,args] of jobs){
 const r=spawnSync(process.execPath,[path('tools/video.mjs'),'--out',path(out),...args.split(' ')],{stdio:'inherit'});
 if(r.status!==0)throw new Error('failed: '+out);
 console.log(`${out}: ${(statSync(path(out)).size/1e6).toFixed(2)} MB`);
}

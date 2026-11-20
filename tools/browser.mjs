// Headless browser helpers for the export and measurement tools (playwright-core driving an installed Chrome).
//   CHROME_PATH=<executable> overrides the browser; PW_CHANNEL picks a Playwright channel (default: chrome).
import {chromium} from 'playwright-core';

export const launch=()=>chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH,headless:true}:{channel:process.env.PW_CHANNEL||'chrome',headless:true});

/** Open render.html with the given mode and wait until the first frame is drawn. */
export async function openRenderer({mode='grid',style='kosoy3',tempo='chut',strip=false,fit=false,page:html='render.html',port},browser){
 const own=!browser;browser??=await launch();
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${port}/${html}?mode=${mode}&style=${style}&tempo=${tempo}${strip?'&strip=1':''}${fit?'&fit=1':''}`,{waitUntil:'load'});
 await page.waitForFunction(()=>window.__ready);const err=await page.evaluate(()=>window.__error);if(err)throw new Error(err);
 return {browser,page,errors,close:()=>own?browser.close():page.close()};
}

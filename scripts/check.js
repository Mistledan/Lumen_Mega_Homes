const {chromium}=require('playwright');
(async()=>{
  try{
    const b=await chromium.launch({headless:true});
    const p=await b.newPage();
    await p.goto('http://localhost:3002/',{waitUntil:'networkidle',timeout:30000});
    await p.waitForSelector('footer a[aria-label="Facebook"]',{timeout:5000});
    const has=await p.$$eval('footer a[aria-label]',e=>e.map(x=>x.getAttribute('aria-label')));
    console.log(has.join(','));
    await b.close();
  }catch(e){console.error('err');}
})();

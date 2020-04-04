const puppeteer = require('puppeteer');

(async () => {
  // launch browser
  const browser = await puppeteer.launch();
  // access to pasteuriser
  const page = await browser.newPage();
  await page.goto('http://www.dover.jp/?mode=cate&cbid=2437947&csid=1');
  
  // check pasteuriser product's status
  const pasteuriserList = await page.$('.first > .product-list');
  // results <Array <Object name: '',  stock_exists: true/false>>
  const results = await pasteuriserList.$$eval('.product-list__item > a > .product-name', (nodes) => {
    return nodes.map((n) => { 
			const obj = new Object();
			obj.name = n.innerText;
			obj.stock_exists = !n.innerText.includes('在庫なし');
			return obj;
		});
  });

  results.forEach(r => {
    if (r.stock_exists) notify(r);
  });

  // finish
  await browser.close();
})();

function notify() {
  console.log('not implemented');
}

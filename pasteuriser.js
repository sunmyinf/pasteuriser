const puppeteer = require('puppeteer');
const { LineClient } = require('messaging-api-line');

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

  if (results.some(r => r.stock_exists)) notify(results);

  // finish
  await browser.close();
})();

// @param results <Array<Object>>
function notify(results) {
  const client = LineClient.connect({
    accessToken: process.env.LINE_BOT_ACCESS_TOKEN,
    channelSecret: process.env.LINE_BOT_CHANNEL_SECRET,
  });
  const text = 'パストリーゼ在庫情報\n' + results.map(r => {
    if (r.stock_exists) return `・${r.name}: 在庫あるみたいだよ！`;
  }).filter(t => t).join('\n');

  client.pushText(process.env.LINE_SEND_USER_ID, text);
}

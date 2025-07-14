// 引入 puppeteer 库，用于控制无头浏览器
const puppeteer = require('puppeteer');

/**
 * 亚马逊商品数据爬虫主函数
 * @param {string} keyword - 要在亚马逊上搜索的关键词
 */
async function scrapeAmazon(keyword) {
  console.log('🚀 启动浏览器...');
  // 启动一个浏览器实例
  // { headless: false } 可以让浏览器界面显示出来，方便调试
  const browser = await puppeteer.launch({ headless: true });

  console.log('🌍 打开新页面...');
  // 创建一个新的页面
  const page = await browser.newPage();

  // 设置一个模拟的用户代理，防止被网站识别为爬虫
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  const url = 'https://www.amazon.com';
  console.log(`🧭 正在导航到 ${url}`);
  // 导航到亚马逊首页
  await page.goto(url, { waitUntil: 'networkidle2' }); // 等待网络空闲时再继续

  console.log(`✅ 成功访问: ${await page.title()}`);

  // 定位搜索框并输入关键词
  const searchInputSelector = '#twotabsearchtextbox';
  console.log(`🔍 正在搜索关键词: "${keyword}"`);
  await page.type(searchInputSelector, keyword);

  // 点击搜索按钮并等待导航完成
  const searchButtonSelector = '#nav-search-submit-button';
  await page.click(searchButtonSelector);
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log(`📊 搜索结果页面加载完成: ${await page.title()}`);

  // 截图以供调试，查看页面实际内容
  const screenshotPath = 'backend/search_results.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 已保存截图到: ${screenshotPath}`);

  // 提取商品数据
  const products = await page.evaluate(() => {
    const items = [];
    // 选择所有的搜索结果项
    document.querySelectorAll("div[data-component-type='s-search-result']").forEach(item => {
      const titleElement = item.querySelector('h2 a span');
      const priceElement = item.querySelector('.a-price .a-offscreen');
      const ratingElement = item.querySelector('.a-icon-alt');
      const reviewsCountElement = item.querySelector('span.a-size-base');

      // 提取数据，并处理可能不存在的情况
      const title = titleElement ? titleElement.innerText : null;
      const price = priceElement ? priceElement.innerText : null;
      // 评价和评论数通常在同一个父元素下，需要做更细致的判断
      let rating = null;
      let reviewsCount = null;

      if (ratingElement) {
        rating = ratingElement.innerText.split(' out of')[0]; // e.g., "4.5 out of 5 stars" -> "4.5"
      }
      if (reviewsCountElement && reviewsCountElement.innerText.match(/^\d/)) {
         reviewsCount = reviewsCountElement.innerText.replace(/,/g, ''); // "1,234" -> "1234"
      }
      
      // 只添加包含标题和价格的有效商品
      if (title && price) {
        items.push({
          title,
          price,
          rating,
          reviewsCount,
        });
      }
    });
    return items;
  });

  console.log(`📦 成功提取 ${products.length} 件商品`);
  console.log(products);


  console.log('🚪 关闭浏览器...');
  // 关闭浏览器
  await browser.close();

  return products;
}

// 主执行入口
// 使用自执行异步函数来运行爬虫
(async () => {
  try {
    // 使用 'tech gadgets' 作为测试关键词
    const products = await scrapeAmazon('tech gadgets');
    if (products && products.length > 0) {
        console.log('🎉 爬取任务成功完成!');
    } else {
        console.log('🤔 爬取任务完成，但未提取到商品数据。');
    }
  } catch (error) {
    console.error('❌ 爬取过程中发生错误:', error);
  }
})();

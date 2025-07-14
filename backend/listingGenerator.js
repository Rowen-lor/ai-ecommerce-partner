// 引入必要的库
const axios = require('axios');
require('dotenv').config(); // 加载 .env 文件中的环境变量

// 配置 DeepSeek API 的基本信息
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat'; // DeepSeek 推荐的模型，可以根据需要更换

/**
 * 使用 OpenAI API 生成产品标题
 * @param {object} productInfo - 包含产品信息的对象
 * @param {string} productInfo.keyword - 产品的主要关键词
 * @param {string} [productInfo.sellingPoints] - 产品的核心卖点，可选
 * @param {string} [productInfo.language='en'] - 目标语言，默认为英语
 * @param {string} [productInfo.brand] - 产品品牌，可选
 * @param {string} [productInfo.category] - 产品类别，可选
 * @returns {Promise<string|null>} - 生成的产品标题，如果出错则返回 null
 */
async function generateProductTitle({ keyword, sellingPoints, language = 'en', brand, category }) {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 错误: DEEPSEEK_API_KEY 未设置。请在 .env 文件中配置。');
    return null;
  }

  // 构建 Prompt
  let prompt = `You are an expert e-commerce copywriter. Generate a compelling and SEO-friendly product title in ${language} for the following product.`;
  prompt += `\n\nProduct Keyword: "${keyword}"`;
  if (brand) {
    prompt += `\nBrand: "${brand}"`;
  }
  if (category) {
    prompt += `\nCategory: "${category}"`;
  }
  if (sellingPoints) {
    prompt += `\nKey Selling Points: "${sellingPoints}"`;
  }
  prompt += `\n\nEnsure the title is concise, includes the main keyword, and highlights key benefits or features.`;
  prompt += `\n\nProduct Title:`;

  try {
    console.log('🚀 调用 DeepSeek API 生成产品标题...');
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 60, // 限制标题长度
      temperature: 0.7, // 控制创造性
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // 提取生成的标题
    const generatedTitle = response.data.choices[0]?.message?.content?.trim();

    if (generatedTitle) {
      console.log(`✅ 成功生成标题: "${generatedTitle}"`);
      return generatedTitle;
    } else {
      console.error('❌ DeepSeek API 返回了空的标题。');
      return null;
    }

  } catch (error) {
    console.error('❌ 调用 DeepSeek API 时发生错误:', error.response ? error.response.data : error.message);
    return null;
  }
}

// 示例用法 (用于本地测试)
async function testTitleGeneration() {
  const productDetails = {
    keyword: 'wireless earbuds',
    sellingPoints: 'noise cancelling, long battery life, comfortable fit',
    language: 'en',
    brand: 'AudioTech',
    category: 'Electronics'
  };
  const title = await generateProductTitle(productDetails);
  if (title) {
    console.log('\n--- Test Result ---');
    console.log('Generated Title:', title);
  }
}

// 如果直接运行此文件，则执行测试函数
if (require.main === module) {
  testTitleGeneration();
}

module.exports = {
  generateProductTitle,
};

// 引入必要的库
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // 指定 .env 文件路径

// 配置 DeepSeek API 的基本信息
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat'; // DeepSeek 推荐的模型，可以根据需要更换

/**
 * 使用 DeepSeek API 生成多个产品标题建议
 * @param {string} product_keywords - 产品的核心关键词
 * @returns {Promise<string[]|null>} - 生成的产品标题数组，如果出错则返回 null
 */
async function generateListingTitles(product_keywords) {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 错误: DEEPSEEK_API_KEY 未设置。请在 .env 文件中配置。');
    return null;
  }

  // 构建 Prompt
  const language = 'en'; // 默认为英文
  let prompt = `You are an expert Amazon copywriter. Your task is to generate 5 compelling and SEO-friendly product titles in ${language} for a product with the following keywords.`;
  prompt += `\n\nProduct Keywords: "${product_keywords}"`;
  prompt += `\n\nRules:
- Each title should be unique.
- Each title must include the core keywords.
- Titles should be optimized for Amazon's search algorithm.
- Return the 5 titles separated by a newline character (\\n).`;

  try {
    console.log('🚀 调用 DeepSeek API 生成产品标题...');
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert Amazon copywriter who provides a list of 5 product titles.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500, // 增加长度以容纳5个标题
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
    const content = response.data.choices[0]?.message?.content?.trim();

    if (content) {
      const titles = content.split('\n').map(t => t.replace(/^[0-9]+\.\s*/, '').trim()).filter(t => t);
      console.log(`✅ 成功生成 ${titles.length} 个标题。`);
      return titles;
    } else {
      console.error('❌ DeepSeek API 返回了空的内容。');
      return null;
    }

  } catch (error) {
    console.error('❌ 调用 DeepSeek API 时发生错误:', error.response ? error.response.data : error.message);
    return null;
  }
}

// (测试函数已删除，因为现在由 server.js 调用)

// 如果直接运行此文件，则执行测试函数
// (测试调用已删除)

module.exports = {
  generateListingTitles,
};

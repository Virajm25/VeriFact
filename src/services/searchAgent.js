const axios = require('axios');
const cheerio = require('cheerio');

exports.searchGoogle = async (query) => {
  console.log(`\n🔎 Searching the web for: "${query}"`);

  // We verify via DuckDuckGo (easier to scrape than Google)
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  try {
    // 1. Fetch the Search Result Page
    const { data } = await axios.get(url, {
      headers: {
        // We pretend to be a real browser so we don't get blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // 2. Parse HTML with Cheerio
    const $ = cheerio.load(data);
    const results = [];

    // 3. Extract Links (DuckDuckGo results use the class '.result__a')
    $('.result__a').each((i, element) => {
      const title = $(element).text();
      const link = $(element).attr('href');

      // We only want the top 3 valid links
      if (link && link.startsWith('http') && results.length < 3) {
        results.push({ title, link });
      }
    });

    console.log(`✅ Found ${results.length} sources.`);
    return results; // Returns an array like [{title: "...", link: "..."}, ...]

  } catch (error) {
    console.error("❌ Search Error:", error.message);
    return [];
  }
};
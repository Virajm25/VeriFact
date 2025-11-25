const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to scrape one specific URL
async function scrapePage(url) {
  try {
    // 1. Fetch the HTML
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      timeout: 5000 // Give up if it takes more than 5 seconds
    });

    // 2. Load HTML into Cheerio
    const $ = cheerio.load(data);

    // 3. Remove junk (Scripts, Styles, Ads, Navigation)
    $('script, style, nav, footer, header, aside, .ads').remove();

    // 4. Extract Text from Paragraphs
    // We map over all <p> tags and join them with spaces
    let text = $('p').map((i, el) => $(el).text()).get().join(' ');

    // 5. Clean up whitespace (remove extra spaces and newlines)
    text = text.replace(/\s+/g, ' ').trim();

    // 6. Limit length (AI can't read infinite text, limit to first 2000 chars per article)
    return text.slice(0, 2000);

  } catch (error) {
    console.error(`⚠️ Failed to scrape ${url}: ${error.message}`);
    return ""; // Return empty string so the whole process doesn't crash
  }
}

// Main function exported to the controller
exports.scrapeContent = async (urls) => {
  console.log(`\n🕷️ Scraping content from ${urls.length} sites...`);

  // Promise.all makes these run in PARALLEL (Fast!) instead of one by one (Slow)
  const scrapedTexts = await Promise.all(urls.map(url => scrapePage(url)));

  // Join all the text together into one big string for the AI
  const combinedText = scrapedTexts.join("\n\n--- NEXT SOURCE ---\n\n");
  
  console.log(`✅ Scraped ${combinedText.length} characters of text.`);
  return combinedText;
};
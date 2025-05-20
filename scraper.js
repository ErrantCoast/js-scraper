//version 1.0
// This script scrapes the OddsPortal website for reviews and extracts relevant information.
// It uses axios for HTTP requests and cheerio for parsing HTML.
// It saves the results in both JSON and TXT formats.
// It is designed to crawl the site deeply, starting from the /reviews/ section.
// It extracts the page title, meta description, and all headers (h1-h6) from each page.
// It also handles errors gracefully and logs them in the output.
// The script uses a user-agent string to mimic a real browser request.
/*
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://www.oddsportal.com';
const startPath = '/reviews/';
const startUrl = baseUrl + startPath;
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const visited = new Set();
const results = [];

async function scrapePage(url) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const res = await axios.get(url, { headers: { 'User-Agent': userAgent } });
    const $ = cheerio.load(res.data);

    // Collect headings for this page
    const pageHeaders = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      pageHeaders.push($(el).text().trim());
    });

    // Only save if there are headers
    if (pageHeaders.length > 0) {
      results.push(`\nHeaders from ${url}:`);
      pageHeaders.forEach(text => results.push('- ' + text));
    }

    // Recurse into /reviews/ links
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && /^\/reviews\/.*$/.test(href)) {
        const absoluteUrl = href.startsWith('http') ? href : baseUrl + href;
        scrapePage(absoluteUrl);
      }
    });

  } catch (err) {
    results.push(`Failed to scrape ${url}: ${err.message}`);
  }
}

// Helper to wait for all async tasks to finish before writing the file
async function main() {
  await scrapePage(startUrl);

  // Wait a bit to ensure all requests finish (due to asynchronous recursion).
  setTimeout(() => {
    fs.writeFileSync('output.txt', results.join('\n'), 'utf-8');
    console.log('Saved results to output.txt');
  }, 7000); // Adjust time for larger sites if needed
}

main();
*/
//-- version 1.2

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://www.soccer24.com';
const startPath = '/reviews/';
const startUrl = baseUrl + startPath;
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const visited = new Set();
const results = [];

async function scrapePage(url) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const res = await axios.get(url, { headers: { 'User-Agent': userAgent } });
    const $ = cheerio.load(res.data);

    // Extract headings
    const pageHeaders = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      pageHeaders.push($(el).text().trim());
    });

    // Extract title
    const pageTitle = $('title').first().text().trim();

    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    results.push({
      url,
      title: pageTitle,
      description: metaDescription,
      headers: pageHeaders
    });

    // Find links for deep crawling under /reviews/
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && /^\/reviews\/.*$/.test(href)) {
        const absoluteUrl = href.startsWith('http') ? href : baseUrl + href;
        scrapePage(absoluteUrl);
      }
    });

  } catch (err) {
    results.push({
      url,
      title: '',
      description: '',
      headers: [],
      error: `Failed to scrape: ${err.message}`
    });
  }
}

async function main() {
  await scrapePage(startUrl);

  setTimeout(() => {
    // Save as JSON
    fs.writeFileSync('output.json', JSON.stringify(results, null, 2), 'utf-8');

    // Save as TXT
    const outputTxt = results.map(r =>
      [
        `URL: ${r.url}`,
        `Title: ${r.title}`,
        `Description: ${r.description}`,
        (r.headers.length ? `Headers:\n${r.headers.map(h => `- ${h}`).join('\n')}` : ''),
        (r.error ? `Error: ${r.error}` : '')
      ].filter(Boolean).join('\n') + '\n'
    ).join('\n');
    fs.writeFileSync('output.txt', outputTxt, 'utf-8');

    console.log('Saved results to output.json and output.txt');
  }, 8000); // May adjust if crawling a large site
}

main();
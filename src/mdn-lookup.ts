import axios from 'axios';
import * as cheerio from 'cheerio';
import type { MDNSearchResponse, MDNLookupResult } from './types.js';

export async function lookupMDN(query: string): Promise<MDNLookupResult> {
  try {
    const searchUrl = `https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(query)}&locale=en-US`;
    const searchRes = await axios.get<MDNSearchResponse>(searchUrl);
    const results = searchRes.data.documents;

    if (!results.length) {
      return {
        success: false,
        message: "No documentation found for this query.",
        query
      };
    }

    const docUrl = `https://developer.mozilla.org${results[0].mdn_url}`;
    const docRes = await axios.get<string>(docUrl);
    const $ = cheerio.load(docRes.data);
    
    // Extracting just the first paragraph for quick overview
    const snippet = $('article p').first().text().trim();

    return {
      success: true,
      query,
      title: results[0].title,
      snippet,
      url: docUrl,
      summary: results[0].summary || snippet
    };
  } catch (error) {
    return {
      success: false,
      message: `Error fetching docs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      query
    };
  }
}
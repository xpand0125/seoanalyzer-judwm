import axios from 'axios';
import * as cheerio from 'cheerio';
import type { SEOAnalysis } from '../types/seo';
import { analyzeLinks } from './linkAnalyzer';

const CORS_PROXY = 'https://api.allorigins.win/get?url=';

export async function analyzeSEO(url: string): Promise<SEOAnalysis> {
  try {
    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format. Please enter a valid URL including http:// or https://');
    }

    const startTime = Date.now();
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(url)}`, {
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status === 200, // Only accept 200 status
    });

    if (!response.data || !response.data.contents) {
      throw new Error('Failed to fetch website content');
    }

    const loadTime = Date.now() - startTime;
    const html = response.data.contents;

    // Validate HTML content
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid website content received');
    }

    const $ = cheerio.load(html);

    // Basic SEO elements
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';

    // Headings analysis
    const headings = {
      h1: $('h1').map((_, el) => $(el).text()).get(),
      h2: $('h2').map((_, el) => $(el).text()).get(),
      h3: $('h3').map((_, el) => $(el).text()).get(),
    };

    // Images analysis
    const images = {
      total: $('img').length,
      withoutAlt: $('img:not([alt])').length,
      paths: $('img').map((_, el) => $(el).attr('src')).get(),
    };

    // Links analysis
    const links = {
      internal: $('a[href^="/"], a[href^="' + url + '"]')
        .map((_, el) => $(el).attr('href'))
        .get(),
      external: $('a[href^="http"]')
        .map((_, el) => $(el).attr('href'))
        .get(),
    };

    // Meta tags and Open Graph
    const meta = {
      hasViewport: $('meta[name="viewport"]').length > 0,
      hasCharset: $('meta[charset]').length > 0,
      robots: $('meta[name="robots"]').attr('content') || null,
      keywords: $('meta[name="keywords"]').attr('content') || null,
      author: $('meta[name="author"]').attr('content') || null,
      ogTags: {
        title: $('meta[property="og:title"]').attr('content') || null,
        description: $('meta[property="og:description"]').attr('content') || null,
        image: $('meta[property="og:image"]').attr('content') || null,
        url: $('meta[property="og:url"]').attr('content') || null,
      },
    };

    // Performance metrics
    const performance = {
      htmlSize: html.length,
      loadTime: loadTime,
    };

    // HTML Structure analysis
    const structure = {
      hasDoctype: html.toLowerCase().includes('<!doctype html>'),
      hasHtmlLang: $('html[lang]').length > 0,
      hasMainTag: $('main').length > 0,
      hasHeaderTag: $('header').length > 0,
      hasFooterTag: $('footer').length > 0,
      hasNavTag: $('nav').length > 0,
    };

    // Advanced analysis
    const advancedAnalysis = await analyzeLinks(url);

    return {
      title,
      description,
      headings,
      images,
      links,
      meta,
      performance,
      structure,
      advancedAnalysis,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Analysis error:', error.message);
      throw new Error(error.message);
    } else {
      console.error('Analysis error:', error);
      throw new Error('Failed to analyze website. Please try again.');
    }
  }
}
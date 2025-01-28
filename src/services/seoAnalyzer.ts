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
      timeout: 30000, // Increased timeout to 30 seconds
      validateStatus: (status) => status === 200,
      maxContentLength: 10 * 1024 * 1024, // 10MB max content size
      headers: {
        'Accept-Encoding': 'gzip, deflate',
      }
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

    // HTML Structure analysis
    const structure = {
      hasDoctype: html.toLowerCase().includes('<!doctype html>'),
      hasHtmlLang: $('html[lang]').length > 0,
      hasMainTag: $('main').length > 0,
      hasHeaderTag: $('header').length > 0,
      hasFooterTag: $('footer').length > 0,
      hasNavTag: $('nav').length > 0,
    };

    // Performance metrics
    const htmlSize = html.length;
    const performanceScore = calculatePerformanceScore(htmlSize, loadTime, structure);

    const performance = {
      htmlSize,
      loadTime,
      score: performanceScore.score,
      rating: performanceScore.rating,
      suggestions: performanceScore.suggestions
    };

    // Additional SEO metrics
    const seoScore = calculateSEOScore({
      title,
      description,
      headings,
      meta,
      images,
      structure
    });

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
      seoScore,
      advancedAnalysis
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
    throw new Error('SEO analysis failed');
  }
}

function calculatePerformanceScore(htmlSize: number, loadTime: number, structure: any) {
  const scores = {
    sizeScore: 0,
    loadTimeScore: 0,
    structureScore: 0,
    suggestions: [] as string[]
  };

  // HTML Size scoring (0-40 points)
  if (htmlSize < 100 * 1024) { // < 100KB
    scores.sizeScore = 40;
  } else if (htmlSize < 200 * 1024) { // < 200KB
    scores.sizeScore = 30;
  } else if (htmlSize < 500 * 1024) { // < 500KB
    scores.sizeScore = 20;
    scores.suggestions.push('Consider optimizing HTML size for better performance');
  } else {
    scores.sizeScore = 10;
    scores.suggestions.push('HTML size is too large, optimize your code');
  }

  // Load Time scoring (0-40 points)
  if (loadTime < 1000) { // < 1s
    scores.loadTimeScore = 40;
  } else if (loadTime < 2000) { // < 2s
    scores.loadTimeScore = 30;
  } else if (loadTime < 3000) { // < 3s
    scores.loadTimeScore = 20;
    scores.suggestions.push('Consider optimizing page load time');
  } else {
    scores.loadTimeScore = 10;
    scores.suggestions.push('Page load time is too high');
  }

  // Structure scoring (0-20 points)
  const structureScore = Object.values(structure).filter(Boolean).length * 3;
  scores.structureScore = Math.min(20, structureScore);

  const totalScore = scores.sizeScore + scores.loadTimeScore + scores.structureScore;
  
  return {
    score: totalScore,
    rating: totalScore >= 80 ? 'excellent' : totalScore >= 60 ? 'good' : totalScore >= 40 ? 'fair' : 'poor',
    suggestions: scores.suggestions
  };
}

function calculateSEOScore(data: any) {
  let score = 0;
  const suggestions: string[] = [];

  // Title analysis (0-20 points)
  if (data.title) {
    const titleLength = data.title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      score += 20;
    } else {
      score += 10;
      suggestions.push(titleLength < 30 ? 'Title is too short' : 'Title is too long');
    }
  } else {
    suggestions.push('Missing title tag');
  }

  // Description analysis (0-20 points)
  if (data.description) {
    const descLength = data.description.length;
    if (descLength >= 120 && descLength <= 160) {
      score += 20;
    } else {
      score += 10;
      suggestions.push(descLength < 120 ? 'Meta description is too short' : 'Meta description is too long');
    }
  } else {
    suggestions.push('Missing meta description');
  }

  // Headings analysis (0-20 points)
  if (data.headings.h1.length === 1) {
    score += 10;
  } else {
    suggestions.push(data.headings.h1.length === 0 ? 'Missing H1 tag' : 'Multiple H1 tags found');
  }
  if (data.headings.h2.length > 0) score += 5;
  if (data.headings.h3.length > 0) score += 5;

  // Images analysis (0-20 points)
  if (data.images.total > 0) {
    const altScore = (data.images.total - data.images.withoutAlt) / data.images.total * 20;
    score += altScore;
    if (data.images.withoutAlt > 0) {
      suggestions.push(`${data.images.withoutAlt} images missing alt text`);
    }
  }

  // Meta tags (0-20 points)
  if (data.meta.hasViewport) score += 5;
  if (data.meta.hasCharset) score += 5;
  if (data.meta.keywords) score += 5;
  if (Object.values(data.meta.ogTags).some(val => val !== null)) score += 5;
  
  return {
    score: Math.round(score),
    rating: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
    suggestions
  };
}
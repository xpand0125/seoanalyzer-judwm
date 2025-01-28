import axios from 'axios';
import * as cheerio from 'cheerio';
import type { SEOAnalysis } from '../types/seo';
import { analyzeLinks } from './linkAnalyzer';

// Try different CORS proxies if one fails
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://cors.bridged.cc/'
];

export async function analyzeSEO(url: string): Promise<SEOAnalysis> {
  try {
    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format. Please enter a valid URL including http:// or https://');
    }

    let html = '';
    let loadTime = 0;
    let proxyUsed = '';

    // Try each proxy until one works
    for (const proxy of CORS_PROXIES) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${proxy}${encodeURIComponent(url)}`, {
          timeout: 20000, // Increased timeout to 20 seconds
          validateStatus: (status) => status === 200,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (response.data) {
          html = proxy.includes('allorigins') ? response.data.contents : response.data;
          loadTime = Date.now() - startTime;
          proxyUsed = proxy;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!html) {
      throw new Error('Failed to fetch website content. The site might be too large or blocking our request.');
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

    // Analyze links
    const internalLinks = new Set<string>();
    const externalLinks = new Set<string>();
    const internalPaths: string[] = [];
    const externalDomains: string[] = [];
    let socialCount = 0;
    let nofollowCount = 0;

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      
      const rel = $(el).attr('rel');
      const isNofollow = rel && rel.includes('nofollow');
      if (isNofollow) nofollowCount++;
      
      try {
        const linkUrl = new URL(href, url);
        const isSameHost = linkUrl.hostname === new URL(url).hostname;
        
        // Check if it's a social media link
        const isSocial = linkUrl.hostname.match(
          /facebook\.com|twitter\.com|instagram\.com|linkedin\.com|youtube\.com|pinterest\.com/i
        );
        
        if (isSocial) socialCount++;
        
        if (isSameHost) {
          internalLinks.add(linkUrl.pathname);
          internalPaths.push(linkUrl.pathname);
        } else if (linkUrl.protocol.startsWith('http')) {
          externalLinks.add(linkUrl.hostname);
          externalDomains.push(linkUrl.hostname);
        }
      } catch {
        // If URL parsing fails, assume it's an internal link
        if (href.startsWith('/')) {
          internalLinks.add(href);
          internalPaths.push(href);
        }
      }
    });

    const links = {
      internal: {
        total: $('a[href^="/"]').length,
        unique: internalLinks.size,
        paths: internalPaths
      },
      external: {
        total: $('a[href^="http"]').length,
        unique: externalLinks.size,
        social: socialCount,
        nofollow: nofollowCount,
        domains: externalDomains
      }
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

    // Calculate content quality score
    const wordCount = $('body').text().trim().split(/\s+/).length;
    const paragraphs = $('p').length;
    const lists = $('ul, ol').length;
    const tables = $('table').length;
    const hasSchema = html.includes('application/ld+json') || html.includes('itemtype');
    
    const contentScore = {
      wordCount,
      readingTime: Math.ceil(wordCount / 200), // Average reading speed of 200 words per minute
      hasStructuredData: hasSchema,
      contentStructure: {
        paragraphs,
        lists,
        tables
      }
    };

    // Performance metrics
    const htmlSize = html.length;
    const cssFiles = $('link[rel="stylesheet"]').length;
    const jsFiles = $('script[src]').length;
    const inlineStyles = $('style').length + $('[style]').length;
    const inlineScripts = $('script:not([src])').length;

    const performance = {
      htmlSize,
      loadTime,
      resourceCounts: {
        css: cssFiles,
        js: jsFiles,
        inlineStyles,
        inlineScripts
      },
      score: calculatePerformanceScore({
        htmlSize,
        loadTime,
        cssFiles,
        jsFiles,
        inlineStyles,
        inlineScripts
      })
    };

    // HTML Structure
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
      contentScore,
      advancedAnalysis
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
    throw new Error('SEO analysis failed');
  }
}

function calculatePerformanceScore(metrics: {
  htmlSize: number;
  loadTime: number;
  cssFiles: number;
  jsFiles: number;
  inlineStyles: number;
  inlineScripts: number;
}): { score: number; rating: 'poor' | 'fair' | 'good'; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  // HTML Size (ideal < 100KB)
  if (metrics.htmlSize > 150000) {
    score -= 20;
    issues.push('HTML size is too large (>150KB)');
  } else if (metrics.htmlSize > 100000) {
    score -= 10;
    issues.push('HTML size is slightly large (>100KB)');
  }

  // Load Time (ideal < 3s)
  if (metrics.loadTime > 5000) {
    score -= 20;
    issues.push('Load time is too high (>5s)');
  } else if (metrics.loadTime > 3000) {
    score -= 10;
    issues.push('Load time is slightly high (>3s)');
  }

  // Resource counts
  if (metrics.cssFiles > 5) {
    score -= 10;
    issues.push('Too many CSS files');
  }
  if (metrics.jsFiles > 10) {
    score -= 10;
    issues.push('Too many JavaScript files');
  }
  if (metrics.inlineStyles > 5) {
    score -= 5;
    issues.push('Too many inline styles');
  }
  if (metrics.inlineScripts > 5) {
    score -= 5;
    issues.push('Too many inline scripts');
  }

  // Ensure score stays within 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    rating: score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor',
    issues
  };
}
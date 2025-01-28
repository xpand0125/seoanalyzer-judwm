import axios from 'axios';
import * as cheerio from 'cheerio';
import Moz from 'moz-api-wrapper';

export interface LinkAnalysis {
  brokenLinks: {
    total: number;
    urls: string[];
  };
  backlinks: {
    total: number;
    dofollow: number;
    nofollow: number;
  };
  niche: string[];
  mozMetrics: {
    domainAuthority: number;
    pageAuthority: number;
    spamScore: number;
  };
}

// Free API for backlink data
const BACKLINK_API = 'https://openpagerank.com/api/v1.0/getPageRank';

// Initialize Moz client - requires API credentials
const mozClient = new Moz({
  accessId: process.env.MOZ_ACCESS_ID || '',
  secretKey: process.env.MOZ_SECRET_KEY || ''
});

export async function analyzeBrokenLinks(urls: string[]): Promise<string[]> {
  const brokenLinks: string[] = [];
  
  const checkPromises = urls.map(async (url) => {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: null,
        maxRedirects: 5
      });
      
      // Consider 4xx and 5xx as broken links
      if (response.status >= 400) {
        return url;
      }
      return null;
    } catch {
      return url;
    }
  });
  
  const results = await Promise.allSettled(checkPromises);
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      brokenLinks.push(result.value);
    }
  });
  
  return brokenLinks;
}

export async function getMozMetrics(url: string) {
  try {
    if (!mozClient.accessId || !mozClient.secretKey) {
      return {
        domainAuthority: 0,
        pageAuthority: 0,
        spamScore: 0
      };
    }

    const metrics = await mozClient.urlMetrics(url, ['da', 'pa', 'spam_score']);
    return {
      domainAuthority: metrics.da || 0,
      pageAuthority: metrics.pa || 0,
      spamScore: metrics.spam_score || 0
    };
  } catch (error) {
    console.error('Failed to fetch Moz metrics:', error);
    return {
      domainAuthority: 0,
      pageAuthority: 0,
      spamScore: 0
    };
  }
}

export async function analyzeLinks(url: string): Promise<LinkAnalysis> {
  try {
    const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const html = response.data.contents;
    const $ = cheerio.load(html);
    
    // Get all links
    const links = $('a[href^="http"]').map((_, el) => $(el).attr('href')).get();
    
    // Check for broken links
    const brokenLinks = await analyzeBrokenLinks(links);
    
    // Analyze follow/nofollow
    const allLinks = $('a[href^="http"]');
    let dofollow = 0;
    let nofollow = 0;
    
    allLinks.each((_, el) => {
      const rel = $(el).attr('rel');
      if (rel && rel.includes('nofollow')) {
        nofollow++;
      } else {
        dofollow++;
      }
    });
    
    // Detect niche based on keywords and content
    const content = $('body').text().toLowerCase();
    const metaKeywords = $('meta[name="keywords"]').attr('content')?.toLowerCase() || '';
    const title = $('title').text().toLowerCase();
    
    const niches = [
      'technology', 'health', 'finance', 'education', 'entertainment',
      'travel', 'food', 'fashion', 'sports', 'business'
    ];
    
    const detectedNiches = niches.filter(niche => 
      content.includes(niche) || 
      metaKeywords.includes(niche) || 
      title.includes(niche)
    );
    
    // Get Moz metrics
    const mozMetrics = await getMozMetrics(url);
    
    return {
      brokenLinks: {
        total: brokenLinks.length,
        urls: brokenLinks
      },
      backlinks: {
        total: allLinks.length,
        dofollow,
        nofollow
      },
      niche: detectedNiches.length > 0 ? detectedNiches : ['unknown'],
      mozMetrics
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Link analysis failed: ${error.message}`);
    }
    throw new Error('Link analysis failed');
  }
}
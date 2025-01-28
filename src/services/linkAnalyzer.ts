import axios from 'axios';
import * as cheerio from 'cheerio';

export interface LinkAnalysis {
  linkMetrics: {
    internal: {
      total: number;
      unique: number;
    };
    external: {
      total: number;
      unique: number;
      social: number;
      nofollow: number;
    };
  };
  niche: string[];
  traffic: {
    score: number;
    level: 'low' | 'medium' | 'high';
  };
}

export async function analyzeLinks(url: string): Promise<LinkAnalysis> {
  try {
    const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const html = response.data.contents;
    const $ = cheerio.load(html);
    
    // Analyze internal and external links
    const allLinks = $('a[href]');
    const internalLinks = new Set<string>();
    const externalLinks = new Set<string>();
    let socialCount = 0;
    let nofollowCount = 0;
    
    allLinks.each((_, el) => {
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
        } else if (linkUrl.protocol.startsWith('http')) {
          externalLinks.add(linkUrl.hostname);
        }
      } catch {
        // If URL parsing fails, assume it's an internal link
        if (href.startsWith('/')) {
          internalLinks.add(href);
        }
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

    // Calculate traffic score based on content and link metrics
    const contentLength = content.length;
    const hasAnalytics = html.includes('google-analytics') || html.includes('gtag');
    
    let trafficScore = 0;
    trafficScore += Math.min(100, contentLength / 1000); // Content length score (max 100)
    trafficScore += Math.min(50, externalLinks.size * 2); // External links score (max 50)
    trafficScore += socialCount * 10; // Social presence score (10 per platform)
    trafficScore += hasAnalytics ? 30 : 0; // Analytics presence score
    
    // Normalize score to 0-100
    trafficScore = Math.min(100, trafficScore);
    
    const trafficLevel = trafficScore < 40 ? 'low' : trafficScore < 70 ? 'medium' : 'high';
    
    return {
      linkMetrics: {
        internal: {
          total: $('a[href^="/"]').length,
          unique: internalLinks.size
        },
        external: {
          total: $('a[href^="http"]').length,
          unique: externalLinks.size,
          social: socialCount,
          nofollow: nofollowCount
        }
      },
      niche: detectedNiches.length > 0 ? detectedNiches : ['unknown'],
      traffic: {
        score: Math.round(trafficScore),
        level: trafficLevel
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Link analysis failed: ${error.message}`);
    }
    throw new Error('Link analysis failed');
  }
}
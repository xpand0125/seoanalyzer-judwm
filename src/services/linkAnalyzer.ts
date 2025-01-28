import axios from 'axios';
import * as cheerio from 'cheerio';

export interface LinkAnalysis {
  backlinks: {
    total: number;
    dofollow: number;
    nofollow: number;
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

    // Simple traffic score based on content length, links, and social presence
    const contentLength = content.length;
    const socialLinks = $('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]').length;
    const hasAnalytics = html.includes('google-analytics') || html.includes('gtag');
    
    let trafficScore = 0;
    trafficScore += Math.min(100, contentLength / 1000); // Content length score (max 100)
    trafficScore += Math.min(50, allLinks.length * 2); // Links score (max 50)
    trafficScore += socialLinks * 10; // Social presence score (10 per platform)
    trafficScore += hasAnalytics ? 30 : 0; // Analytics presence score
    
    // Normalize score to 0-100
    trafficScore = Math.min(100, trafficScore);
    
    const trafficLevel = trafficScore < 40 ? 'low' : trafficScore < 70 ? 'medium' : 'high';
    
    return {
      backlinks: {
        total: allLinks.length,
        dofollow,
        nofollow
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
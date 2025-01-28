export interface SEOAnalysis {
  title: string;
  description: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: {
    total: number;
    withoutAlt: number;
    paths: string[];
  };
  links: {
    internal: string[];
    external: string[];
  };
  meta: {
    hasViewport: boolean;
    hasCharset: boolean;
    robots: string | null;
    keywords: string | null;
    author: string | null;
    ogTags: {
      title: string | null;
      description: string | null;
      image: string | null;
      url: string | null;
    };
  };
  performance: {
    htmlSize: number;
    loadTime: number;
    resourceCounts: {
      css: number;
      js: number;
      inlineStyles: number;
      inlineScripts: number;
    };
    score: {
      score: number;
      rating: 'poor' | 'fair' | 'good';
      issues: string[];
    };
  };
  structure: {
    hasDoctype: boolean;
    hasHtmlLang: boolean;
    hasMainTag: boolean;
    hasHeaderTag: boolean;
    hasFooterTag: boolean;
    hasNavTag: boolean;
  };
  contentScore: {
    wordCount: number;
    readingTime: number;
    hasStructuredData: boolean;
    contentStructure: {
      paragraphs: number;
      lists: number;
      tables: number;
    };
  };
  advancedAnalysis?: {
    backlinks: {
      total: number;
      dofollow: number;
      nofollow: number;
    };
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
  };
}
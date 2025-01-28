export interface SEOAnalysis {
  title: string;
  description: string;
  meta: MetaInfo[];
  headings: HeadingInfo[];
  images: ImageInfo[];
  links: LinkInfo[];
  structure: StructureInfo;
  performance: PerformanceInfo;
  seoScore: ScoreInfo;
  contentScore: ScoreInfo;
  contentAnalysis: ContentAnalysis;
  securityHeaders: SecurityHeaders;
  accessibility: AccessibilityInfo;
  advancedAnalysis?: AdvancedAnalysis;
}

export interface MetaInfo {
  name: string;
  content: string;
}

export interface HeadingInfo {
  level: number;
  text: string;
  count: number;
}

export interface ImageInfo {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export interface LinkInfo {
  href: string;
  text: string;
  isInternal: boolean;
  isDofollow: boolean;
}

export interface StructureInfo {
  hasDoctype: boolean;
  hasViewport: boolean;
  hasCharset: boolean;
  hasLanguage: boolean;
}

export interface PerformanceInfo {
  htmlSize: number;
  loadTime: number;
  score: number;
  rating: string;
  suggestions: string[];
}

export interface ScoreInfo {
  score: number;
  rating: string;
  suggestions: string[];
}

export interface ContentAnalysis {
  wordCount: number;
  paragraphs: number;
  readingTime: number;
  textToHtmlRatio: string;
  hasSchema: boolean;
  hasCanonical: boolean;
  hasFavicon: boolean;
  hasCustom404: boolean;
  hasSitemap: boolean;
  mobileResponsive: boolean;
  hasSSL: boolean;
  socialTags: {
    facebook: boolean;
    twitter: boolean;
    linkedin: boolean;
  };
}

export interface SecurityHeaders {
  hasHSTS: boolean;
  hasXFrame: boolean;
  hasCSP: boolean;
  hasXSS: boolean;
}

export interface AccessibilityInfo {
  hasAriaLabels: boolean;
  hasAltText: boolean;
  hasSkipLinks: boolean;
  hasLangAttribute: boolean;
  hasAccessibleForms: boolean;
}

export interface AdvancedAnalysis {
  trafficPotential: {
    score: number;
    rating: string;
    factors: {
      name: string;
      value: string;
      impact: string;
    }[];
  };
  backlinks: {
    count: number;
    quality: string;
    domains: string[];
  };
  niche: {
    category: string;
    confidence: number;
    keywords: string[];
  };
}
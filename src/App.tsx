import React, { useState, useEffect } from 'react';
import { Search, Activity, Image, Link2, FileText, AlertTriangle, Layout, Share2, Globe, Compass, Moon, Sun, Award, Shield } from 'lucide-react';
import { analyzeSEO } from './services/seoAnalyzer';
import type { SEOAnalysis } from './types/seo';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await analyzeSEO(url);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze website. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-500 bg-red-100 dark:bg-red-900/30';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark:bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`transition-colors duration-200 ${darkMode ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-white'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <span className={`ml-2 text-xl font-bold ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                SEO Analyzer by Judwm
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'dark:text-gray-100 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${analysis ? 'mb-8' : 'flex min-h-[calc(100vh-12rem)] items-center justify-center'}`}>
          <div className={`${analysis ? 'w-full' : 'w-full max-w-[500px]'} ${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 transition-all duration-300`}>
            <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode
                    ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400'
                    : 'border border-gray-300'
                }`}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Search className="mr-2 h-5 w-5" />
                    Analyze
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className={`${darkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-8`}>
            <div className="flex">
              <AlertTriangle className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-400'}`} />
              <p className={`ml-3 ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall SEO Score */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 col-span-full`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                Overall SEO Score
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(analysis.seoScore.score)}`}>
                    {analysis.seoScore.rating.toUpperCase()}
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {analysis.seoScore.score}/100
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      style={{ width: `${analysis.seoScore.score}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor(analysis.seoScore.score)}`}
                    ></div>
                  </div>
                </div>
                {analysis.seoScore.suggestions.length > 0 && (
                  <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Suggestions for Improvement:</h3>
                    <ul className={`list-disc pl-5 space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {analysis.seoScore.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                Performance Metrics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(analysis.performance.score)}`}>
                    {analysis.performance.rating.toUpperCase()}
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {analysis.performance.score}/100
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      style={{ width: `${analysis.performance.score}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor(analysis.performance.score)}`}
                    ></div>
                  </div>
                </div>
                <div className={`grid grid-cols-2 gap-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div>
                    <span className="font-medium">Page Size:</span>
                    <span className="ml-2">{(analysis.performance.htmlSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div>
                    <span className="font-medium">Load Time:</span>
                    <span className="ml-2">{(analysis.performance.loadTime / 1000).toFixed(2)}s</span>
                  </div>
                </div>
                {analysis.performance.suggestions.length > 0 && (
                  <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Performance Issues:</h3>
                    <ul className={`list-disc pl-5 space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {analysis.performance.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Information */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Meta Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Title</h3>
                  <p className="mt-1 text-gray-600">{analysis.title || 'No title found'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Description</h3>
                  <p className="mt-1 text-gray-600">{analysis.description || 'No description found'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Meta Tags</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="text-gray-600">
                      Viewport: {analysis.meta.hasViewport ? '✅' : '❌'}
                    </li>
                    <li className="text-gray-600">
                      Charset: {analysis.meta.hasCharset ? '✅' : '❌'}
                    </li>
                    <li className="text-gray-600">
                      Robots: {analysis.meta.robots || 'Not specified'}
                    </li>
                    <li className="text-gray-600">
                      Keywords: {analysis.meta.keywords || 'Not specified'}
                    </li>
                    <li className="text-gray-600">
                      Author: {analysis.meta.author || 'Not specified'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Share2 className="h-5 w-5 mr-2 text-indigo-600" />
                Social Media
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Open Graph Tags</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="text-gray-600">
                      OG Title: {analysis.meta.ogTags.title || 'Not specified'}
                    </li>
                    <li className="text-gray-600">
                      OG Description: {analysis.meta.ogTags.description || 'Not specified'}
                    </li>
                    <li className="text-gray-600">
                      OG Image: {analysis.meta.ogTags.image || 'Not specified'}
                    </li>
                    <li className="text-gray-600">
                      OG URL: {analysis.meta.ogTags.url || 'Not specified'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Images Analysis */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Image className="h-5 w-5 mr-2 text-indigo-600" />
                Images Analysis
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Statistics</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="text-gray-600">Total Images: {analysis.images.total}</li>
                    <li className="text-gray-600">Images without alt text: {analysis.images.withoutAlt}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Links Analysis */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Link2 className="h-5 w-5 mr-2 text-indigo-600" />
                Links Analysis
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Statistics</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="text-gray-600">
                      Internal Links: {analysis.links.internal.length}
                    </li>
                    <li className="text-gray-600">
                      External Links: {analysis.links.external.length}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HTML Structure */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Layout className="h-5 w-5 mr-2 text-indigo-600" />
                HTML Structure
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Semantic HTML</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="text-gray-600">
                      Doctype: {analysis.structure.hasDoctype ? '✅' : '❌'}
                    </li>
                    <li className="text-gray-600">
                      HTML Lang: {analysis.structure.hasHtmlLang ? '✅' : '❌'}
                    </li>
                    <li className="text-gray-600">
                      Main Tag: {analysis.structure.hasMainTag ? '✅' : '❌'}
                    </li>
                    <li className="text-gray-600">
                      Header Tag: {analysis.structure.hasHeaderTag ? '✅' : '❌'}
                    </li>
                    <li className="text-gray-600">
                      Footer Tag: {analysis.structure.hasFooterTag ? '✅' : '❌'}
                    </li>
                    <li className="text-gray-600">
                      Nav Tag: {analysis.structure.hasNavTag ? '✅' : '❌'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Advanced Analysis */}
            {analysis.advancedAnalysis && (
              <>
                {/* Traffic Analysis */}
                <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Traffic Potential
                  </h2>
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                            analysis.advancedAnalysis.traffic.level === 'high' 
                              ? 'text-green-600 bg-green-200' 
                              : analysis.advancedAnalysis.traffic.level === 'medium'
                              ? 'text-yellow-600 bg-yellow-200'
                              : 'text-red-600 bg-red-200'
                          }`}>
                            {analysis.advancedAnalysis.traffic.level}
                          </span>
                        </div>
                        <div className={`text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="text-sm font-semibold inline-block">
                            {analysis.advancedAnalysis.traffic.score}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ width: `${analysis.advancedAnalysis.traffic.score}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            analysis.advancedAnalysis.traffic.level === 'high'
                              ? 'bg-green-500'
                              : analysis.advancedAnalysis.traffic.level === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Traffic potential is calculated based on content quality, social presence, and site structure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Backlinks Analysis */}
                <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                    <Link2 className="h-5 w-5 mr-2 text-indigo-600" />
                    Backlinks Analysis
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700">Statistics</h3>
                      <ul className="mt-1 space-y-1">
                        <li className="text-gray-600">
                          Total Backlinks: {analysis.advancedAnalysis.backlinks.total}
                        </li>
                        <li className="text-gray-600">
                          Dofollow Links: {analysis.advancedAnalysis.backlinks.dofollow}
                        </li>
                        <li className="text-gray-600">
                          Nofollow Links: {analysis.advancedAnalysis.backlinks.nofollow}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Website Niche */}
                <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                    <Compass className="h-5 w-5 mr-2 text-indigo-600" />
                    Website Niche
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700">Detected Niches</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.advancedAnalysis.niche.map((niche, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            {niche}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Content Analysis */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Content Analysis
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(analysis.contentScore.score)}`}>
                    {analysis.contentScore.rating.toUpperCase()}
                  </span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {analysis.contentScore.score}/100
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      style={{ width: `${analysis.contentScore.score}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor(analysis.contentScore.score)}`}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Content Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Word Count:</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{analysis.contentAnalysis.wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Paragraphs:</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{analysis.contentAnalysis.paragraphs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reading Time:</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{analysis.contentAnalysis.readingTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Text/HTML Ratio:</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{analysis.contentAnalysis.textToHtmlRatio}%</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Technical Checks</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Schema Markup', value: analysis.contentAnalysis.hasSchema },
                        { label: 'Canonical Tag', value: analysis.contentAnalysis.hasCanonical },
                        { label: 'Sitemap', value: analysis.contentAnalysis.hasSitemap },
                        { label: 'Custom 404', value: analysis.contentAnalysis.hasCustom404 },
                        { label: 'Mobile Responsive', value: analysis.contentAnalysis.mobileResponsive },
                        { label: 'SSL Enabled', value: analysis.contentAnalysis.hasSSL },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}:</span>
                          <span className={`flex items-center ${item.value ? 'text-green-500' : 'text-red-500'}`}>
                            {item.value ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Accessibility */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                Security & Accessibility
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Security Headers</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'HSTS', value: analysis.securityHeaders.hasHSTS },
                      { label: 'X-Frame-Options', value: analysis.securityHeaders.hasXFrame },
                      { label: 'Content-Security-Policy', value: analysis.securityHeaders.hasCSP },
                      { label: 'XSS Protection', value: analysis.securityHeaders.hasXSS },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}:</span>
                        <span className={`flex items-center ${item.value ? 'text-green-500' : 'text-red-500'}`}>
                          {item.value ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Accessibility</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'ARIA Labels', value: analysis.accessibility.hasAriaLabels },
                      { label: 'Image Alt Text', value: analysis.accessibility.hasAltText },
                      { label: 'Skip Links', value: analysis.accessibility.hasSkipLinks },
                      { label: 'Language Attribute', value: analysis.accessibility.hasLangAttribute },
                      { label: 'Accessible Forms', value: analysis.accessibility.hasAccessibleForms },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}:</span>
                        <span className={`flex items-center ${item.value ? 'text-green-500' : 'text-red-500'}`}>
                          {item.value ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Integration */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-gray-100' : 'text-gray-900'}`}>
                <Share2 className="h-5 w-5 mr-2 text-indigo-600" />
                Social Media Integration
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Facebook', icon: 'facebook', value: analysis.contentAnalysis.socialTags.facebook },
                  { name: 'Twitter', icon: 'twitter', value: analysis.contentAnalysis.socialTags.twitter },
                  { name: 'LinkedIn', icon: 'linkedin', value: analysis.contentAnalysis.socialTags.linkedin },
                ].map((platform) => (
                  <div
                    key={platform.name}
                    className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} flex flex-col items-center justify-center space-y-2`}
                  >
                    <span className={`text-2xl ${platform.value ? 'text-indigo-500' : 'text-gray-400'}`}>
                      <i className={`fab fa-${platform.icon}`}></i>
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {platform.name}
                    </span>
                    <span className={`text-xs ${platform.value ? 'text-green-500' : 'text-red-500'}`}>
                      {platform.value ? 'Integrated' : 'Not Found'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
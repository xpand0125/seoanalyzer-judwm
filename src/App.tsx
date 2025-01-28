import React, { useState, useEffect } from 'react';
import { Search, Activity, Image, Link2, FileText, AlertTriangle, Layout, Share2, Globe, Compass, Moon, Sun } from 'lucide-react';
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

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark:bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`transition-colors duration-200 ${darkMode ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-white'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <span className={`ml-2 text-xl font-bold ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
                SEO Analyzer by Judwm
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'dark:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
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
                    ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
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
              <AlertTriangle className={`h-5 w-5 ${darkMode ? 'text-red-500' : 'text-red-400'}`} />
              <p className={`ml-3 ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Information */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
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
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
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
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
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
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
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
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
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

            {/* Performance Metrics */}
            <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                Performance Metrics
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Page Size</h3>
                  <p className="mt-1 text-gray-600">
                    {(analysis.performance.htmlSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Load Time</h3>
                  <p className="mt-1 text-gray-600">
                    {analysis.performance.loadTime.toFixed(2)} ms
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Analysis */}
            {analysis.advancedAnalysis && (
              <>
                {/* Broken Links */}
                <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
                    <Globe className="h-5 w-5 mr-2 text-indigo-600" />
                    Broken Links
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700">Statistics</h3>
                      <p className="mt-1 text-gray-600">
                        Total Broken Links: {analysis.advancedAnalysis.brokenLinks.total}
                      </p>
                      {analysis.advancedAnalysis.brokenLinks.total > 0 && (
                        <div className="mt-2">
                          <h4 className="font-medium text-gray-700">Broken URLs:</h4>
                          <ul className="mt-1 space-y-1 text-sm text-gray-600">
                            {analysis.advancedAnalysis.brokenLinks.urls.map((url, index) => (
                              <li key={index} className="truncate">{url}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Backlinks Analysis */}
                <div className={`${darkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
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
                  <h2 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'dark:text-white' : 'text-gray-900'}`}>
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
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
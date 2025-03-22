// netlify/functions/search-code.js
require('dotenv').config();
const { Octokit } = require("@octokit/rest");
const { searchAndProcessCode } = require('../../src/github_code_finder.js');

// Serverless function handler
exports.handler = async (event, context) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }
    
    // Safely parse JSON with error handling
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message })
      };
    }
    
    const query = requestBody.query;
    const language = requestBody.language;
    const maxResults = requestBody.max_results || 10;
    const minStars = requestBody.min_stars || 0;
    const contextLines = requestBody.context_lines || 5;

    // Validate required parameters
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    console.log(`Searching for: ${query} in ${language || 'any language'}, minStars: ${minStars}`);

    // Get GitHub token from environment variables
    let githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
    
    if (!githubToken) {
      console.log('GitHub token not found in environment variables');
      // Fall back to mock data in development mode or if token is missing
      if (process.env.NODE_ENV === 'development' || !githubToken) {
        console.log('Using mock data as fallback');
        const mockResults = generateMockResults(query, language, maxResults);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            results: mockResults,
            meta: {
              mode: 'mock',
              query,
              language: language || 'any',
              resultsCount: mockResults.length,
              searchTime: new Date().toISOString()
            }
          })
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'GitHub token not configured',
            details: 'Please set GITHUB_TOKEN in environment variables.'
          })
        };
      }
    }
    
    // Initialize Octokit with GitHub token 
    const octokit = new Octokit({
      auth: githubToken
    });

    try {
      // Process the search using our GitHub code finder
      const results = await searchAndProcessCode(
        octokit,
        query,
        language,
        maxResults,
        contextLines,
        minStars
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          results,
          meta: {
            mode: 'live',
            query,
            language: language || 'any',
            resultsCount: results.length,
            searchTime: new Date().toISOString()
          }
        })
      };
    } catch (searchError) {
      console.error('Search processing error:', searchError);
      
      // Check if it's a rate limit error
      if (searchError.message && searchError.message.includes('rate limit')) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            error: 'GitHub API rate limit exceeded', 
            details: 'Please try again later or configure a GitHub token with higher rate limits.',
            message: searchError.message
          })
        };
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Error processing GitHub search', 
          details: searchError.message
        })
      };
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    
    // Return user-friendly error message
    let errorMessage = 'Internal Server Error';
    let errorDetails = error.message;
    
    if (error.message && error.message.includes('rate limit exceeded')) {
      errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
    } else if (error.message && error.message.includes('validation failed')) {
      errorMessage = 'Invalid search query. Please check your search parameters.';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage, 
        details: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

/**
 * Generate mock search results - used as fallback when GitHub token is not available
 * This allows new developers to see the UI functioning without needing to set up a token right away
 */
function generateMockResults(query, language, maxResults) {
  const results = [];
  
  // Clean the query for better mock results
  const cleanQuery = query.toLowerCase().replace(/[^\\w\\s]/g, '');
  
  // Generate a deterministic but seemingly random number based on a string
  const hashCode = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  
  // Use query to seed results
  const seed = hashCode(cleanQuery + language);
  const resultCount = Math.min(maxResults, 5 + (seed % 5)); // 5-10 results
  
  // Mock repositories
  const repositories = [
    { name: 'facebook/react', stars: 189000 },
    { name: 'tensorflow/tensorflow', stars: 167000 },
    { name: 'vuejs/vue', stars: 198000 },
    { name: 'angular/angular', stars: 85000 },
    { name: 'microsoft/vscode', stars: 137000 },
    { name: 'flutter/flutter', stars: 142000 },
    { name: 'pytorch/pytorch', stars: 60000 },
    { name: 'django/django', stars: 64000 },
    { name: 'python/cpython', stars: 45000 },
    { name: 'spring-projects/spring-boot', stars: 62000 },
  ];
  
  // Mock file extensions based on language
  const getExtension = (lang) => {
    const extensions = {
      'python': 'py',
      'javascript': 'js',
      'typescript': 'ts',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'csharp': 'cs',
      'go': 'go',
      'ruby': 'rb',
      'php': 'php',
      'swift': 'swift',
      'kotlin': 'kt',
      'scala': 'scala',
      'rust': 'rs',
      'html': 'html',
      'css': 'css',
    };
    return extensions[lang] || 'txt';
  };
  
  // Get language-specific sample code
  const getLanguageCode = (lang, query) => {
    const samples = {
      'python': `# Implementation of ${query}
def ${query.replace(/\\s+/g, '_')}(param1, param2=None):
    """
    This function implements the ${query} algorithm.
    
    Args:
        param1: The first parameter
        param2: Optional second parameter
        
    Returns:
        The result of the operation
    """
    result = []
    for i in range(10):
        if param2 and i % 2 == 0:
            result.append(i * param2)
        else:
            result.append(i * param1)
    return result`,
      
      'javascript': `/**
 * Implementation of ${query}
 * @param {Object} options - Configuration options
 * @returns {Array} - Result array
 */
function ${query.replace(/\\s+/g, '')}(options = {}) {
  const { param1 = 10, param2 = 20 } = options;
  const results = [];
  
  for (let i = 0; i < param1; i++) {
    results.push({
      id: i,
      value: i * param2,
      label: \`Item \${i}\`
    });
  }
  
  return results;
}`,
      
      'java': `/**
 * Implementation of ${query}
 */
public class ${query.replace(/\\s+/g, '')} {
    private final int param1;
    private final int param2;
    
    public ${query.replace(/\\s+/g, '')}(int param1, int param2) {
        this.param1 = param1;
        this.param2 = param2;
    }
    
    public List<Integer> process() {
        List<Integer> results = new ArrayList<>();
        for (int i = 0; i < param1; i++) {
            results.add(i * param2);
        }
        return results;
    }
}`,
    };
    
    return samples[lang] || samples['javascript'];
  };
  
  // Create mock results
  for (let i = 0; i < resultCount; i++) {
    // Get a repository based on seed
    const repoIndex = (seed + i) % repositories.length;
    const repo = repositories[repoIndex];
    
    // Determine file path based on query and language
    const ext = getExtension(language || 'javascript');
    const fileName = `${cleanQuery.replace(/\\s+/g, '_')}_${(seed + i) % 100}.${ext}`;
    const filePath = language 
      ? `src/${language}/${fileName}`
      : `src/main/${fileName}`;
    
    // Generate appropriate code sample
    const codeSnippet = getLanguageCode(language || 'javascript', cleanQuery);
    
    results.push({
      repo_name: repo.name,
      repo_url: `https://github.com/${repo.name}`,
      file_path: filePath,
      file_url: `https://github.com/${repo.name}/blob/main/${filePath}`,
      code_snippet: codeSnippet,
      stars: repo.stars,
      last_updated: new Date(Date.now() - (i * 86400000)).toISOString(), // Dates spread out across past days
      language: language || 'javascript',
      match_score: 15 - (i * 0.5)  // Scores from 15 down
    });
  }
  
  return results;
}
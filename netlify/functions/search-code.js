// netlify/functions/search-code.js
// Mock function for search to avoid needing a GitHub API token

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
    const requestBody = JSON.parse(event.body);
    const query = requestBody.query;
    const language = requestBody.language || '';
    const maxResults = requestBody.max_results || 10;

    // Validate required parameters
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    console.log(`Mock search for: ${query} in language: ${language}`);
    
    // Generate mock results based on the query
    const results = generateMockResults(query, language, maxResults);

    // Return results
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ results })
    };
  } catch (error) {
    console.error('Error processing request:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error.message 
      })
    };
  }
};

/**
 * Generate mock search results
 */
function generateMockResults(query, language, maxResults) {
  const results = [];
  
  // Clean the query for better mock results
  const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, '');
  
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
def ${query.replace(/\s+/g, '_')}(param1, param2=None):
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
function ${query.replace(/\s+/g, '')}(options = {}) {
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
public class ${query.replace(/\s+/g, '')} {
    private final int param1;
    private final int param2;
    
    public ${query.replace(/\s+/g, '')}(int param1, int param2) {
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
    const fileName = `${cleanQuery.replace(/\s+/g, '_')}_${(seed + i) % 100}.${ext}`;
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

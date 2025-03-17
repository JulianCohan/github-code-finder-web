// src/github_code_finder.js
// Adapted from the original Python script to JavaScript for Netlify functions

/**
 * Search for code using GitHub's API and process the results
 * @param {Octokit} octokit - Initialized Octokit instance
 * @param {string} query - Search query
 * @param {string} language - Optional language filter
 * @param {number} maxResults - Maximum number of results to return
 * @param {number} contextLines - Number of context lines around matches
 * @param {number} minStars - Minimum repository stars
 * @returns {Array} - Processed results
 */
async function searchAndProcessCode(
  octokit,
  query,
  language,
  maxResults = 10,
  contextLines = 5,
  minStars = 0
) {
  // Construct search query with language filter if provided
  let searchQuery = query;
  if (language) {
    searchQuery += ` language:${language}`;
  }
  
  console.log(`Searching for: ${searchQuery}`);
  
  // Search for code using GitHub API
  const searchResponse = await octokit.search.code({
    q: searchQuery,
    per_page: Math.min(maxResults * 2, 100), // Get more than needed to allow filtering
    sort: 'indexed',
    order: 'desc'
  });
  
  const items = searchResponse.data.items || [];
  
  if (items.length === 0) {
    console.log('No results found.');
    return [];
  }
  
  console.log(`Processing ${items.length} raw results...`);
  const processedResults = [];
  
  // Process each search result
  for (const item of items) {
    const repoFullName = item.repository.full_name;
    const filePath = item.path;
    const fileUrl = item.html_url;
    
    // Get repository information
    const repoInfo = await getRepositoryInfo(octokit, repoFullName);
    const stars = repoInfo.stargazers_count || 0;
    const lastUpdated = repoInfo.updated_at || 'Unknown';
    
    // Skip repos with too few stars
    if (stars < minStars) {
      continue;
    }
    
    // Get file contents
    const content = await getFileContents(octokit, repoFullName, filePath);
    if (!content) {
      continue;
    }
    
    // Extract relevant snippet
    const snippet = extractRelevantSnippet(content, query, contextLines);
    
    const result = {
      repo_name: repoFullName,
      repo_url: `https://github.com/${repoFullName}`,
      file_path: filePath,
      file_url: fileUrl,
      code_snippet: snippet,
      stars: stars,
      last_updated: lastUpdated,
      language: language || 'Unknown'
    };
    
    // Calculate match score
    result.match_score = calculateMatchScore(result, query);
    processedResults.push(result);
    
    if (processedResults.length >= maxResults) {
      break;
    }
  }
  
  // Sort by match score
  processedResults.sort((a, b) => b.match_score - a.match_score);
  return processedResults;
}

/**
 * Get information about a repository
 * @param {Octokit} octokit - Initialized Octokit instance
 * @param {string} repoFullName - Full name of the repository (owner/repo)
 * @returns {Object} - Repository information
 */
async function getRepositoryInfo(octokit, repoFullName) {
  try {
    const [owner, repo] = repoFullName.split('/');
    const response = await octokit.repos.get({
      owner,
      repo
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error getting repository info for ${repoFullName}:`, error);
    return { stargazers_count: 0, updated_at: 'Unknown' };
  }
}

/**
 * Get the contents of a file from a GitHub repository
 * @param {Octokit} octokit - Initialized Octokit instance
 * @param {string} repoFullName - Full name of the repository (owner/repo)
 * @param {string} filePath - Path to the file
 * @param {string} ref - Branch or commit reference
 * @returns {string|null} - File contents or null if not found
 */
async function getFileContents(octokit, repoFullName, filePath, ref = 'main') {
  try {
    const [owner, repo] = repoFullName.split('/');
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref
    });
    
    // GitHub returns base64 encoded content
    if (response.data.encoding === 'base64' && response.data.content) {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    
    return null;
  } catch (error) {
    // Try with master branch if main fails
    if (ref === 'main') {
      return getFileContents(octokit, repoFullName, filePath, 'master');
    }
    
    console.error(`Error getting file contents for ${repoFullName}/${filePath}:`, error);
    return null;
  }
}

/**
 * Extract the relevant snippet containing the query with context lines
 * @param {string} content - File content
 * @param {string} query - Search query
 * @param {number} contextLines - Number of context lines
 * @returns {string} - Extracted snippet
 */
function extractRelevantSnippet(content, query, contextLines = 5) {
  if (!content) {
    return 'No content available';
  }
  
  const lines = content.split('\n');
  const queryTerms = query
    .toLowerCase()
    .replace(/language:\\w+/g, '')
    .split(/\\s+/)
    .filter(term => term.length > 2 && !['function', 'class', 'def', 'const', 'var', 'let'].includes(term.toLowerCase()));
  
  // Find line numbers with query matches
  const matchLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (queryTerms.some(term => lineLower.includes(term))) {
      matchLines.push(i);
    }
  }
  
  // If no specific term matches, look for the whole query
  if (matchLines.length === 0) {
    const cleanQuery = query.toLowerCase().replace(/language:\\w+/g, '').trim();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(cleanQuery)) {
        matchLines.push(i);
      }
    }
  }
  
  // If still no matches and it's a small file, return it all
  if (matchLines.length === 0 && lines.length <= 50) {
    return content;
  }
  
  // If no matches found, return the first part of the file
  if (matchLines.length === 0) {
    return lines.slice(0, Math.min(20, lines.length)).join('\n');
  }
  
  // Get the most relevant match with context
  const bestLine = matchLines[0]; // Use the first match for simplicity
  const startLine = Math.max(0, bestLine - contextLines);
  const endLine = Math.min(lines.length, bestLine + contextLines + 1);
  
  return lines.slice(startLine, endLine).join('\n');
}

/**
 * Calculate a relevance score for the result
 * @param {Object} result - Search result
 * @param {string} query - Search query
 * @returns {number} - Match score
 */
function calculateMatchScore(result, query) {
  let score = 0.0;
  
  // Stars contribution (up to 5 points)
  if (result.stars > 1000) {
    score += 5.0;
  } else if (result.stars > 500) {
    score += 4.0;
  } else if (result.stars > 100) {
    score += 3.0;
  } else if (result.stars > 50) {
    score += 2.0;
  } else if (result.stars > 10) {
    score += 1.0;
  }
  
  // Recency contribution (up to 3 points)
  try {
    const updated = new Date(result.last_updated);
    const daysOld = Math.floor((Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysOld < 30) {
      score += 3.0;
    } else if (daysOld < 90) {
      score += 2.0;
    } else if (daysOld < 365) {
      score += 1.0;
    }
  } catch (e) {
    // Do nothing on date parsing errors
  }
  
  // Content match quality (up to 5 points)
  const queryTerms = query.toLowerCase().replace(/language:\\w+/g, '').trim().split(/\\s+/);
  const codeSnippetLower = result.code_snippet.toLowerCase();
  
  // Check for exact match
  const exactMatch = queryTerms.every(term => codeSnippetLower.includes(term));
  if (exactMatch) {
    score += 5.0;
  } else {
    // Count how many terms match
    const matchingTerms = queryTerms.filter(term => codeSnippetLower.includes(term)).length;
    score += (matchingTerms / queryTerms.length) * 5.0;
  }
  
  // Code quality signals (up to 2 points)
  if (codeSnippetLower.includes('docstring') || result.code_snippet.includes('"""')) {
    score += 1.0;
  }
  
  if ((result.code_snippet.match(/#/g) || []).length > 2) { // Has comments
    score += 1.0;
  }
  
  return score;
}

module.exports = {
  searchAndProcessCode,
  getRepositoryInfo,
  getFileContents,
  extractRelevantSnippet,
  calculateMatchScore
};
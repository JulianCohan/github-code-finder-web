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
    const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
    
    if (!githubToken) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'GitHub token not configured',
          details: 'Please set GITHUB_TOKEN in environment variables.'
        })
      };
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
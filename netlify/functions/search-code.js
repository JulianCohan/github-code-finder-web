// netlify/functions/search-code.js
const { Octokit } = require("@octokit/rest");
const { searchAndProcessCode } = require('../../src/github_code_finder');

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

    // Initialize Octokit with GitHub token from environment variable
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Process the search using our GitHub code finder
    const results = await searchAndProcessCode(
      octokit,
      query,
      language,
      maxResults,
      contextLines,
      minStars
    );

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
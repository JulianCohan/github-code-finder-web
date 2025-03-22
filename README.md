# GitHub Repo Finder

A powerful web application to search through GitHub repositories for specific code snippets, functions, or patterns. Find the best implementations of algorithms, utility functions, or coding patterns across open-source projects.

## Project Overview

GitHub Repo Finder is a specialized search tool designed for developers who want to discover high-quality code examples, patterns, or implementations across GitHub's vast ecosystem of repositories. Unlike GitHub's built-in search, our application provides:

- Context-aware code snippets with proper indentation and surrounding code
- Quality-based ranking that considers repository stars, recency, and code documentation
- Advanced filtering options to narrow down results
- Ability to save and organize your favorite searches

This project is designed to be a learning tool for new programmers interested in:
- Building web applications with HTML, CSS, and JavaScript
- Integrating with third-party APIs (GitHub)
- Implementing serverless functions with Netlify
- Creating user authentication systems

## Features

- **Advanced Code Search**: Search for specific functions, classes, or patterns across GitHub repositories
- **Smart Filtering**: Filter by programming language, repository stars, and more
- **Intelligent Ranking**: Results ranked by relevance, recency, popularity, and code quality
- **User Authentication**: Create an account to save and manage your searches
- **Saved Searches**: Store your favorite searches for future reference
- **Syntax Highlighting**: Beautiful code display with proper syntax highlighting
- **One-Click Copy**: Easily copy code snippets to your clipboard
- **Export Results**: Save your findings to a text file
- **Dark/Light Mode**: Toggle between light and dark themes

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Bootstrap CSS framework with custom theme
- **API Integration**: GitHub API via Octokit/REST
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Serverless Functions**: Netlify Functions
- **Hosting**: Netlify
- **Syntax Highlighting**: highlight.js

## How It Works

1. **User Interface**: The frontend provides an intuitive search form with various filters.
2. **API Request**: When a user submits a search, the request goes to our Netlify serverless function.
3. **GitHub API**: The function uses Octokit to query GitHub's code search API.
4. **Processing**: Results are processed, filtered, and ranked according to relevance and quality metrics.
5. **Display**: Formatted results with syntax highlighting are returned to the user.
6. **Save Function**: Authenticated users can save searches for later reference.

## Learning Resources

This project serves as an excellent learning resource for:

### Core Concepts
- RESTful API integration
- Serverless function architecture
- User authentication flow
- Frontend UI/UX development
- Search algorithm implementation

### Specific Technologies
- GitHub API usage
- Firebase authentication and database
- Netlify deployment and functions
- CSS styling with Bootstrap
- ES6+ JavaScript features

## Implementation Details

### Search Algorithm 

The search algorithm in `src/github_code_finder.js` includes several sophisticated components:

1. **Query Preparation**: Combines user query with filters
2. **API Integration**: Connects to GitHub using Octokit
3. **Result Processing**: Extracts and formats relevant code snippets
4. **Context Extraction**: Pulls code sections surrounding the matches
5. **Quality Assessment**: Evaluates code quality using:
   - Repository stars
   - Update recency
   - Comment presence
   - Documentation quality
6. **Result Ranking**: Orders results by calculated match score

### Serverless Function

The serverless function in `netlify/functions/search-code.js` handles:

1. API request validation
2. GitHub API authentication
3. Error handling and rate limiting
4. Response formatting

## Setup Instructions

### Prerequisites

- GitHub account
- Netlify account
- Firebase account
- GitHub Personal Access Token

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/github-repo-finder.git
   cd github-repo-finder
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   ```

4. Set up Firebase:
   - Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Update your Firebase configuration in `public/js/firebase.js`

5. Run the development server:
   ```
   npm run dev
   ```

### GitHub API Token

**Important:** For the search functionality to work properly, you must set up a valid GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" (classic)
3. Give it a name like "GitHub Repo Finder"
4. Select the following scopes:
   - `public_repo` (for public repository access)
   - `read:packages` (for code search)
5. Copy the generated token
6. Add it to your `.env` file:
   ```
   GITHUB_TOKEN=your_token_here
   ```

Without a valid token, GitHub API requests will have severe rate limits, and the search functionality may not work properly.

### Deployment

1. Push your code to GitHub

2. Connect your repository to Netlify:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `public`
   - Set environment variables:
     - `GITHUB_TOKEN` (your GitHub personal access token)
   - Deploy!

3. Configure Firebase (if using authentication/saved searches):
   - Create a new Firebase project
   - Set up Firestore database
   - Add your Firebase configuration to `public/js/firebase.js`

## Project Structure

```
├── netlify/
│   └── functions/
│       └── search-code.js     # Serverless function handler
├── public/
│   ├── css/
│   │   └── styles.css         # Custom styles
│   ├── js/
│   │   ├── app.js             # Main application logic
│   │   ├── auth.js            # Authentication handling
│   │   └── firebase.js        # Firebase configuration
│   └── index.html             # Main application UI
├── src/
│   └── github_code_finder.js  # Core search implementation
├── .env.example               # Example environment variables
├── netlify.toml               # Netlify configuration
├── package.json               # Project dependencies
└── README.md                  # This documentation
```

## Usage Examples

- Search for Python main functions: `def main()`
- Find sorting algorithms: `quicksort implementation`
- Discover React hooks usage: `useState hook`
- Explore API patterns: `fetch api async`

## Troubleshooting

### Common Issues

1. **GitHub API Rate Limiting**:
   - Check if your GitHub token is properly configured
   - GitHub has limits of 5,000 requests per hour with a token
   - Without a token, you're limited to 60 requests per hour

2. **Firebase Authentication Issues**:
   - Ensure Firebase is properly configured in `firebase.js`
   - Check if you've enabled Email/Password authentication in Firebase console

3. **Netlify Function Errors**:
   - Check browser console for detailed error messages
   - Verify that your Netlify environment variables are correctly set

## Learning the Codebase

For new programmers, here's a suggested order to explore the codebase:

1. Start with `public/index.html` to understand the basic structure
2. Explore `public/css/styles.css` to see how styling is applied
3. Look at `public/js/app.js` to understand the frontend functionality
4. Examine `netlify/functions/search-code.js` to see the serverless function
5. Dive into `src/github_code_finder.js` for the core search algorithm

Each file contains detailed comments to help you understand how everything works.

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Create a new Pull Request

## License

MIT

# GitHub Repo Finder

A powerful web application to search through GitHub repositories for specific code snippets, functions, or patterns. Find the best implementations of algorithms, utility functions, or coding patterns across open-source projects.

## Features

- **Advanced Code Search**: Search for specific functions, classes, or patterns across GitHub repositories
- **Smart Filtering**: Filter by programming language, repository stars, and more
- **Intelligent Ranking**: Results ranked by relevance, recency, popularity, and code quality
- **User Authentication**: Create an account to save and manage your searches
- **Saved Searches**: Store your favorite searches for future reference
- **Syntax Highlighting**: Beautiful code display with proper syntax highlighting
- **One-Click Copy**: Easily copy code snippets to your clipboard
- **Export Results**: Save your findings to a text file

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: [Supabase](https://supabase.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Hosting/Functions**: [Netlify](https://www.netlify.com/)
- **API Integration**: GitHub API via Octokit

## Setup Instructions

### Prerequisites

- GitHub account
- Netlify account
- Firebase account
- Supabase account
- GitHub Personal Access Token

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/JulianCohan/github-code-finder.git
   cd github-code-finder
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

4. Run the development server:
   ```
   npm run dev
   ```

### Deployment

1. Push your code to GitHub

2. Connect your repository to Netlify:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your repository
   - Configure build settings (build command can be left empty, publish directory should be "public")
   - Set environment variables (GITHUB_TOKEN)
   - Deploy!

3. Configure Firebase:
   - Create a new Firebase project
   - Set up Firestore database
   - Add your Firebase configuration to `public/js/firebase.js`

4. Configure Supabase:
   - Create a new Supabase project
   - Set up authentication
   - Add your Supabase configuration to `public/js/auth.js`

## Usage Examples

- Search for Python main functions: `def main()`
- Find sorting algorithms: `quicksort implementation`
- Discover React hooks usage: `useState hook`
- Explore API patterns: `fetch api async`

## License

MIT

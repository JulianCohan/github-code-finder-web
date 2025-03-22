# Getting Started with GitHub Repo Finder

Welcome to GitHub Repo Finder! This guide will walk you through setting up and understanding this project, especially if you're new to programming.

## What is GitHub Repo Finder?

GitHub Repo Finder is a web application that lets you search for code snippets across GitHub repositories. It's designed to help you find high-quality examples of specific programming patterns, functions, or algorithms.

## Project Overview for New Developers

This project demonstrates several important web development concepts:

1. **Frontend Development**: HTML, CSS, and JavaScript working together
2. **API Integration**: How to connect to external services (GitHub API)
3. **Serverless Functions**: How to create backend functionality without a server
4. **User Authentication**: How to implement login/signup functionality
5. **Database Integration**: How to store and retrieve user data

## Step-by-Step Setup Guide

### 1. Clone the Repository

First, you need to get the code on your computer:

```bash
git clone https://github.com/yourusername/github-repo-finder.git
cd github-repo-finder
```

### 2. Install Node.js

If you don't have Node.js installed:
- Download and install from [nodejs.org](https://nodejs.org/)
- Verify it's installed by running `node -v` in your terminal

### 3. Install Dependencies

In the project directory, run:

```bash
npm install
```

This will install all the libraries and tools needed for the project.

### 4. Set Up Environment Variables

Create a file named `.env` in the project root directory with the following content:

```
GITHUB_TOKEN=your_github_personal_access_token
```

To get a GitHub token:
1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Name it "GitHub Repo Finder"
4. Select these scopes: `public_repo` and `read:packages`
5. Click "Generate token" and copy it

**Note**: A GitHub token is required for the application to function properly.

### 5. Set Up Firebase (Optional)

For user authentication and saved searches:

1. Go to [firebase.google.com](https://firebase.google.com/) and create an account
2. Create a new project
3. Set up Authentication (Email/Password)
4. Create a Firestore database
5. Get your Firebase config and update it in `public/js/firebase.js`

### 6. Run the Development Server

Start the local development server:

```bash
npm run dev
```

This will start your app, typically at http://localhost:8888

## Understanding the Code Structure

Here's a guide to the key files and what they do:

### Frontend (Browser)

- `public/index.html`: The main webpage structure
- `public/css/styles.css`: All the styling for the application
- `public/js/app.js`: Main JavaScript code for the browser
- `public/js/auth.js`: Handles user login/signup
- `public/js/firebase.js`: Connects to Firebase services

### Backend (Serverless)

- `netlify/functions/search-code.js`: Handles search requests
- `src/github_code_finder.js`: Core search algorithm

## Making Your First Code Change

Let's make a simple change to get familiar with the code:

1. Open `public/index.html`
2. Find the `<title>` tag (around line 6)
3. Change it to include your name: `<title>YourName's GitHub Repo Finder</title>`
4. Save the file and refresh your browser

## Learning Path

If you're new to programming, here's a suggested learning path through this codebase:

1. **HTML/CSS Basics**: Explore `index.html` and `styles.css` to understand the page structure and styling
2. **JavaScript Fundamentals**: Look at `app.js` to see how the page becomes interactive
3. **API Integration**: Study how `search-code.js` connects to the GitHub API
4. **Authentication**: Understand how user login works in `auth.js`
5. **Database**: See how data is stored and retrieved in `firebase.js`

## Troubleshooting

### Common Issues

- **Module not found errors**: Make sure you've run `npm install`
- **Blank page**: Check browser console (F12) for JavaScript errors
- **Search doesn't work**: Check if your GitHub token is correct in the `.env` file
- **Can't run the development server**: Make sure you have Node.js installed correctly

### Getting Help

If you get stuck:
- Check the error messages in your browser's developer console (F12)
- Look at the terminal where you're running the development server
- Google the error messages - most issues have been solved before!

## Next Steps

Once you understand how the app works, try these challenges:

1. Add a new filter option (e.g., filter by repository creation date)
2. Add a feature to share search results via a URL
3. Implement a "similar code" feature that finds related examples
4. Create a user profile page showing search history

## Resources for Learning

Here are some resources to help you understand the technologies used:

- [Mozilla Developer Network (MDN)](https://developer.mozilla.org/) - Best reference for HTML, CSS, and JavaScript
- [GitHub API Documentation](https://docs.github.com/en/rest) - Details on GitHub's API
- [Netlify Functions](https://docs.netlify.com/functions/overview/) - How serverless functions work
- [Firebase Documentation](https://firebase.google.com/docs) - Learn about authentication and Firestore

Happy coding!
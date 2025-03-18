// Main application code
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggling functionality
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');

    // Check if user has a theme preference saved
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme based on saved preference or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline';
        localStorage.setItem('theme', 'dark');
    }

    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Toggle the sun/moon icons
        if (document.body.classList.contains('dark-mode')) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline';
            localStorage.setItem('theme', 'dark');
        } else {
            sunIcon.style.display = 'inline';
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'light');
        }
    });

    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only react to OS changes if user hasn't set preference
            if (e.matches) {
                document.body.classList.add('dark-mode');
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline';
            } else {
                document.body.classList.remove('dark-mode');
                sunIcon.style.display = 'inline';
                moonIcon.style.display = 'none';
            }
        }
    });
    
    // DOM elements
    const searchForm = document.getElementById('searchForm');
    const searchButton = document.getElementById('searchButton');
    const searchSpinner = document.getElementById('searchSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const exportButton = document.getElementById('exportButton');
    const languageSelect = document.getElementById('language');
    const loginButton = document.getElementById('loginButton');
    
    // Modal elements
    const authModal = new bootstrap.Modal(document.getElementById('authModal'), {
        keyboard: false
    });
    const savedSearchesModal = new bootstrap.Modal(document.getElementById('savedSearchesModal'), {
        keyboard: false
    });
    
    // Global variables to store state
    let currentResults = []; // Store search results for export and saving
    
    // Populate languages dropdown
    fetchLanguages();
    
    // Event listeners
    searchForm.addEventListener('submit', handleSearch);
    exportButton.addEventListener('click', exportResults);
    loginButton.addEventListener('click', () => authModal.show());
    
    /**
     * Fetch list of programming languages for the dropdown
     */
    async function fetchLanguages() {
        try {
            // Common programming languages
            const languages = [
                "python", "javascript", "java", "c", "cpp", "csharp", "go", 
                "ruby", "php", "swift", "kotlin", "typescript", "rust", "scala",
                "html", "css", "shell", "perl", "r", "matlab", "haskell"
            ];
            
            languages.forEach(language => {
                const option = document.createElement('option');
                option.value = language;
                option.textContent = language.charAt(0).toUpperCase() + language.slice(1);
                languageSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error setting up languages:', error);
        }
    }
    
    /**
     * Handle search form submission
     */
    async function handleSearch(e) {
        e.preventDefault();
        
        // Get form values
        const query = document.getElementById('query').value.trim();
        const language = document.getElementById('language').value;
        const maxResults = document.getElementById('maxResults').value;
        const minStars = document.getElementById('minStars').value;
        const contextLines = document.getElementById('contextLines').value;
        
        if (!query) {
            showError('Please enter a search query');
            return;
        }
        
        // Debug info - log the API endpoint we're using
        console.log('Using API endpoint: /.netlify/functions/search-code');
        
        // Show loading state
        searchButton.disabled = true;
        searchSpinner.classList.remove('d-none');
        resultsContainer.innerHTML = `
            <div class="text-center my-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h5>Searching GitHub repositories...</h5>
                <p class="text-muted">This may take a few moments</p>
            </div>
        `;
        resultsSection.style.display = 'block';
        
        try {
            // Call the Netlify function
            const apiEndpoint = '/.netlify/functions/search-code';
            console.log(`Fetching from: ${apiEndpoint}`);
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    language: language,
                    max_results: parseInt(maxResults),
                    min_stars: parseInt(minStars),
                    context_lines: parseInt(contextLines)
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                showError(data.error);
                return;
            }
            
            currentResults = data.results;
            displayResults(data.results);
            
            // Show save button if user is logged in
            if (window.currentUser) {
                document.getElementById('saveSearchButton').style.display = 'inline-block';
            }
        } catch (error) {
            showError('Error connecting to the server. Please try again.');
            console.error('Search error:', error);
        } finally {
            // Reset loading state
            searchButton.disabled = false;
            searchSpinner.classList.add('d-none');
        }
    }
    
    /**
     * Display search results in the UI
     */
    function displayResults(results) {
        resultsContainer.innerHTML = '';
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle me-2" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                    No results found. Try modifying your search query.
                </div>
            `;
            return;
        }
        
        results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'repo-card';
            
            const header = document.createElement('div');
            header.className = 'repo-card-header d-flex justify-content-between align-items-center';
            
            const repoInfo = document.createElement('div');
            repoInfo.innerHTML = `
                <h5 class="mb-0">
                    <a href="${result.repo_url}" target="_blank" class="text-decoration-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github me-2" viewBox="0 0 16 16">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.7-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        ${result.repo_name}
                    </a>
                </h5>
            `;
            
            const scoreInfo = document.createElement('div');
            scoreInfo.className = 'd-flex align-items-center';
            scoreInfo.innerHTML = `
                <span class="badge bg-warning me-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-star-fill me-1" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                    </svg>
                    ${result.stars}
                </span>
                <span class="badge bg-primary">Score: ${result.match_score.toFixed(2)}</span>
            `;
            
            header.appendChild(repoInfo);
            header.appendChild(scoreInfo);
            
            const body = document.createElement('div');
            body.className = 'repo-card-body';
            
            const metadata = document.createElement('div');
            metadata.className = 'mb-3 small';
            metadata.innerHTML = `
                <p class="mb-2">
                    <strong>File:</strong> 
                    <a href="${result.file_url}" target="_blank" class="text-decoration-none file-path">${result.file_path}</a>
                </p>
                <p class="mb-2">
                    <strong>Language:</strong> ${result.language}
                </p>
                <p class="mb-2">
                    <strong>Last Updated:</strong> ${formatDate(result.last_updated)}
                </p>
            `;
            
            const snippet = document.createElement('div');
            snippet.className = 'code-snippet';
            
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = `language-${result.language}`;
            code.textContent = result.code_snippet;
            
            pre.appendChild(code);
            snippet.appendChild(pre);
            
            const copyButton = document.createElement('button');
            copyButton.className = 'btn btn-sm btn-outline-secondary copy-btn';
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard me-1" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy Code
            `;
            copyButton.onclick = () => copyToClipboard(result.code_snippet, copyButton);
            
            body.appendChild(metadata);
            body.appendChild(snippet);
            body.appendChild(copyButton);
            
            resultCard.appendChild(header);
            resultCard.appendChild(body);
            
            resultsContainer.appendChild(resultCard);
        });
        
        // Initialize syntax highlighting
        hljs.highlightAll();
    }
    
    /**
     * Copy code to clipboard
     */
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check me-1" viewBox="0 0 16 16">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
                Copied!
            `;
            button.classList.add('btn-success');
            button.classList.remove('btn-outline-secondary');
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-secondary');
            }, 2000);
        }).catch(err => {
            console.error('Error copying text: ', err);
        });
    }
    
    /**
     * Export results to a text file
     */
    function exportResults() {
        if (!currentResults || currentResults.length === 0) {
            alert('No results to export');
            return;
        }
        
        let content = 'GitHub Code Search Results\n';
        content += '========================\n\n';
        
        currentResults.forEach((result, index) => {
            content += `Result #${index + 1} - Score: ${result.match_score.toFixed(2)}\n`;
            content += `[Repository: ${result.repo_name}] (${result.stars}⭐)\n`;
            content += `File: ${result.file_path}\n`;
            content += `URL: ${result.file_url}\n`;
            content += `Last updated: ${result.last_updated}\n`;
            content += `Language: ${result.language}\n`;
            content += `----------------------\n`;
            content += `${result.code_snippet}\n`;
            content += `----------------------\n\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'github-code-search-results.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Format ISO date to readable format
     */
    function formatDate(isoDate) {
        if (!isoDate || isoDate === 'Unknown') return 'Unknown';
        
        try {
            const date = new Date(isoDate);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch (e) {
            return isoDate;
        }
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                ${message}
            </div>
        `;
    }
});

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
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    // DOM elements
    const searchForm = document.getElementById('searchForm');
    const searchButton = document.getElementById('searchButton');
    const searchSpinner = document.getElementById('searchSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const exportButton = document.getElementById('exportButton');
    const languageSelect = document.getElementById('language');
    const featureCards = document.getElementById('featureCards');
    
    // Modal elements
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const closeAuthBtn = document.getElementById('closeAuthBtn');
    const savedSearchesModal = document.getElementById('savedSearchesModal');
    const closeSavedSearchesModal = document.getElementById('closeSavedSearchesModal');
    
    // Modal toggle functions
    function showModal(modal) {
        modal.classList.remove('hidden');
    }
    
    function hideModal(modal) {
        modal.classList.add('hidden');
    }
    
    // Event listeners for modals
    if (closeAuthModal) closeAuthModal.addEventListener('click', () => hideModal(authModal));
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', () => hideModal(authModal));
    if (closeSavedSearchesModal) closeSavedSearchesModal.addEventListener('click', () => hideModal(savedSearchesModal));
    
    // Global variables to store state
    let currentResults = []; // Store search results for export and saving
    
    // Populate languages dropdown
    fetchLanguages();
    
    // Event listeners
    searchForm.addEventListener('submit', handleSearch);
    exportButton.addEventListener('click', exportResults);
    
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
        resultsContainer.innerHTML = '<div class="text-center my-5"><div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div><h5 class="mt-2">Searching GitHub repositories...</h5></div>';
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
            resultsContainer.innerHTML = '<div class="alert alert-info">No results found. Try modifying your search query.</div>';
            return;
        }
        
        results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'repo-card mb-4';
            
            const header = document.createElement('div');
            header.className = 'repo-card-header d-flex justify-content-between align-items-center p-3';
            
            const repoInfo = document.createElement('div');
            repoInfo.innerHTML = `
                <h5 class="mb-0">
                    <a href="${result.repo_url}" target="_blank" class="text-decoration-none">
                        <i class="bi bi-github me-1"></i> ${result.repo_name}
                    </a>
                </h5>
            `;
            
            const scoreInfo = document.createElement('div');
            scoreInfo.innerHTML = `
                <span class="badge bg-warning me-2">⭐ ${result.stars}</span>
                <span class="badge bg-primary">Score: ${result.match_score.toFixed(2)}</span>
            `;
            
            header.appendChild(repoInfo);
            header.appendChild(scoreInfo);
            
            const body = document.createElement('div');
            body.className = 'repo-card-body p-3';
            
            const metadata = document.createElement('div');
            metadata.className = 'mb-3 small text-muted';
            metadata.innerHTML = `
                <p class="mb-1"><strong>File:</strong> <a href="${result.file_url}" target="_blank" class="text-decoration-none file-path">${result.file_path}</a></p>
                <p class="mb-1"><strong>Language:</strong> ${result.language}</p>
                <p class="mb-1"><strong>Last Updated:</strong> ${formatDate(result.last_updated)}</p>
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
            copyButton.innerHTML = `<i class="bi bi-clipboard"></i> Copy Code`;
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
            button.innerHTML = `<i class="bi bi-check"></i> Copied!`;
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('btn-success');
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
        resultsContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
});

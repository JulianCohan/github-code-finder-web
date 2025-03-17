// Main application code
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchForm = document.getElementById('searchForm');
    const searchButton = document.getElementById('searchButton');
    const searchSpinner = document.getElementById('searchSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const exportButton = document.getElementById('exportButton');
    const languageSelect = document.getElementById('language');
    
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
            alert('Please enter a search query');
            return;
        }
        
        // Show loading state
        searchButton.disabled = true;
        searchSpinner.classList.remove('d-none');
        resultsContainer.innerHTML = '<div class="text-center my-5"><h5>Searching GitHub repositories...</h5></div>';
        resultsSection.style.display = 'block';
        
        try {
            // Call the Netlify function
            const response = await fetch('/.netlify/functions/search-code', {
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
            if (currentUser) {
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
            resultCard.className = 'card mb-4';
            
            const header = document.createElement('div');
            header.className = 'card-header d-flex justify-content-between align-items-center';
            
            const repoInfo = document.createElement('h5');
            repoInfo.innerHTML = `<a href="${result.repo_url}" target="_blank">${result.repo_name}</a> <span class="badge bg-warning text-dark">${result.stars}⭐</span>`;
            
            const scoreInfo = document.createElement('span');
            scoreInfo.className = 'badge bg-primary';
            scoreInfo.textContent = `Score: ${result.match_score.toFixed(2)}`;
            
            header.appendChild(repoInfo);
            header.appendChild(scoreInfo);
            
            const body = document.createElement('div');
            body.className = 'card-body';
            
            const metadata = document.createElement('div');
            metadata.className = 'mb-3';
            metadata.innerHTML = `
                <p class="mb-1"><strong>File:</strong> <a href="${result.file_url}" target="_blank">${result.file_path}</a></p>
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
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard me-1" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg> Copy Code';
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
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check me-1" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg> Copied!';
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
        resultsContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
});
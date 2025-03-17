// Main application code
document.addEventListener('DOMContentLoaded', function() {
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
        searchSpinner.classList.remove('hidden');
        resultsContainer.innerHTML = '<div class="text-center my-5"><div class="flex justify-center"><i class="icon animate-spin mr-2" data-lucide="loader-2" width="24" height="24"></i></div><h5 class="mt-2">Searching GitHub repositories...</h5></div>';
        lucide.createIcons();
        resultsSection.classList.remove('hidden');
        featureCards.classList.add('hidden');
        
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
                document.getElementById('saveSearchButton').classList.remove('hidden');
            }
        } catch (error) {
            showError('Error connecting to the server. Please try again.');
            console.error('Search error:', error);
        } finally {
            // Reset loading state
            searchButton.disabled = false;
            searchSpinner.classList.add('hidden');
        }
    }
    
    /**
     * Display search results in the UI
     */
    function displayResults(results) {
        resultsContainer.innerHTML = '';
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<div class="bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-md p-4">No results found. Try modifying your search query.</div>';
            return;
        }
        
        results.forEach((result, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'repo-card';
            
            const header = document.createElement('div');
            header.className = 'repo-card-header';
            
            const repoInfo = document.createElement('div');
            repoInfo.innerHTML = `
                <h5 class="font-bold">
                    <a href="${result.repo_url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                        <i class="icon mr-1" data-lucide="github" width="16" height="16"></i>
                        ${result.repo_name}
                    </a>
                </h5>
            `;
            
            const scoreInfo = document.createElement('div');
            scoreInfo.className = 'flex items-center space-x-2';
            scoreInfo.innerHTML = `
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    <i class="icon mr-1" data-lucide="star" width="12" height="12"></i>
                    ${result.stars}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Score: ${result.match_score.toFixed(2)}
                </span>
            `;
            
            header.appendChild(repoInfo);
            header.appendChild(scoreInfo);
            
            const body = document.createElement('div');
            body.className = 'repo-card-body';
            
            const metadata = document.createElement('div');
            metadata.className = 'mb-3 text-sm text-gray-500 dark:text-gray-400';
            metadata.innerHTML = `
                <p class="mb-1 flex items-center">
                    <i class="icon mr-1" data-lucide="file-code" width="14" height="14"></i>
                    <span class="font-medium text-gray-700 dark:text-gray-300">File:</span>
                    <a href="${result.file_url}" target="_blank" class="ml-1 text-blue-600 dark:text-blue-400 hover:underline overflow-hidden overflow-ellipsis">${result.file_path}</a>
                </p>
                <p class="mb-1 flex items-center">
                    <i class="icon mr-1" data-lucide="code" width="14" height="14"></i>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Language:</span>
                    <span class="ml-1">${result.language}</span>
                </p>
                <p class="mb-1 flex items-center">
                    <i class="icon mr-1" data-lucide="calendar" width="14" height="14"></i>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                    <span class="ml-1">${formatDate(result.last_updated)}</span>
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
            copyButton.className = 'copy-btn';
            copyButton.innerHTML = `<i class="icon mr-1" data-lucide="clipboard" width="14" height="14"></i> Copy Code`;
            copyButton.onclick = () => copyToClipboard(result.code_snippet, copyButton);
            
            body.appendChild(metadata);
            body.appendChild(snippet);
            body.appendChild(copyButton);
            
            resultCard.appendChild(header);
            resultCard.appendChild(body);
            
            resultsContainer.appendChild(resultCard);
        });
        
        // Initialize icons and syntax highlighting
        lucide.createIcons();
        hljs.highlightAll();
    }
    
    /**
     * Copy code to clipboard
     */
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = `<i class="icon mr-1" data-lucide="check" width="14" height="14"></i> Copied!`;
            button.classList.add('success');
            
            lucide.createIcons();
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('success');
                lucide.createIcons();
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
        resultsContainer.innerHTML = `<div class="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-md">${message}</div>`;
    }
});

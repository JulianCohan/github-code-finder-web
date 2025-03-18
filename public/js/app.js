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
        moonIcon.style.display = 'block'; // Changed from 'inline' to 'block' for better visibility
        localStorage.setItem('theme', 'dark');
    } else {
        // Ensure light mode is properly set
        document.body.classList.remove('dark-mode');
        sunIcon.style.display = 'block'; // Changed from 'inline' to 'block' for better visibility
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    }

    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Toggle the sun/moon icons
        if (document.body.classList.contains('dark-mode')) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block'; // Changed from 'inline' to 'block'
            localStorage.setItem('theme', 'dark');
        } else {
            sunIcon.style.display = 'block'; // Changed from 'inline' to 'block'
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'light');
        }
    });

    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only react to OS changes if user hasn't set preference
            if (e.matches) {
                document.body.classList.add('dark-mode');
                sunIcon.style.display
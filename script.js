document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const navLinks = document.querySelectorAll('nav a, h1 a');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const pageTitleElement = document.getElementById('page-title');
    let currentPageIndex = 0;

    // Determine the base URL
    const baseUrl = getBaseUrl();

    const pages = [
        { id: 'home', file: 'content/home.md', title: 'Home' },
        { id: 'about', file: 'content/about.md', title: 'About' },
        { id: 'contact', file: 'content/contact.md', title: 'Contact' },
        { id: 'ceramics', file: 'content/ceramics.md', title: 'Ceramics' },
        { id: 'drawing', file: 'content/drawing.md', title: 'Drawing' },
        { id: 'photography', file: 'content/photography.md', title: 'Photography' },
        { id: 'digital-media', file: 'content/digital-media.md', title: 'Digital Media' }
    ];

    function getBaseUrl() {
        const githubRepoName = 'your-repo-name'; // Replace with your actual repository name
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return '';
        } else {
            return `/${githubRepoName}`;
        }
    }

    function resolveImagePaths(html) {
        return html.replace(/src="\.\.\/images\//g, `src="${baseUrl}/images/`);
    }

    async function loadContent(file, title) {
        try {
            const response = await fetch(`${baseUrl}/${file}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let text = await response.text();
            let parsedHtml = marked.parse(text);
            parsedHtml = resolveImagePaths(parsedHtml);
            if (contentDiv) {
                contentDiv.innerHTML = parsedHtml;
            }
            if (pageTitleElement) {
                pageTitleElement.textContent = title !== 'Home' ? title : '';
            }

            // Add event listeners to images after content is loaded
            document.querySelectorAll('#content img').forEach(img => {
                img.addEventListener('error', (e) => {
                    console.error(`Failed to load image: ${e.target.src}`);
                    e.target.style.display = 'none';
                    const errorMsg = document.createElement('p');
                    errorMsg.textContent = `Error loading image: ${e.target.src}`;
                    e.target.parentNode.insertBefore(errorMsg, e.target);
                });
            });
        } catch (error) {
            console.error('Error loading content:', error);
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <p>Error loading content. Please check the console for details.</p>
                    <p>Error message: ${error.message}</p>
                `;
            }
        }
    }

    function updateNavigation() {
        if (prevButton) prevButton.style.visibility = currentPageIndex > 0 ? 'visible' : 'hidden';
        if (nextButton) nextButton.style.visibility = currentPageIndex < pages.length - 1 ? 'visible' : 'hidden';
    }

    function loadPage(index) {
        if (index >= 0 && index < pages.length) {
            currentPageIndex = index;
            loadContent(pages[index].file, pages[index].title);
            updateNavigation();
        }
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            const pageIndex = pages.findIndex(page => page.id === pageId);
            if (pageIndex !== -1) {
                loadPage(pageIndex);
            }
        });
    });

    if (prevButton) prevButton.addEventListener('click', () => loadPage(currentPageIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => loadPage(currentPageIndex + 1));

    // Load default content
    loadPage(0);
});
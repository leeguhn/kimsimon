document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const navLinks = document.querySelectorAll('nav a');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    let currentPageIndex = 0;

    const pages = [
        { id: 'home', file: 'content/home.md', title: 'Home' },
        { id: 'about', file: 'content/about.md', title: 'About' },
        { id: 'contact', file: 'content/contact.md', title: 'Contact' },
        { id: 'ceramics', file: 'content/ceramics.md', title: 'Ceramics' },
        { id: 'drawing', file: 'content/drawing.md', title: 'Drawing' },
        { id: 'photography', file: 'content/photography.md', title: 'Photography' },
        { id: 'digital-media', file: 'content/digital-media.md', title: 'Digital Media' }
    ];

    async function loadContent(file, title) {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            contentDiv.innerHTML = `
                <div class="content-wrapper">
                    ${marked.parse(text)}
                </div>
            `;
            // Update the page title separately
            document.getElementById('page-title').textContent = title;
        } catch (error) {
            console.error('Error loading content:', error);
            contentDiv.innerHTML = `
                <div class="content-wrapper">
                    <p>Error loading content. Please check the console for details.</p>
                </div>
            `;
        }
    }

    function updateNavigation() {
        prevButton.style.visibility = currentPageIndex > 0 ? 'visible' : 'hidden';
        nextButton.style.visibility = currentPageIndex < pages.length - 1 ? 'visible' : 'hidden';
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
            const pageIndex = pages.findIndex(page => page.id === link.getAttribute('href').substring(1));
            if (pageIndex !== -1) {
                loadPage(pageIndex);
            }
        });
    });

    prevButton.addEventListener('click', () => loadPage(currentPageIndex - 1));
    nextButton.addEventListener('click', () => loadPage(currentPageIndex + 1));

    // Load default content
    loadPage(0);
});


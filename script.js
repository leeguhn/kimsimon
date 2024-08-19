document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const navLinks = document.querySelectorAll('nav a, h1 a');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const pageTitleElement = document.getElementById('page-title');
    let currentPageIndex = 0;

    const pages = [
        { id: 'home', file: 'content/home.md', title: 'Home' },
        { id: 'about', file: 'content/about.md', title: 'About' },
        { id: 'contact', file: 'content/contact.md', title: 'Contact' },
        { id: 'ceramics', file: 'content/ceramics/index.md', title: 'Ceramics' },
        { id: 'drawing', file: 'content/drawing/index.md', title: 'Drawing' },
        { id: 'painting', file: 'content/painting/index.md', title: 'Painting' },
        { id: 'photography', file: 'content/photography/index.md', title: 'Photography' },
        { id: 'test-image', file: 'test-image.html', title: 'Test Image' }
    ]

    function isGitHubPages() {
        return window.location.hostname.endsWith('github.io');
    }

    function adjustPath(path) {
        console.log('Original path:', path);
        if (isGitHubPages()) {
            // Remove leading '../' or '../../'
            let cleanPath = path.replace(/^(?:\.\.\/)+/, '');
            
            // Prepend the repository name for GitHub Pages
            const adjustedPath = `/kimsimon/${cleanPath}`;
            
            // Append ?raw=true for image files
            if (adjustedPath.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
                const finalPath = adjustedPath + '?raw=true';
                console.log('Adjusted path for GitHub Pages:', finalPath);
                return finalPath;
            }
            console.log('Adjusted path for GitHub Pages:', adjustedPath);
            return adjustedPath;
        } else {
            // For local development, just remove any leading '../'
            const localPath = path.replace(/^(?:\.\.\/)+/, '');
            console.log('Adjusted path for local:', localPath);
            return localPath;
        }
    }

    async function loadContent(file, title) {
        try {
            const adjustedFile = adjustPath(file);
            console.log('Loading content from:', adjustedFile);
            const response = await fetch(adjustedFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let text = await response.text();
            
            if (file.endsWith('.html')) {
                if (contentDiv) {
                    contentDiv.innerHTML = text;
                }
            } else {
                // For Markdown files, adjust image paths
                text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
                    const adjustedImagePath = adjustPath(imagePath);
                    return `<div class="image-wrapper"><img src="${adjustedImagePath}" alt="${altText}"></div>`;
                });
                
                let parsedHtml = marked.parse(text);
                if (contentDiv) {
                    contentDiv.innerHTML = parsedHtml;
                    setupProjectLinks();
                }
            }
            if (pageTitleElement) {
                pageTitleElement.textContent = title !== 'Home' ? title : '';
            }
        } catch (error) {
            console.error('Error loading content:', error);
            if (contentDiv) {
                contentDiv.innerHTML = `<p>Error loading content: ${error.message}</p>`;
            }
        }
    }

    function setupProjectLinks() {
        const projectItems = document.querySelectorAll('.project-grid > div');
        projectItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const link = item.querySelector('a');
                if (link) {
                    const projectFile = link.getAttribute('href');
                    const projectPath = `content/ceramics/${projectFile}`;
                    loadContent(projectPath, link.textContent);
                }
            });
        });
    }


    function createImagePreview() {
        const overlay = document.createElement('div');
        overlay.id = 'image-preview-overlay';
        overlay.innerHTML = `
            <div class="preview-container">
                <img id="preview-image" src="" alt="Preview">
                <button id="prev-button">&lt;</button>
                <button id="next-button">&gt;</button>
                <button id="close-button">X</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('prev-button').addEventListener('click', showPreviousImage);
        document.getElementById('next-button').addEventListener('click', showNextImage);
        document.getElementById('close-button').addEventListener('click', closePreview);
    }

    function showImagePreview(event) {
        if (event.target.tagName === 'IMG' && !event.target.closest('.project-grid')) {
            const clickedImage = event.target;
            images = Array.from(document.querySelectorAll('#content img:not(.project-grid img)'));
            currentImageIndex = images.indexOf(clickedImage);
            updatePreviewImage();
            document.getElementById('image-preview-overlay').style.display = 'flex';
        }
    }

    function updatePreviewImage() {
        const previewImage = document.getElementById('preview-image');
        previewImage.src = images[currentImageIndex].src;
        previewImage.alt = images[currentImageIndex].alt;
    }

    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updatePreviewImage();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updatePreviewImage();
    }

    function closePreview() {
        document.getElementById('image-preview-overlay').style.display = 'none';
    }

    createImagePreview();
    document.getElementById('content').addEventListener('click', showImagePreview);

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
            const href = link.getAttribute('href');
            const pageId = href.replace('.html', '');
            const pageIndex = pages.findIndex(page => page.id === pageId);
            if (pageIndex !== -1) {
                loadPage(pageIndex);
            }
        });
    });

    if (prevButton) prevButton.addEventListener('click', () => loadPage(currentPageIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => loadPage(currentPageIndex + 1));

    // Load default content
    loadPage(pages.findIndex(page => page.id === 'home'));
});
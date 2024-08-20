// Utility functions (outside DOMContentLoaded)
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

function setupGallery() {
    const projectContent = document.getElementById('project-content');
    if (projectContent) {
        const images = document.querySelectorAll('#project-content img');
        if (images.length > 0) {
            const gallery = document.createElement('div');
            gallery.className = 'project-gallery';
            const img = document.createElement('img');
            img.className = 'gallery-image';
            img.src = images[0].src;
            gallery.appendChild(img);
        
            const prevBtn = document.createElement('button');
            prevBtn.className = 'gallery-nav gallery-prev';
            prevBtn.textContent = '←';
            gallery.appendChild(prevBtn);
        
            const nextBtn = document.createElement('button');
            nextBtn.className = 'gallery-nav gallery-next';
            nextBtn.textContent = '→';
            gallery.appendChild(nextBtn);
        
            let currentIndex = 0;
        
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                img.src = images[currentIndex].src;
            });
        
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % images.length;
                img.src = images[currentIndex].src;
            });
        
            projectContent.innerHTML = '';
            projectContent.appendChild(gallery);
        }
    }
}

// Functions that need to be accessible globally
function setupProjectLinks(pageTitle) {
    const page = pages.find(p => p.title === pageTitle);
    if (!page) return;
   
    currentPage = page;
    const projectHeader = document.querySelector('.project-header');
   
    if (projectHeader) {
        projectHeader.innerHTML = ''; // Clear existing content
   
        // Add page title
        const pageTitleElement = document.createElement('h2');
        pageTitleElement.id = 'page-title';
        pageTitleElement.textContent = page.title;
        projectHeader.appendChild(pageTitleElement);
   
        // Add separator only if there are projects
        if (page.projects && page.projects.length > 0) {
            const separator = document.createElement('span');
            separator.className = 'separator';
            separator.textContent = ' / ';
            projectHeader.appendChild(separator);
        }
   
        // Add project nav
        const projectNav = document.createElement('nav');
        projectNav.className = 'project-nav';
   
        if (page.projects && page.projects.length > 0) {
            page.projects.forEach(project => {
                const link = document.createElement('a');
                link.href = `#${project.id.toLowerCase()}`; // Use the 'id' property
                link.className = 'project-link';
                link.textContent = project.title; // Use the 'title' property
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadProject(project.file);
                    document.querySelectorAll('.project-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                });
                projectNav.appendChild(link);
            });
        }
   
        projectHeader.appendChild(projectNav);
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
        
        // For Markdown files, adjust image paths
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
            const adjustedImagePath = adjustPath(imagePath);
            return `<div class="image-wrapper"><img src="${adjustedImagePath}" alt="${altText}"></div>`;
        });
        
        let parsedHtml = marked.parse(text);
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            // Clear the existing content
            contentDiv.innerHTML = '';

            // Create project header
            const projectHeader = document.createElement('div');
            projectHeader.className = 'project-header';
            
            // Add page title
            const pageTitle = document.createElement('h2');
            pageTitle.id = 'page-title';
            pageTitle.className = 'project-link active';
            pageTitle.textContent = title;
            projectHeader.appendChild(pageTitle);

            // Add separator
            const separator = document.createElement('span');
            separator.className = 'separator';
            separator.textContent = ' / ';
            projectHeader.appendChild(separator);

            // Add project nav
            const projectNav = document.createElement('nav');
            projectNav.id = 'project-nav';
            projectNav.className = 'project-nav';
            projectHeader.appendChild(projectNav);

            // Add project header to content
            contentDiv.appendChild(projectHeader);

            // Create project content div
            const projectContent = document.createElement('div');
            projectContent.id = 'project-content';
            projectContent.innerHTML = parsedHtml;
            contentDiv.appendChild(projectContent);

            // Set up project links
            setupProjectLinks(title);
        }
    } catch (error) {
        console.error('Error loading content:', error);
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = `<p>Error loading content: ${error.message}</p>`;
        }
    }
}

async function loadProject(projectFile) {
    if (!currentPage) return;

    const projectContent = document.getElementById('project-content');
    if (!projectContent) {
        console.error('Project content div not found');
        return;
    }

    try {
        const adjustedProjectFile = adjustPath(projectFile);
        console.log('Loading project from:', adjustedProjectFile);
        const response = await fetch(adjustedProjectFile);
        let markdown = await response.text();

        // Adjust image paths in the Markdown content
        markdown = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
            const adjustedImagePath = adjustPath(imagePath);
            console.log('Image path:', adjustedImagePath);
            return `![${altText}](${adjustedImagePath})`;
        });

        const html = marked.parse(markdown);
        projectContent.innerHTML = html;
        setupGallery();
    } catch (error) {
        console.error('Error loading project:', error);
        projectContent.innerHTML = '<p>Error loading content. Please try again.</p>';
    }
}

// Global variables
let currentPage = null;
let images = [];
let currentImageIndex = 0;

const pages = [
    { id: 'home', file: 'content/home.md', title: '' },
    { id: 'about', file: 'content/about.md', title: 'About' },
    { id: 'contact', file: 'content/contact.md', title: 'Contact' },
    { id: 'ceramics', file: 'content/ceramics/index.md', title: 'Ceramics', 
        projects: [
            { id: 'artifact', file: 'content/ceramics/artifact.md', title: 'Artifact' },
            { id: 'Habitat', file: 'content/ceramics/habitat.md', title: 'Habitat' },
            { id: 'Trip', file: 'content/ceramics/trip.md', title: 'Trip' },
        ]
    },
    { id: 'drawing', file: 'content/drawing/index.md', title: 'Drawing' },
    { id: 'painting', file: 'content/painting/index.md', title: 'Painting' },
    { id: 'photography', file: 'content/photography/index.md', title: 'Photography' },
    { id: 'test-image', file: 'test-image.html', title: 'Test Image' }
];

// Main script (inside DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const navLinks = document.querySelectorAll('nav a, h1 a');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const pageTitleElement = document.getElementById('page-title');
    let currentPageIndex = 0;

    function setupPageHeader(pageTitle) {
        const page = pages.find(p => p.title === pageTitle);
        if (!page) return;

        const pageHeader = document.querySelector('.page-header');
        const mainTitle = pageHeader.querySelector('.main-title');
        const subPages = pageHeader.querySelector('.sub-pages');

        // Set main title
        mainTitle.textContent = page.title;

        // Clear and set sub-pages
        subPages.innerHTML = '';
        if (page.projects && page.projects.length > 0) {
            page.projects.forEach(project => {
                const link = document.createElement('a');
                link.href = `#${project.toLowerCase()}`;
                link.className = 'sub-page-link';
                link.textContent = project;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadProject(project.toLowerCase());
                    document.querySelectorAll('.sub-page-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                });
                subPages.appendChild(link);
            });
        }
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

    function updateNavigation() {
        if (prevButton) prevButton.style.visibility = currentPageIndex > 0 ? 'visible' : 'hidden';
        if (nextButton) nextButton.style.visibility = currentPageIndex < pages.length - 1 ? 'visible' : 'hidden';
    }

    function loadPage(pageIdOrIndex) {
        let index;
        if (typeof pageIdOrIndex === 'number') {
            index = pageIdOrIndex;
        } else {
            index = pages.findIndex(page => page.id === pageIdOrIndex);
        }
    
        if (index >= 0 && index < pages.length) {
            currentPageIndex = index;
            const page = pages[index];
            
            // Load the main content
            loadContent(page.file, page.title);
            
            updateNavigation();
        } else {
            console.error('Invalid page index or ID');
        }
    }

    // Event listeners
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const pageId = href.replace('.html', '');
            loadPage(pageId);
        });
    });

    if (prevButton) prevButton.addEventListener('click', () => loadPage(currentPageIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => loadPage(currentPageIndex + 1));

    // Initialize
    createImagePreview();
    document.getElementById('content').addEventListener('click', showImagePreview);

    // Load default content
    loadPage(pages.findIndex(page => page.id === 'home'));
});
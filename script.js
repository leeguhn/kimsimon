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

function setupGallery(startIndex, images, isTrip = false) {
    const projectContent = document.getElementById('project-content');
    const originalContent = projectContent.innerHTML;

    const gallery = document.createElement('div');
    gallery.className = 'project-gallery';
    
    const img = document.createElement('img');
    img.className = 'gallery-image';
    img.src = images[startIndex].src;
    gallery.appendChild(img);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'gallery-nav gallery-prev btn btn-primary';
    prevBtn.innerHTML = '<i class="bi bi-arrow-left"></i>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'gallery-nav gallery-next btn btn-primary';
    nextBtn.innerHTML = '<i class="bi bi-arrow-right"></i>';

    gallery.appendChild(prevBtn);
    gallery.appendChild(nextBtn);

    let currentIndex = startIndex;

    const updateImage = () => {
        img.src = images[currentIndex].src;
    };

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
    });
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
    });

    img.addEventListener('click', () => {
        projectContent.innerHTML = originalContent;
        if (isTrip) {
            setupTripFrames(projectContent);
        } else {
            setupFrames(projectContent);
        }
    });

    projectContent.innerHTML = '';
    projectContent.appendChild(gallery);
    updateImage();
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.className = className;
    button.textContent = text;
    return button;
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

        // Check for no-scrolling option
        if (text.includes('no-scrolling')) {
            document.body.classList.add('no-scrolling');
        } else {
            document.body.classList.remove('no-scrolling');
        }

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

function setupFrames(projectContent) {
    const images = projectContent.querySelectorAll('img');
    const framesContainer = document.createElement('div');
    framesContainer.className = 'justify-row';

    images.forEach((img, index) => {
        const imageFrame = document.createElement('div');
        imageFrame.className = 'image-frame';
        imageFrame.appendChild(img.cloneNode(true));
        framesContainer.appendChild(imageFrame);

        imageFrame.addEventListener('click', () => {
            setupGallery(index, Array.from(images), false);
            showImagePreview({ target: img });
        });
    });

    projectContent.innerHTML = '';
    projectContent.appendChild(framesContainer);
}

function setupTripFrames(projectContent) {
    const images = projectContent.querySelectorAll('img');
    const framesContainer = document.createElement('div');
    framesContainer.className = 'trip-gallery';

    const landscapeContainer = document.createElement('div');
    landscapeContainer.className = 'trip-landscape-container';
    const portraitContainer = document.createElement('div');
    portraitContainer.className = 'trip-portrait-container';

    const landscapeImages = [];
    const portraitImages = [];

    images.forEach((img) => {
        const imageFrame = document.createElement('div');
        imageFrame.className = 'trip-frame';
        const innerFrame = document.createElement('div');
        innerFrame.className = 'trip-inner-frame';
        const imgClone = img.cloneNode(true);

        imgClone.onload = () => {
            const aspectRatio = imgClone.naturalWidth / imgClone.naturalHeight;
            if (aspectRatio > 1) {
                landscapeImages.push(imageFrame);
                imageFrame.classList.add('landscape');
            } else {
                portraitImages.push(imageFrame);
                innerFrame.classList.add('portrait');
            }

            innerFrame.appendChild(imgClone);
            imageFrame.appendChild(innerFrame);

            imageFrame.addEventListener('click', () => {
                setupGallery(images.indexOf(img), Array.from(images), true);
            });

            if (landscapeImages.length + portraitImages.length === images.length) {
                organizeFrames(landscapeContainer, landscapeImages);
                organizeFrames(portraitContainer, portraitImages);
                framesContainer.appendChild(landscapeContainer);
                framesContainer.appendChild(portraitContainer);
                projectContent.innerHTML = '';
                projectContent.appendChild(framesContainer);
                //document.querySelector('.content-wrapper').classList.add('trip');
                //document.querySelector('.content').classList.add('loaded');
            }
        };

        if (imgClone.complete) {
            imgClone.onload();
        }
    });
}

function organizeFrames(container, frames) {
    const containerHeight = window.innerHeight - 100; // Subtract some space for margins
    const frameHeight = 170; // Height of each frame
    const maxFramesPerColumn = Math.floor(containerHeight / frameHeight);
    const numColumns = Math.ceil(frames.length / maxFramesPerColumn);

    for (let i = 0; i < numColumns; i++) {
        const column = document.createElement('div');
        column.className = 'trip-column';
        for (let j = i * maxFramesPerColumn; j < (i + 1) * maxFramesPerColumn && j < frames.length; j++) {
            column.appendChild(frames[j]);
        }
        container.appendChild(column);
    }
}

async function loadProject(projectFile) {
    if (!currentPage) return;

    const projectContent = document.getElementById('project-content');
    if (!projectContent) {
        console.error('Project content div not found');
        return;
    }

    // Hide content while loading
    projectContent.style.opacity = '0';

    try {
        const adjustedProjectFile = adjustPath(projectFile);
        console.log('Loading project from:', adjustedProjectFile);
        const response = await fetch(adjustedProjectFile);
        let markdown = await response.text();

        // Check for the frames keyword
        const hasFrames = markdown.includes('frames');
        const isTrip = markdown.includes('trip');

        // Remove the keywords from the text
        //markdown = markdown.replace(/frames|trip/g, '');

        // Adjust image paths in the Markdown content
        markdown = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
            const adjustedImagePath = adjustPath(imagePath);
            console.log('Image path:', adjustedImagePath);
            return `![${altText}](${adjustedImagePath})`;
        });

        const html = marked.parse(markdown);
        projectContent.innerHTML = html;

        if (hasFrames) {
            if (isTrip) {
                setupTripFrames(projectContent);
            } else {
                setupFrames(projectContent);
            }
        } else {
            const images = Array.from(projectContent.querySelectorAll('img'));
            setupGallery(0, images, false);
        }

        // Show content after loading
        setTimeout(() => {
            projectContent.style.opacity = '1';
        }, 100);
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
            { id: 'habitat', file: 'content/ceramics/habitat.md', title: 'Habitat' },
            { id: 'trip', file: 'content/ceramics/trip.md', title: 'Trip' },
        ]
    },
    { id: 'drawing', file: 'content/drawing/index.md', title: 'Drawing',
        projects: [ 
            { id: '108', file: 'content/drawing/108.md', title: '108' },
            { id: '2022', file: 'content/drawing/2022.md', title: '2022' },
            { id: 'corpus', file: 'content/drawing/corpus.md', title: 'Corpus'},
        ]
    },
    { id: 'painting', file: 'content/painting/index.md', title: 'Painting' },
    { id: 'photography', file: 'content/photography/index.md', title: 'Photography' },
    { id: 'test-image', file: 'test-image.html', title: 'Test Image' }
];

// Main script (inside DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const navLinks = document.querySelectorAll('nav a, h1 a');

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
        if (event.target.closest('.image-frame') || event.target.closest('.trip-frame')) {
            const clickedImage = event.target.tagName === 'IMG' ? event.target : event.target.querySelector('img');
            const isTrip = !!event.target.closest('.trip-frame');
            images = Array.from(document.querySelectorAll(isTrip ? '.trip-frame img' : '.image-frame img'));
            currentImageIndex = images.indexOf(clickedImage);
            setupGallery(currentImageIndex, images, isTrip);
        }
    }

    function updateGalleryImage() {
        const galleryImage = document.getElementById('gallery-image');
        galleryImage.src = images[currentImageIndex].src; // Set the source of the gallery image
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

    // Initialize
    createImagePreview();
    document.getElementById('content').addEventListener('click', showImagePreview);

    // Load default content
    loadPage(pages.findIndex(page => page.id === 'home'));
});
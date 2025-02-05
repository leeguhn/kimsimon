// Global variables
let currentPage = null;
let images = [];
let currentImageIndex = 0;

const pages = [
    { id: 'home', file: 'content/home.md', title: '' },
    { id: 'about', file: 'content/about/index.md', title: 'About',
        projects: [
            { id: 'statement', file: 'content/about/statement.md', title: 'Statement'},
            { id: 'cv', file: 'content/about/cv.md', title: 'C.V.'},
        ]
    },
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
            { id: 'corpus', file: 'content/drawing/corpus.md', title: 'Corpus'},
            { id: '108', file: 'content/drawing/108.md', title: '108' },
        ]
    },
    { id: 'painting', file: 'content/painting/index.md', title: 'Painting',
        projects: [
            { id: 'now', file: 'content/painting/now.md', title: 'Now' },
        ]
     },
    { id: 'performance', file: 'content/performance/index.md', title: 'Performance',
        projects: [
            { id: 'the mind is a place', file: 'content/performance/mindplace.md', title: 'themindisaplace' },
            { id: 'meeting', file: 'content/performance/meeting.md', title: 'meeting' },
            { id: 'freemeditation', file: 'content/performance/freemeditation.md', title: 'freemeditation' },
        ]
    },
    { id: 'digitalmedia', file: 'content/digitalmedia/index.md', title: 'Digital Media',
        projects: [
            { id: 'renderings', file: 'content/digitalmedia/renderings.md', title: 'Renderings' },
            { id: 'hansel', file: 'content/digitalmedia/hansel.md', title: 'Hansel' },
        ]
    },
    { id: 'documents', file: 'content/documents/index.md', title: 'Documents', 
        projects: [
            { id: 'compositions', file: 'content/documents/compositions.md', title: 'Compositions' },
            { id: 'paperwork', file: 'content/documents/paperwork.md', title: 'Paperwork' },
        ]
    },
    { id: 'archive', file: 'content/archive/index.md', title: 'Archive', 
        projects: [
            { id: 'objects', file: 'content/archive/objects.md', title: 'Objects' },
            { id: 'photos', file: 'content/archive/photos.md', title: 'Photos' },
            { id: 'studio', file: 'content/archive/studio.md', title: 'Studio' },
        ]
    },
];

function updateURL(pageId, projectId = null) {
    let newURL = 'https://simonkim.nyc';

    if (pageId && pageId !== 'home') {
        newURL += `/${pageId}`;
    }

    if (projectId) {
        newURL += `/${projectId}`;
    }

    history.pushState(null, '', newURL);
}

// Utility functions (outside DOMContentLoaded)
function isGitHubPages() {
    return window.location.hostname.endsWith('github.io');
}

function isMobile() {
    return window.innerWidth <= 768;
}

function showLoader() {
    const contentDiv = document.getElementById('content');
    const loader = document.createElement('div');
    loader.className = 'loader';
    contentDiv.innerHTML = '';
    contentDiv.appendChild(loader);
}

async function fileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

function showAppropriateImage() {
    const images = document.querySelectorAll('#content img');
    if (images.length === 2) {
        const [image1, image2] = images;
        const isMobileDevice = isMobile();

        const showImage = (imgToShow, imgToHide) => {
            imgToShow.style.display = 'block';
            imgToHide.style.display = 'none';
        };

        if (image1.alt.includes('phone')) {
            isMobileDevice ? showImage(image1, image2) : showImage(image2, image1);
        } else if (image2.alt.includes('phone')) {
            isMobileDevice ? showImage(image2, image1) : showImage(image1, image2);
        } else {
            console.log('No image with "phone" tag found');
        }
    } else {
        console.log('Expected 2 images, found:', images.length);
    }
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

    if (window.innerWidth <= 768) {
        setupFrames(document.getElementById('project-content'));
        return;
    }

    const projectContent = document.getElementById('project-content');
    const originalContent = projectContent.innerHTML;

    const gallery = document.createElement('div');
    gallery.className = 'project-gallery';
    
    const img = document.createElement('img');
    img.className = 'gallery-image fade-transition';
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
        img.classList.remove('show');
        setTimeout(() => {
            img.src = images[currentIndex].src;
            setTimeout(() => {
                img.classList.add('show');
            }, 50);
        }, 222);
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
        // if (isTrip) {
        //     setupTripFrames(projectContent);
        // } else 
        {
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
            page.projects.forEach((project, index) => {
                const link = document.createElement('a');
                link.href = `#${project.id.toLowerCase()}`; // Use the 'id' property
                link.className = 'project-link';
                if (index === 0) link.classList.add('active');
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

            // Check for the "phone" keyword
            if (text.includes('phone')) {
                showAppropriateImage();
                projectContent.classList.add('hide-paragraphs');
            }

            if (isMobile()) {
                const images = Array.from(projectContent.querySelectorAll('img.fade-in-image'));
                let currentImageIndex = 0;

                function loadNextImage() {
                    if (currentImageIndex < images.length) {
                        const img = images[currentImageIndex];
                        img.style.opacity = '0';

                        img.onload = () => {
                            setTimeout(() => {
                                img.style.opacity = '1';
                                currentImageIndex++;
                                loadNextImage();
                            }, 200);
                        };

                        img.onerror = () => {
                            console.error('Failed to load image:', img.src);
                            currentImageIndex++;
                            loadNextImage();
                        };

                        if (img.complete) {
                            img.onload();
                        }
                    }
                }

                loadNextImage();
            }
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
    const projectContainer = document.createElement('div');
    projectContainer.className = 'project-container';

    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';

    const framesContainer = document.createElement('div');
    framesContainer.className = 'justify-row';

    const paragraphs = projectContent.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (p.querySelector('img')) {
            return; // Stop if we encounter a paragraph with an image
        }
        const clonedP = p.cloneNode(true);
        clonedP.innerHTML = clonedP.innerHTML.replace(/\bframes\b/gi, '');
        if (clonedP.textContent.trim()) {
            textContainer.appendChild(clonedP);
        }
    });

    // Extract images
    const images = projectContent.querySelectorAll('img');
    let currentImageIndex = 0;

    function loadNextImage() {
        if (currentImageIndex < images.length) {
            const img = images[currentImageIndex];
            const imageFrame = document.createElement('div');
            imageFrame.className = 'image-frame';

            const imgClone = img.cloneNode(true);
            imgClone.classList.add('fade-transition'); // Add fade class
            imageFrame.appendChild(imgClone);
            framesContainer.appendChild(imageFrame);

            imgClone.onload = () => {
                setTimeout(() => {
                    imgClone.classList.add('show');
                    // imageFrame.style.opacity = '1';
                    currentImageIndex++;
                    loadNextImage();
                }, 200);
            };

            imgClone.onerror = () => {
                console.error('Failed to load image:', imgClone.src);
                currentImageIndex++;
                loadNextImage();
            };

            if (!isMobile()) {
                imageFrame.addEventListener('click', () => {
                    setupGallery(currentImageIndex, Array.from(images), false);
                    showImagePreview({ target: imgClone });
                });
            }

            if (imgClone.complete) {
                imgClone.onload();
            }
        }
    }

    projectContainer.appendChild(textContainer);
    projectContainer.appendChild(framesContainer);

    projectContent.innerHTML = '';
    projectContent.appendChild(projectContainer);

    if (isMobile()) {
        loadNextImage();
    } else {
        images.forEach((img, index) => {
            const imageFrame = document.createElement('div');
            imageFrame.className = 'image-frame';
            const imgClone = img.cloneNode(true);
            imgClone.classList.add('fade-transition'); // Add fade class

            imgClone.onload = () => {
                setTimeout(() => {
                    imgClone.classList.add('show'); // Trigger fade-in
                }, 555);
            }

            imageFrame.appendChild(imgClone);
            framesContainer.appendChild(imageFrame);

            imageFrame.addEventListener('click', () => {
                setupGallery(index, Array.from(images), false);
                showImagePreview({ target: img });
            });
        });
    }
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

    // Apply fade-out only to project-content
    projectContent.classList.add('fade-out');

    try {
        const adjustedProjectFile = adjustPath(projectFile);
        console.log('Loading project from:', adjustedProjectFile);
        const response = await fetch(adjustedProjectFile);
        let markdown = await response.text();

        // Check for the frames keyword
        const hasFrames = markdown.includes('frames');
        const isTrip = markdown.includes('trip');

        // Adjust image paths in the Markdown content
        markdown = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
            const adjustedImagePath = adjustPath(imagePath);
            console.log('Image path:', adjustedImagePath);
            return `![${altText}](${adjustedImagePath})`;
        });

        // Use marked.js to parse the markdown, preserving italics, bold, and underline
        const html = marked.parse(markdown, {
            gfm: true,
            breaks: true,
            smartLists: true,
            smartypants: true
        });
        
        // Use setTimeout to ensure the fade-out is visible before content change
        setTimeout(() => {
            projectContent.innerHTML = html;

            if (hasFrames) {
                // if (isTrip) {
                //     setupTripFrames(projectContent);
                // } else 
                {
                    setupFrames(projectContent);
                }
            } else {
                const images = Array.from(projectContent.querySelectorAll('img'));
                if (window.innerWidth <= 768) {
                    // On mobile, display images directly without gallery
                    projectContent.innerHTML = html;
                } else {
                    setupGallery(0, images, false);
                }
            }

            // Remove fade-out class after content is loaded
            setTimeout(() => {
                projectContent.classList.remove('fade-out');
            }, 50);

            updateURL(page.id);
            
        }, 555); // Match this delay with the CSS transition duration
    } catch (error) {
        console.error('Error loading project:', error);
        projectContent.innerHTML = '<p>Error loading content. Please try again.</p>';
    }
}

function getTextAfterDomain() {
    const path = window.location.pathname;
    return path.replace('/', '');
}

// Main script (inside DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    // Redirect to HTTPS if not already on HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        window.location.href = 'https://' + window.location.hostname + window.location.pathname + window.location.search;
        return; // Ensure no further execution during redirect
    }

    const navLinks = document.querySelectorAll('nav a, h1 a');

    setupMobileNavigation();
    createImagePreview();
    
    document.getElementById('content').addEventListener('click', showImagePreview);

    // Load default content if no specific page is specified
    if (!window.location.pathname.replace('/', '')) {
        loadPage(pages.findIndex(page => page.id === 'home'));
        updateActiveLink('home');
    } else {
        // if there is a page specified
        let parsedPage = getTextAfterDomain().toLowerCase(); // Convert to lowercase
        const pageExists = pages.some(page => page.id === parsedPage);
        
        if (!pageExists) {
            parsedPage = 'home'; // Redirect to home if page doesn't exist
        }
        
        loadPage(pages.findIndex(page => page.id === parsedPage));
        updateActiveLink(parsedPage);
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
        if (!isMobile() && event.target.closest('.image-frame') || event.target.closest('.trip-frame')) {
            const clickedImage = event.target.tagName === 'IMG' ? event.target : event.target.querySelector('img');
            const isTrip = !!event.target.closest('.trip-frame');
            images = Array.from(document.querySelectorAll(isTrip ? '.trip-frame img' : '.image-frame img'));
            currentImageIndex = images.indexOf(clickedImage);
            setupGallery(currentImageIndex, images, isTrip);
        }
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

    function updateActiveLink(pageId) {
        navLinks.forEach(link => {
            const linkPageId = link.getAttribute('href').replace('/', '').replace('.html', ''); // Adjusted to remove leading '/' and '.html'
            if (linkPageId === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const pageId = href.replace('.html', '');
            loadPage(pageId);
            updateActiveLink(pageId);
        });
    });

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

            updateActiveLink(page.id);

            const contentWrapper = document.querySelector('.content-wrapper');
            
            if (contentWrapper) {
                contentWrapper.classList.add('fade-out');
            }
            
            setTimeout(() => {
                loadContent(page.file, page.title).then(() => {
                    setupProjectLinks(page.title);
                    
                    if (page.projects && page.projects.length > 0) {
                        loadProject(page.projects[0].file, true);
                    }

                    setTimeout(() => {
                        if (contentWrapper) {
                            contentWrapper.classList.remove('fade-out');
                        }
                    }, 50);
                });
                updateURL(page.id);
            }, 333); // Match this delay with the CSS transition duration
        } else {
            console.error('Invalid page index or ID');
        }
    }

    function setupMobileNavigation() {
        console.log('setupMobileNavigation function called');
    
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const mobileSidebar = document.querySelector('.mobile-sidebar');
        const mobileNavIcon = mobileNavToggle ? mobileNavToggle.querySelector('i') : null;
        
        console.log('mobileNavToggle:', mobileNavToggle);
        console.log('mobileSidebar:', mobileSidebar);
        console.log('mobileNavIcon:', mobileNavIcon);
    
        if (mobileNavToggle && mobileSidebar && mobileNavIcon) {
            console.log('All required elements found');
    
            function toggleSidebar() {
                mobileSidebar.classList.toggle('active');
                if (mobileSidebar.classList.contains('active')) {
                    setTimeout(() => {
                        mobileNavIcon.classList.remove('bi-list');
                        mobileNavIcon.classList.add('bi-x');
                    }, 111); // Match the sidebar transition duration
                } else {
                    mobileNavIcon.classList.remove('bi-x');
                    mobileNavIcon.classList.add('bi-list');
                }
                console.log('Sidebar active:', mobileSidebar.classList.contains('active'));
                console.log('Icon class:', mobileNavIcon.className);
            }
    
            mobileNavToggle.addEventListener('click', (e) => {
                console.log('Mobile nav toggle clicked');
                e.preventDefault();
                toggleSidebar();
            });
    
            const mobileLinks = mobileSidebar.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    const pageId = href.replace('.html', '');
                    await loadPage(pageId);
                    await new Promise(resolve => setTimeout(resolve, 222));
                    toggleSidebar();
                });
            });

            // Add event listener for the "Simon Kim" link
            const mobileTitleLink = document.querySelector('.mobile-title a');
            if (mobileTitleLink) {
                mobileTitleLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const href = mobileTitleLink.getAttribute('href');
                    const pageId = href.replace('.html', '');
                    await loadPage(pageId);
                    if (mobileSidebar.classList.contains('active')) {
                        toggleSidebar();
                    }
                });
            }
        
        } else {
            console.log('One or more required elements not found');
        }
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            const projectContent = document.querySelector('#content');
            const gallery = document.querySelector('.project-gallery');
            if (projectContent && gallery) {
                setupFrames(projectContent);
            }
        }
    });

    window.addEventListener('resize', showAppropriateImage);

    // Ensure frames mode is default on mobile
    const projectContent = document.querySelector('#content');
    if (projectContent && window.innerWidth <= 768) {
        setupFrames(projectContent);
    }
});
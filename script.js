document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browse-btn');
    const enhanceBtn = document.getElementById('enhance-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const previewSection = document.getElementById('preview-section');
    const resultsGallery = document.getElementById('results-gallery');
    const downloadAllBtn = document.getElementById('download-all');
    const startOverBtn = document.getElementById('start-over');
    const pricingToggle = document.getElementById('pricing-toggle');
    
    // Global variables
    let uploadedFiles = [];
    let enhancedImages = [];
    
    // Add header scroll effect for enhanced aesthetics
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Initialize animation on scroll
    const animateElements = document.querySelectorAll('.step, .pricing-card, .example, .hero-content');
    if (animateElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeIn');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        animateElements.forEach((element, index) => {
            element.style.opacity = "0";
            element.style.animationDelay = (0.1 * index) + "s";
            observer.observe(element);
        });
    }
    
    // Initialize smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Check if elements exist before adding event listeners to prevent errors
    if (browseBtn) {
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });
    }
    
    // Drag and drop events
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        dropArea.addEventListener('drop', handleDrop, false);
    }
    
    // Add event listeners to buttons if they exist
    if (enhanceBtn) {
        enhanceBtn.addEventListener('click', enhanceImages);
    }
    
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', downloadAllImages);
    }
    
    if (startOverBtn) {
        startOverBtn.addEventListener('click', resetApp);
    }
    
    // Pricing toggle functionality
    if (pricingToggle) {
        pricingToggle.addEventListener('change', function() {
            const payAsYouGo = document.querySelector('.pricing-options.pay-as-you-go');
            const subscription = document.querySelector('.pricing-options.subscription');
            
            if (this.checked) {
                // Show subscription plans
                payAsYouGo.classList.add('hidden');
                subscription.classList.remove('hidden');
            } else {
                // Show pay-as-you-go plans
                subscription.classList.add('hidden');
                payAsYouGo.classList.remove('hidden');
            }
        });
    }
    
    // Functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('active');
    }
    
    function unhighlight() {
        dropArea.classList.remove('active');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        // Convert FileList to array for easier manipulation
        const fileArray = files instanceof FileList ? Array.from(files) : files;
        
        // Filter for only image files
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            showNotification('Please select valid image files (JPEG, PNG, WEBP)', 'error');
            return;
        }
        
        // Add new files to our array
        uploadedFiles = [...uploadedFiles, ...imageFiles];
        
        // Enable enhance button if we have files
        if (enhanceBtn) {
            enhanceBtn.disabled = uploadedFiles.length === 0;
        }
        
        // Update UI to show selected files
        updateDropAreaUI();
    }
    
    function updateDropAreaUI() {
        if (!dropArea) return;
        
        const uploadContent = dropArea.querySelector('.upload-content');
        if (!uploadContent) return;
        
        if (uploadedFiles.length > 0) {
            uploadContent.innerHTML = `
                <i class="fas fa-images"></i>
                <p>${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} selected</p>
                <div class="file-preview">
                    ${uploadedFiles.length <= 3 ? 
                        uploadedFiles.map((file, index) => 
                            `<div class="file-thumbnail" title="${file.name}">
                                <img src="${URL.createObjectURL(file)}" alt="Preview">
                            </div>`
                        ).join('') : 
                        `<p class="small">Including ${uploadedFiles.map(f => f.name).join(', ')}</p>`
                    }
                </div>
                <button class="btn btn-secondary" id="reset-files">Select Different Files</button>
            `;
            
            // Add event listener to the reset button
            const resetFilesBtn = document.getElementById('reset-files');
            if (resetFilesBtn) {
                resetFilesBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    resetFiles();
                });
            }
            
            // Add CSS for the thumbnails
            if (!document.getElementById('thumbnail-styles')) {
                const style = document.createElement('style');
                style.id = 'thumbnail-styles';
                style.textContent = `
                    .file-preview {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin: 15px 0;
                    }
                    .file-thumbnail {
                        width: 80px;
                        height: 80px;
                        border-radius: 10px;
                        overflow: hidden;
                        border: 2px solid var(--medium-gray);
                        box-shadow: var(--shadow);
                        transition: var(--transition);
                    }
                    .file-thumbnail:hover {
                        transform: translateY(-3px);
                        box-shadow: var(--shadow-hover);
                    }
                    .file-thumbnail img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            // Reset to default UI
            uploadContent.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop images here or</p>
                <button class="btn btn-secondary" id="browse-btn">Browse Files</button>
                <p class="small">Supported formats: JPEG, PNG, WEBP</p>
            `;
            
            // Re-add event listener to the browse button
            const browseBtnInner = document.getElementById('browse-btn');
            if (browseBtnInner && fileInput) {
                browseBtnInner.addEventListener('click', () => {
                    fileInput.click();
                });
            }
        }
    }
    
    function resetFiles() {
        uploadedFiles = [];
        if (enhanceBtn) {
            enhanceBtn.disabled = true;
        }
        updateDropAreaUI();
    }
    
    async function enhanceImages() {
        if (uploadedFiles.length === 0) return;
        
        // Show loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
        
        // Get selected enhancement level
        const enhancementLevel = document.querySelector('input[name="enhancement"]:checked')?.value || 'moderate';
        
        try {
            // Simulate the enhancement process
            enhancedImages = await simulateEnhancement(uploadedFiles, enhancementLevel);
            
            // Populate the results gallery
            populateResultsGallery();
            
            // Hide upload section and show preview section
            const uploadSection = document.getElementById('upload-section');
            if (uploadSection) {
                uploadSection.classList.add('hidden');
            }
            
            if (previewSection) {
                previewSection.classList.remove('hidden');
                
                // Scroll to preview section
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = previewSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            console.error("Error enhancing images:", error);
            showNotification("There was an error enhancing your images. Please try again.", "error");
        } finally {
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
        }
    }
    
    function populateResultsGallery() {
        if (!resultsGallery) return;
        
        resultsGallery.innerHTML = '';
        
        enhancedImages.forEach((imageSet, index) => {
            const comparisonElement = document.createElement('div');
            comparisonElement.className = 'image-comparison';
            comparisonElement.style.opacity = "0";
            comparisonElement.style.animationDelay = (0.1 * index) + "s";
            
            comparisonElement.innerHTML = `
                <div class="comparison-images">
                    <img src="${imageSet.original}" alt="Original image ${index + 1}">
                    <img src="${imageSet.enhanced}" alt="Enhanced image ${index + 1}">
                    <span class="image-label before">Before</span>
                    <span class="image-label after">After</span>
                </div>
                <div class="image-info">
                    <p>Image ${index + 1}</p>
                </div>
            `;
            
            resultsGallery.appendChild(comparisonElement);
            
            // Trigger animation after a small delay
            setTimeout(() => {
                comparisonElement.classList.add('animate-fadeIn');
            }, 100);
        });
    }
    
    // This function simulates the enhancement process that would normally call an API
    async function simulateEnhancement(files, level) {
        return new Promise((resolve) => {
            // Simulate API processing time
            setTimeout(() => {
                const results = files.map(file => {
                    // Create the original image URL
                    const originalUrl = URL.createObjectURL(file);
                    
                    // In a real implementation, this would be the URL returned from an image enhancement API
                    // For now, we're just using the same image as a placeholder
                    const enhancedUrl = originalUrl;
                    
                    return {
                        original: originalUrl,
                        enhanced: enhancedUrl,
                        filename: file.name
                    };
                });
                
                resolve(results);
            }, 2000); // Simulate 2 seconds of processing
        });
    }
    
    // In a real implementation, this would download the enhanced images
    function downloadAllImages() {
        if (enhancedImages.length === 0) return;
        
        showNotification("In a production environment, this would download all enhanced images as a zip file.", "info");
        
        // Real implementation would create a zip of all enhanced images and trigger download
        // For example using JSZip library:
        // const zip = new JSZip();
        // enhancedImages.forEach(imageSet => {
        //     // Fetch the enhanced image and add to zip
        //     fetch(imageSet.enhanced)
        //         .then(res => res.blob())
        //         .then(blob => {
        //             zip.file(`enhanced_${imageSet.filename}`, blob);
        //         });
        // });
        // zip.generateAsync({type:"blob"}).then(content => {
        //     saveAs(content, "enhanced_images.zip");
        // });
    }
    
    function resetApp() {
        // Hide preview section and show upload section
        if (previewSection) {
            previewSection.classList.add('hidden');
        }
        
        const uploadSection = document.getElementById('upload-section');
        if (uploadSection) {
            uploadSection.classList.remove('hidden');
        }
        
        // Clear files
        resetFiles();
        
        // Clear the results gallery
        if (resultsGallery) {
            resultsGallery.innerHTML = '';
        }
        enhancedImages = [];
        
        // Scroll back to upload section
        if (uploadSection) {
            const headerOffset = document.querySelector('header').offsetHeight;
            const elementPosition = uploadSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Add a notification system for better user feedback
    function showNotification(message, type = 'success') {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '100px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1000';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        `;
        
        // Notification styles
        const notificationStyles = `
            .notification {
                background-color: white;
                color: var(--dark-gray);
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: slideIn 0.3s forwards;
                max-width: 350px;
                border-left: 4px solid var(--primary-color);
                opacity: 0;
                transform: translateX(50px);
            }
            
            .notification.success { border-left-color: var(--success); }
            .notification.error { border-left-color: #dc3545; }
            .notification.info { border-left-color: var(--primary-color); }
            
            .notification-content {
                display: flex;
                align-items: center;
            }
            
            .notification-content i {
                margin-right: 10px;
                font-size: 18px;
            }
            
            .notification.success i { color: var(--success); }
            .notification.error i { color: #dc3545; }
            .notification.info i { color: var(--primary-color); }
            
            .close-notification {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--dark-gray);
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            
            .close-notification:hover {
                opacity: 1;
            }
            
            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOut {
                to {
                    opacity: 0;
                    transform: translateX(50px);
                }
            }
        `;
        
        // Add styles if they don't exist
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = notificationStyles;
            document.head.appendChild(style);
        }
        
        // Add close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s forwards';
        }, 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Add CSS for hover effect on comparison images
    if (!document.getElementById('comparison-styles')) {
        const style = document.createElement('style');
        style.id = 'comparison-styles';
        style.textContent = `
            .comparison-images {
                position: relative;
                overflow: hidden;
                border-radius: var(--border-radius) var(--border-radius) 0 0;
            }
            
            .comparison-images img:nth-child(1) {
                display: block;
                width: 100%;
            }
            
            .comparison-images img:nth-child(2) {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            .comparison-images:hover img:nth-child(2) {
                opacity: 1;
            }
            
            /* Add a slider effect for better comparison */
            .comparison-images::after {
                content: '↔ Hover to Compare';
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .comparison-images:hover::after {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Image lazy loading for better performance
    const lazyLoadImages = function() {
        const lazyImages = document.querySelectorAll('.example-img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    };
    
    // Initialize lazy loading
    lazyLoadImages();
});
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
    
    // Initialize smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Event Listeners
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFiles);
    
    // Drag and drop events
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
    
    enhanceBtn.addEventListener('click', enhanceImages);
    downloadAllBtn.addEventListener('click', downloadAllImages);
    startOverBtn.addEventListener('click', resetApp);
    
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
        // Convert FileList to array for easier manipulation
        const fileArray = files instanceof FileList ? Array.from(files) : files;
        
        // Filter for only image files
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Please select valid image files (JPEG, PNG, WEBP)');
            return;
        }
        
        // Add new files to our array
        uploadedFiles = [...uploadedFiles, ...imageFiles];
        
        // Enable enhance button if we have files
        enhanceBtn.disabled = uploadedFiles.length === 0;
        
        // Update UI to show selected files
        updateDropAreaUI();
    }
    
    function updateDropAreaUI() {
        if (uploadedFiles.length > 0) {
            const uploadContent = dropArea.querySelector('.upload-content');
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
            document.getElementById('reset-files').addEventListener('click', (e) => {
                e.stopPropagation();
                resetFiles();
            });
            
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
                        border-radius: 6px;
                        overflow: hidden;
                        border: 2px solid var(--medium-gray);
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
            const uploadContent = dropArea.querySelector('.upload-content');
            uploadContent.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop images here or</p>
                <button class="btn btn-secondary" id="browse-btn">Browse Files</button>
                <p class="small">Supported formats: JPEG, PNG, WEBP</p>
            `;
            
            // Re-add event listener to the browse button
            document.getElementById('browse-btn').addEventListener('click', () => {
                fileInput.click();
            });
        }
    }
    
    function resetFiles() {
        uploadedFiles = [];
        enhanceBtn.disabled = true;
        updateDropAreaUI();
    }
    
    async function enhanceImages() {
        if (uploadedFiles.length === 0) return;
        
        // Show loading overlay
        loadingOverlay.classList.remove('hidden');
        
        // Get selected enhancement level
        const enhancementLevel = document.querySelector('input[name="enhancement"]:checked').value;
        
        try {
            // This would normally connect to the ChatGPT API
            // For now, we'll simulate the enhancement process
            enhancedImages = await simulateEnhancement(uploadedFiles, enhancementLevel);
            
            // Populate the results gallery
            populateResultsGallery();
            
            // Hide upload section and show preview section
            document.getElementById('upload-section').classList.add('hidden');
            previewSection.classList.remove('hidden');
            
            // Scroll to preview section
            window.scrollTo({
                top: previewSection.offsetTop - 80,
                behavior: 'smooth'
            });
        } catch (error) {
            console.error("Error enhancing images:", error);
            alert("There was an error enhancing your images. Please try again.");
        } finally {
            // Hide loading overlay
            loadingOverlay.classList.add('hidden');
        }
    }
    
    function populateResultsGallery() {
        resultsGallery.innerHTML = '';
        
        enhancedImages.forEach((imageSet, index) => {
            const comparisonElement = document.createElement('div');
            comparisonElement.className = 'image-comparison';
            
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
        });
    }
    
    // This function simulates the enhancement process that would normally call the ChatGPT API
    async function simulateEnhancement(files, level) {
        return new Promise((resolve) => {
            // Simulate API processing time
            setTimeout(() => {
                const results = files.map(file => {
                    // Create the original image URL
                    const originalUrl = URL.createObjectURL(file);
                    
                    // In a real implementation, this would be the URL returned from ChatGPT's image enhancement
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
        
        alert("In a production environment, this would download all enhanced images as a zip file.");
        
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
        previewSection.classList.add('hidden');
        document.getElementById('upload-section').classList.remove('hidden');
        
        // Clear files
        resetFiles();
        
        // Clear the results gallery
        resultsGallery.innerHTML = '';
        enhancedImages = [];
        
        // Scroll back to upload section
        window.scrollTo({
            top: document.getElementById('upload-section').offsetTop - 80,
            behavior: 'smooth'
        });
    }
    
    // Add CSS for hover effect on comparison images
    const style = document.createElement('style');
    style.textContent = `
        .comparison-images {
            position: relative;
            overflow: hidden;
        }
        
        .comparison-images img:nth-child(2) {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .comparison-images:hover img:nth-child(2) {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Pricing Toggle
    if (pricingToggle) {
        pricingToggle.addEventListener('change', function() {
            const payAsYouGo = document.querySelector('.pricing-options.pay-as-you-go');
            const subscription = document.querySelector('.pricing-options.subscription');
            
            if (this.checked) {
                // Show subscription plans
                payAsYouGo.classList.add('hidden');
                subscription.classList.remove('hidden');
            
    
    // In a real implementation, this would be replaced with actual API calls
    // to the ChatGPT API for image enhancement
    function connectToChatGPTAPI(imageFile, enhancementLevel) {
        // Implementation would depend on the specific API structure
        // Example structure (pseudo-code):
        
        /*
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('enhancement_level', enhancementLevel);
        
        return fetch('https://api.openai.com/v1/image-enhancement', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            return {
                original: URL.createObjectURL(imageFile),
                enhanced: data.enhanced_image_url,
                filename: imageFile.name
            };
        });
        */
    }
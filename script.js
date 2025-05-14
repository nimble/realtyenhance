document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browse-btn");
  const enhanceBtn = document.getElementById("enhance-btn");
  const loadingOverlay = document.getElementById("loading-overlay");
  const previewSection = document.getElementById("preview-section");
  const resultsGallery = document.getElementById("results-gallery");
  const downloadAllBtn = document.getElementById("download-all");
  const startOverBtn = document.getElementById("start-over");
  const pricingToggle = document.getElementById("pricing-toggle");

  // Global variables
  let uploadedFiles = [];
  let enhancedImages = [];

  // Add header scroll effect for enhanced aesthetics
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Initialize animation on scroll
  const animateElements = document.querySelectorAll(
    ".step, .pricing-card, .example, .hero-content"
  );
  if (animateElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    animateElements.forEach((element, index) => {
      element.style.opacity = "0";
      element.style.animationDelay = 0.1 * index + "s";
      observer.observe(element);
    });
  }

  // Initialize smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerOffset = document.querySelector("header").offsetHeight;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Check if elements exist before adding event listeners to prevent errors
  if (browseBtn) {
    browseBtn.addEventListener("click", () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      handleFiles(e.target.files);
    });
  }

  // Drag and drop events
  if (dropArea) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener("drop", handleDrop, false);
  }

  // Add event listeners to buttons if they exist
  if (enhanceBtn) {
    enhanceBtn.addEventListener("click", enhanceImages);
  }

  if (downloadAllBtn) {
    downloadAllBtn.addEventListener("click", downloadAllImages);
  }

  if (startOverBtn) {
    startOverBtn.addEventListener("click", resetApp);
  }

  // Pricing toggle functionality
  if (pricingToggle) {
    pricingToggle.addEventListener("change", function () {
      const payAsYouGo = document.querySelector(
        ".pricing-options.pay-as-you-go"
      );
      const subscription = document.querySelector(
        ".pricing-options.subscription"
      );

      if (this.checked) {
        // Show subscription plans
        payAsYouGo.classList.add("hidden");
        subscription.classList.remove("hidden");
      } else {
        // Show pay-as-you-go plans
        subscription.classList.add("hidden");
        payAsYouGo.classList.remove("hidden");
      }
    });
  }

  // Functions
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    dropArea.classList.add("active");
  }

  function unhighlight() {
    dropArea.classList.remove("active");
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
    const imageFiles = fileArray.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      showNotification(
        "Please select valid image files (JPEG, PNG, WEBP)",
        "error"
      );
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

    const uploadContent = dropArea.querySelector(".upload-content");
    if (!uploadContent) return;

    if (uploadedFiles.length > 0) {
      uploadContent.innerHTML = `
                <i class="fas fa-images"></i>
                <p>${uploadedFiles.length} file${
        uploadedFiles.length > 1 ? "s" : ""
      } selected</p>
                <div class="file-preview">
                    ${
                      uploadedFiles.length <= 3
                        ? uploadedFiles
                            .map(
                              (file, index) =>
                                `<div class="file-thumbnail" title="${
                                  file.name
                                }">
                                <img src="${URL.createObjectURL(
                                  file
                                )}" alt="Preview">
                            </div>`
                            )
                            .join("")
                        : `<p class="small">Including ${uploadedFiles
                            .map((f) => f.name)
                            .join(", ")}</p>`
                    }
                </div>
                <button class="btn btn-secondary" id="reset-files">Select Different Files</button>
            `;

      // Add event listener to the reset button
      const resetFilesBtn = document.getElementById("reset-files");
      if (resetFilesBtn) {
        resetFilesBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          resetFiles();
        });
      }

      // Add CSS for the thumbnails
      if (!document.getElementById("thumbnail-styles")) {
        const style = document.createElement("style");
        style.id = "thumbnail-styles";
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
      const browseBtnInner = document.getElementById("browse-btn");
      if (browseBtnInner && fileInput) {
        browseBtnInner.addEventListener("click", () => {
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
      loadingOverlay.classList.remove("hidden");
    }

    // Get selected enhancement level
    const enhancementLevel =
      document.querySelector('input[name="enhancement"]:checked')?.value ||
      "moderate";

    try {
      // Simulate the enhancement process
      enhancedImages = await simulateEnhancement(
        uploadedFiles,
        enhancementLevel
      );

      // Populate the results gallery
      populateResultsGallery();

      // Hide upload section and show preview section
      const uploadSection = document.getElementById("upload-section");
      if (uploadSection) {
        uploadSection.classList.add("hidden");
      }

      if (previewSection) {
        previewSection.classList.remove("hidden");

        // Scroll to preview section
        const headerOffset = document.querySelector("header").offsetHeight;
        const elementPosition = previewSection.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.error("Error enhancing images:", error);
      showNotification(
        "There was an error enhancing your images. Please try again.",
        "error"
      );
    } finally {
      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.classList.add("hidden");
      }
    }
  }

  function populateResultsGallery() {
    if (!resultsGallery) return;

    resultsGallery.innerHTML = "";

    enhancedImages.forEach((imageSet, index) => {
      const comparisonElement = document.createElement("div");
      comparisonElement.className = "image-comparison";
      comparisonElement.style.opacity = "0";
      comparisonElement.style.animationDelay = 0.1 * index + "s";

      comparisonElement.innerHTML = `
                <div class="comparison-images">
                    <img src="${imageSet.original}" alt="Original image ${
        index + 1
      }">
                    <img src="${imageSet.enhanced}" alt="Enhanced image ${
        index + 1
      }">
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
        comparisonElement.classList.add("animate-fadeIn");
      }, 100);
    });
  }

  // This function simulates the enhancement process that would normally call an API
  async function simulateEnhancement(files, level) {
    return new Promise((resolve) => {
      // Simulate API processing time
      setTimeout(() => {
        const results = files.map((file) => {
          // Create the original image URL
          const originalUrl = URL.createObjectURL(file);

          // In a real implementation, this would be the URL returned from an image enhancement API
          // For now, we're just using the same image as a placeholder
          const enhancedUrl = originalUrl;

          return {
            original: originalUrl,
            enhanced: enhancedUrl,
            filename: file.name,
          };
        });

        resolve(results);
      }, 2000); // Simulate 2 seconds of processing
    });
  }

  // In a real implementation, this would download the enhanced images
  function downloadAllImages() {
    if (enhancedImages.length === 0) return;

    showNotification(
      "In a production environment, this would download all enhanced images as a zip file.",
      "info"
    );

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
      previewSection.classList.add("hidden");
    }

    const uploadSection = document.getElementById("upload-section");
    if (uploadSection) {
      uploadSection.classList.remove("hidden");
    }

    // Clear files
    resetFiles();

    // Clear the results gallery
    if (resultsGallery) {
      resultsGallery.innerHTML = "";
    }
    enhancedImages = [];

    // Scroll back to upload section
    if (uploadSection) {
      const headerOffset = document.querySelector("header").offsetHeight;
      const elementPosition = uploadSection.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }

  // Add a notification system for better user feedback
  function showNotification(message, type = "success") {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById(
      "notification-container"
    );
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.id = "notification-container";
      notificationContainer.style.position = "fixed";
      notificationContainer.style.top = "100px";
      notificationContainer.style.right = "20px";
      notificationContainer.style.zIndex = "1000";
      document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${
                  type === "success"
                    ? "fa-check-circle"
                    : type === "error"
                    ? "fa-exclamation-circle"
                    : "fa-info-circle"
                }"></i>
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
    if (!document.getElementById("notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = notificationStyles;
      document.head.appendChild(style);
    }

    // Add close button functionality
    notification
      .querySelector(".close-notification")
      .addEventListener("click", () => {
        notification.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => {
          notification.remove();
        }, 300);
      });

    // Add to container
    notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.animation = "slideIn 0.3s forwards";
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  // Add CSS for hover effect on comparison images
  if (!document.getElementById("comparison-styles")) {
    const style = document.createElement("style");
    style.id = "comparison-styles";
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
  const lazyLoadImages = function () {
    const lazyImages = document.querySelectorAll(".example-img[data-src]");

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });
    }
  };

  // Initialize lazy loading
  lazyLoadImages();

  // Add the chatbot HTML structure to the page
  const chatbotHTML = `
        <div id="chatbot-container">
            <div id="chatbot-button">
                <i class="fas fa-comment-dots"></i>
            </div>
            <div id="chatbot-panel">
                <div id="chatbot-header">
                    <div class="chatbot-logo">
                        <svg class="chatbot-icon" viewBox="0 0 100 100" width="24" height="24">
                            <polygon points="50,15 85,40 85,85 15,85 15,40" fill="white" stroke="#2c6cff" stroke-width="3" stroke-linejoin="round"></polygon>
                            <polygon points="50,5 90,35 10,35" fill="#2c6cff" stroke="#2c6cff" stroke-width="2"></polygon>
                            <rect x="40" y="60" width="20" height="25" fill="#5f9ea0" rx="2" ry="2"></rect>
                            <circle cx="45" cy="72.5" r="2" fill="white"></circle>
                            <rect x="25" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                            <rect x="60" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                        </svg>
                        <span>RealtyEnhance Assistant</span>
                    </div>
                    <div class="chatbot-controls">
                        <button id="chatbot-minimize"><i class="fas fa-minus"></i></button>
                        <button id="chatbot-close"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div id="chatbot-conversation">
                    <div class="chatbot-message bot">
                        <div class="chatbot-avatar">
                            <svg class="chatbot-icon" viewBox="0 0 100 100" width="30" height="30">
                                <polygon points="50,15 85,40 85,85 15,85 15,40" fill="white" stroke="#2c6cff" stroke-width="3" stroke-linejoin="round"></polygon>
                                <polygon points="50,5 90,35 10,35" fill="#2c6cff" stroke="#2c6cff" stroke-width="2"></polygon>
                                <rect x="40" y="60" width="20" height="25" fill="#5f9ea0" rx="2" ry="2"></rect>
                                <circle cx="45" cy="72.5" r="2" fill="white"></circle>
                                <rect x="25" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                                <rect x="60" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                            </svg>
                        </div>
                        <div class="message-content">
                            <p>Hi there! I'm the RealtyEnhance Assistant. How can I help you with your real estate image enhancement needs today?</p>
                        </div>
                    </div>
                </div>
                <div id="chatbot-typing" class="hidden">
                    <div class="chatbot-avatar">
                        <svg class="chatbot-icon" viewBox="0 0 100 100" width="30" height="30">
                            <polygon points="50,15 85,40 85,85 15,85 15,40" fill="white" stroke="#2c6cff" stroke-width="3" stroke-linejoin="round"></polygon>
                            <polygon points="50,5 90,35 10,35" fill="#2c6cff" stroke="#2c6cff" stroke-width="2"></polygon>
                            <rect x="40" y="60" width="20" height="25" fill="#5f9ea0" rx="2" ry="2"></rect>
                            <circle cx="45" cy="72.5" r="2" fill="white"></circle>
                            <rect x="25" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                            <rect x="60" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                        </svg>
                    </div>
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div id="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Type your question here...">
                    <button id="chatbot-send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

  // Append the chatbot HTML to the body
  document.body.insertAdjacentHTML("beforeend", chatbotHTML);

  // Add chatbot styles
  const chatbotStyles = `
        #chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        
        #chatbot-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
        }
        
        #chatbot-button i {
            font-size: 24px;
        }
        
        #chatbot-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }
        
        #chatbot-button::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid var(--primary-color);
            animation: pulse 2s infinite;
            opacity: 0;
            top: 0;
            left: 0;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 0.7;
            }
            70% {
                transform: scale(1.2);
                opacity: 0;
            }
            100% {
                transform: scale(1.2);
                opacity: 0;
            }
        }
        
        #chatbot-panel {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.18);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s;
            transform-origin: bottom right;
            opacity: 0;
            transform: scale(0.2);
            pointer-events: none;
        }
        
        #chatbot-panel.active {
            opacity: 1;
            transform: scale(1);
            pointer-events: all;
        }
        
        #chatbot-header {
            padding: 15px 20px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chatbot-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
        }
        
        .chatbot-controls {
            display: flex;
            gap: 8px;
        }
        
        .chatbot-controls button {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            transition: background-color 0.3s;
        }
        
        .chatbot-controls button:hover {
            background-color: rgba(255, 255, 255, 0.4);
        }
        
        #chatbot-conversation {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            scroll-behavior: smooth;
        }
        
        #chatbot-conversation::-webkit-scrollbar {
            width: 6px;
        }
        
        #chatbot-conversation::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
        }
        
        #chatbot-conversation::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }
        
        .chatbot-message {
            display: flex;
            gap: 10px;
            max-width: 85%;
        }
        
        .chatbot-message.bot {
            align-self: flex-start;
        }
        
        .chatbot-message.user {
            align-self: flex-end;
            flex-direction: row-reverse;
        }
        
        .chatbot-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .chatbot-message.bot .chatbot-avatar {
            background-color: var(--primary-light);
        }
        
        .chatbot-message.user .chatbot-avatar {
            background-color: var(--primary-color);
            color: white;
        }
        
        .message-content {
            background-color: var(--light-gray);
            padding: 12px 16px;
            border-radius: 16px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            line-height: 1.5;
        }
        
        .chatbot-message.bot .message-content {
            border-bottom-left-radius: 4px;
            background-color: var(--primary-light);
        }
        
        .chatbot-message.user .message-content {
            border-bottom-right-radius: 4px;
            background-color: var(--primary-color);
            color: white;
        }
        
        .message-content p {
            margin: 0;
            font-size: 14px;
        }
        
        #chatbot-typing {
            padding: 0 15px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            background-color: var(--primary-light);
            padding: 12px 16px;
            border-radius: 16px;
            border-bottom-left-radius: 4px;
        }
        
        .typing-indicator span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--primary-color);
            animation: typing 1.4s infinite ease-in-out both;
            opacity: 0.7;
        }
        
        .typing-indicator span:nth-child(1) {
            animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-4px);
            }
        }
        
        #chatbot-input-area {
            padding: 15px;
            display: flex;
            gap: 10px;
            border-top: 1px solid rgba(0, 0, 0, 0.08);
            background-color: white;
        }
        
        #chatbot-input {
            flex: 1;
            border: 1px solid var(--medium-gray);
            border-radius: 25px;
            padding: 12px 18px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.3s;
        }
        
        #chatbot-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(44, 108, 255, 0.1);
        }
        
        #chatbot-send {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        #chatbot-send:hover {
            transform: scale(1.1);
            box-shadow: 0 2px 8px rgba(44, 108, 255, 0.3);
        }
        
        #chatbot-send i {
            font-size: 16px;
        }
        
        .hidden {
            display: none !important;
        }
        
        /* Animations */
        .fade-in {
            animation: fadeIn 0.3s forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Responsive adjustments */
        @media screen and (max-width: 576px) {
            #chatbot-panel {
                width: 300px;
                height: 450px;
                right: 10px;
                bottom: 70px;
            }
            
            #chatbot-button {
                width: 50px;
                height: 50px;
            }
            
            #chatbot-button i {
                font-size: 20px;
            }
        }
    `;

  // Add the styles
  const styleElement = document.createElement("style");
  styleElement.id = "chatbot-styles";
  styleElement.textContent = chatbotStyles;
  document.head.appendChild(styleElement);

  // Get elements
  const chatbotButton = document.getElementById("chatbot-button");
  const chatbotPanel = document.getElementById("chatbot-panel");
  const chatbotMinimize = document.getElementById("chatbot-minimize");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotConversation = document.getElementById("chatbot-conversation");
  const chatbotTyping = document.getElementById("chatbot-typing");

  // Toggle chatbot panel
  chatbotButton.addEventListener("click", () => {
    chatbotPanel.classList.toggle("active");

    if (chatbotPanel.classList.contains("active")) {
      chatbotInput.focus();
      // Show notification dot on button
      if (chatbotButton.querySelector(".notification-dot")) {
        chatbotButton.querySelector(".notification-dot").remove();
      }
    }
  });

  // Minimize chatbot
  chatbotMinimize.addEventListener("click", () => {
    chatbotPanel.classList.remove("active");
  });

  // Close chatbot
  chatbotClose.addEventListener("click", () => {
    chatbotPanel.classList.remove("active");
  });

  // Send message
  chatbotSend.addEventListener("click", sendMessage);

  // Send message on Enter key
  chatbotInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Function to add a message to the conversation
  function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `chatbot-message ${sender}`;

    let avatar;
    if (sender === "bot") {
      avatar = `
                <div class="chatbot-avatar">
                    <svg class="chatbot-icon" viewBox="0 0 100 100" width="30" height="30">
                        <polygon points="50,15 85,40 85,85 15,85 15,40" fill="white" stroke="#2c6cff" stroke-width="3" stroke-linejoin="round"></polygon>
                        <polygon points="50,5 90,35 10,35" fill="#2c6cff" stroke="#2c6cff" stroke-width="2"></polygon>
                        <rect x="40" y="60" width="20" height="25" fill="#5f9ea0" rx="2" ry="2"></rect>
                        <circle cx="45" cy="72.5" r="2" fill="white"></circle>
                        <rect x="25" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                        <rect x="60" y="50" width="15" height="15" fill="#2c6cff" stroke="white" stroke-width="2" rx="2" ry="2"></rect>
                    </svg>
                </div>
            `;
    } else {
      avatar = `
                <div class="chatbot-avatar">
                    <i class="fas fa-user"></i>
                </div>
            `;
    }

    message.innerHTML = `
            ${avatar}
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;

    message.style.opacity = "0";
    chatbotConversation.appendChild(message);

    // Scroll to bottom
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;

    // Fade in animation
    setTimeout(() => {
      message.style.opacity = "1";
      message.style.transition = "opacity 0.3s";
    }, 10);
  }

  // Function to send message
  function sendMessage() {
    const text = chatbotInput.value.trim();
    if (text.length === 0) return;

    // Add user message
    addMessage(text, "user");

    // Clear input
    chatbotInput.value = "";

    // Show typing indicator
    chatbotTyping.classList.remove("hidden");

    // Scroll to see the typing indicator
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;

    // Process message and get response (with a simulated delay for realism)
    setTimeout(() => {
      // Hide typing indicator
      chatbotTyping.classList.add("hidden");

      // Get AI response
      const response = getAIResponse(text);

      // Add bot response
      addMessage(response, "bot");
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds for realism
  }

  // Function to get AI response based on the website's content
  function getAIResponse(userInput) {
    // Convert user input to lowercase for easier matching
    const input = userInput.toLowerCase();

    // Basic knowledge base derived from your website content
    const knowledgeBase = [
      {
        keywords: [
          "price",
          "cost",
          "pricing",
          "payment",
          "subscription",
          "pay",
          "money",
        ],
        response:
          "We offer flexible pricing options including pay-as-you-go starting at $1.99 per image, or subscription plans starting at $29/month for 20 images. Our Professional plan at $2.49 per image is our most popular option. For high volume needs, we offer agency plans with special pricing. Would you like more specific pricing details?",
      },
      {
        keywords: [
          "how",
          "work",
          "process",
          "enhance",
          "steps",
          "ai",
          "technology",
        ],
        response:
          "Our enhancement process works in 4 simple steps: 1) Upload your real estate photos to our platform, 2) Select your desired enhancement level (minimal, moderate, or significant), 3) Our AI processes your images while preserving property accuracy, and 4) Download your enhanced images ready for marketing. The entire process typically takes just a few minutes.",
      },
      {
        keywords: ["subscription", "plan", "monthly", "package"],
        response:
          "Our subscription plans include Basic ($29/month for 20 images), Pro ($79/month for 60 images), and Agency ($199/month for 200 images). All plans include access to all enhancement levels and varying storage periods. Subscription plans are ideal for regular users and offer better per-image pricing.",
      },
      {
        keywords: [
          "difference",
          "level",
          "minimal",
          "moderate",
          "significant",
          "enhancement",
          "options",
        ],
        response:
          "We offer three enhancement levels: Minimal provides subtle improvements while preserving the original look, Moderate offers balanced enhancements with noticeable improvements in lighting and colors, and Significant delivers dramatic improvements for maximum property appeal while maintaining realism. You can select the level that best suits your marketing needs.",
      },
      {
        keywords: ["storage", "save", "cloud", "access", "period", "time"],
        response:
          "We store your enhanced images for easy access. Storage periods vary by plan: 30 days for pay-as-you-go customers, 60 days for Basic subscription, 90 days for Pro, and 120 days for Agency customers. You can always download your images immediately after enhancement to your local storage.",
      },
      {
        keywords: ["contact", "support", "help", "question", "service", "team"],
        response:
          "For any questions or support, you can reach our team through the contact form on our website. We provide email support for all customers, with priority and dedicated support for higher-tier plans. For enterprise or custom needs, please contact our sales team directly.",
      },
      {
        keywords: ["format", "file", "type", "jpeg", "png", "webp"],
        response:
          "We support all common image formats including JPEG, PNG, and WEBP. After enhancement, you can download images in the same format they were uploaded or choose a different format if needed.",
      },
      {
        keywords: ["time", "long", "take", "minutes", "processing", "wait"],
        response:
          "Processing time depends on the number of images and enhancement level selected. Typically, individual images are enhanced within seconds, while batches may take a few minutes. Priority and expedited processing are available with our Professional and Agency plans.",
      },
      {
        keywords: ["bulk", "discount", "large", "volume", "multiple", "batch"],
        response:
          "We offer bulk discounts for large volume orders. Our Agency pay-as-you-go plan starts at $1.99 per image for 50+ images. For even larger volumes, please contact our sales team for custom enterprise pricing tailored to your needs.",
      },
      {
        keywords: [
          "quality",
          "realistic",
          "realistic",
          "accurate",
          "fake",
          "real",
        ],
        response:
          "Our AI enhancement maintains property integrity while creating stunning marketing materials. We focus on realistic improvements rather than deceptive editing. Enhancements include lighting correction, color balancing, sky enhancement, and decluttering, but always preserve the actual features and characteristics of the property.",
      },
      {
        keywords: ["hello", "hi", "hey", "start", "greeting"],
        response:
          "Hello! I'm the RealtyEnhance Assistant. I can help answer questions about our real estate image enhancement services, pricing, or how our process works. What would you like to know?",
      },
    ];

    // Check for matches in the knowledge base
    for (const item of knowledgeBase) {
      if (item.keywords.some((keyword) => input.includes(keyword))) {
        return item.response;
      }
    }

    // Default response if no match found
    return "I don't have specific information about that in my database. Our RealtyEnhance service offers professional AI-powered image enhancement for real estate photos with various pricing options and enhancement levels. Would you like to know more about our pricing, how the service works, or see some examples?";
  }

  // Add notification dot to the chat button when closed
  function addNotificationDot() {
    if (
      !chatbotPanel.classList.contains("active") &&
      !document.querySelector(".notification-dot")
    ) {
      const dot = document.createElement("div");
      dot.className = "notification-dot";
      dot.style.cssText = `
                position: absolute;
                top: 0;
                right: 0;
                width: 12px;
                height: 12px;
                background-color: #ff6b35;
                border-radius: 50%;
                border: 2px solid white;
            `;
      chatbotButton.appendChild(dot);
    }
  }

  // Simulate occasional proactive messages if the chat is idle
  let proactiveMessageTimer;

  function startProactiveMessageTimer() {
    // Clear any existing timer
    if (proactiveMessageTimer) {
      clearTimeout(proactiveMessageTimer);
    }

    // Set a new timer for a random time between 60-120 seconds
    proactiveMessageTimer = setTimeout(() => {
      // Only show proactive message if the panel is not active
      if (!chatbotPanel.classList.contains("active")) {
        // Add notification dot to the chat button
        addNotificationDot();
      }
    }, 60000 + Math.random() * 60000);
  }

  // Initialize the proactive message timer
  startProactiveMessageTimer();

  // Reset the timer on user interaction
  chatbotInput.addEventListener("focus", startProactiveMessageTimer);
  document.addEventListener("click", startProactiveMessageTimer);

  // Expose the chatbot API for potential future integrations
  window.realtyChatbot = {
    open: function () {
      chatbotPanel.classList.add("active");
      chatbotInput.focus();
    },
    close: function () {
      chatbotPanel.classList.remove("active");
    },
    addMessage: addMessage,
  };
  // DOM Elements
  const body = document.body;

  // Insert the auth button in the header nav
  const navEl = document.querySelector("header nav ul");
  if (navEl) {
    const authButtonHTML = `
          <li class="auth-nav-item">
              <a href="#" id="auth-button" class="btn btn-secondary">
                  <i class="fas fa-user"></i> <span>Login / Sign Up</span>
              </a>
          </li>
      `;
    navEl.insertAdjacentHTML("beforeend", authButtonHTML);
  }

  // Inject auth modal HTML
  fetch("auth-modal.html")
    .then((response) => response.text())
    .then((html) => {
      body.insertAdjacentHTML("beforeend", html);
      initAuthSystem();
    })
    .catch((error) => {
      console.error("Error loading auth modal:", error);
      // Fallback: Add the auth HTML directly to the body
      const authHTML = `
              <!-- Auth Modal HTML -->
              <div id="auth-modal" class="modal-overlay">
                  <div class="auth-container">
                      <div class="auth-header">
                          <div class="auth-tabs">
                              <button class="auth-tab active" data-tab="login">Login</button>
                              <button class="auth-tab" data-tab="signup">Sign Up</button>
                          </div>
                          <button class="close-modal"><i class="fas fa-times"></i></button>
                      </div>
                      
                      <div class="auth-body">
                          <!-- Login Form -->
                          <form id="login-form" class="auth-form active">
                              <div class="form-group">
                                  <label for="login-email">Email</label>
                                  <div class="input-with-icon">
                                      <i class="fas fa-envelope"></i>
                                      <input type="email" id="login-email" required placeholder="Enter your email">
                                  </div>
                              </div>
                              <div class="form-group">
                                  <label for="login-password">Password</label>
                                  <div class="input-with-icon">
                                      <i class="fas fa-lock"></i>
                                      <input type="password" id="login-password" required placeholder="Enter your password">
                                  </div>
                              </div>
                              <div class="form-options">
                                  <label class="checkbox-container">
                                      <input type="checkbox" id="remember-me">
                                      <span class="checkmark"></span>
                                      Remember me
                                  </label>
                                  <a href="#" class="forgot-password">Forgot password?</a>
                              </div>
                              <button type="submit" class="btn btn-primary btn-block">Login</button>
                              <div class="social-login">
                                  <p>Or continue with</p>
                                  <div class="social-buttons">
                                      <button type="button" class="social-button google">
                                          <i class="fab fa-google"></i>
                                      </button>
                                      <button type="button" class="social-button facebook">
                                          <i class="fab fa-facebook-f"></i>
                                      </button>
                                      <button type="button" class="social-button apple">
                                          <i class="fab fa-apple"></i>
                                      </button>
                                  </div>
                              </div>
                          </form>
                          
                          <!-- Signup Form -->
                          <form id="signup-form" class="auth-form">
                              <div class="form-group">
                                  <label for="signup-name">Full Name</label>
                                  <div class="input-with-icon">
                                      <i class="fas fa-user"></i>
                                      <input type="text" id="signup-name" required placeholder="Enter your full name">
                                  </div>
                              </div>
                              <div class="form-group">
                                  <label for="signup-email">Email</label>
                                  <div class="input-with-icon">
                                      <i class="fas fa-envelope"></i>
                                      <input type="email" id="signup-email" required placeholder="Enter your email">
                                  </div>
                              </div>
                              <div class="form-group">
                                  <label for="signup-password">Password</label>
                                  <div class="input-with-icon">
                                      <i class="fas fa-lock"></i>
                                      <input type="password" id="signup-password" required placeholder="Create a password">
                                      <div class="password-strength">
                                          <div class="strength-meter">
                                              <div class="strength-bar"></div>
                                          </div>
                                          <span class="strength-text">Password strength</span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-group">
                                  <label for="signup-confirm">Confirm Password</label>
                                  <div class="input-with-icon">
                                      <i class="fas fa-lock"></i>
                                      <input type="password" id="signup-confirm" required placeholder="Confirm your password">
                                  </div>
                              </div>
                              <div class="form-options">
                                  <label class="checkbox-container">
                                      <input type="checkbox" id="terms-agree" required>
                                      <span class="checkmark"></span>
                                      I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="privacy-link">Privacy Policy</a>
                                  </label>
                              </div>
                              <button type="submit" class="btn btn-primary btn-block">Create Account</button>
                              <div class="social-login">
                                  <p>Or sign up with</p>
                                  <div class="social-buttons">
                                      <button type="button" class="social-button google">
                                          <i class="fab fa-google"></i>
                                      </button>
                                      <button type="button" class="social-button facebook">
                                          <i class="fab fa-facebook-f"></i>
                                      </button>
                                      <button type="button" class="social-button apple">
                                          <i class="fab fa-apple"></i>
                                      </button>
                                  </div>
                              </div>
                          </form>
                          
                          <!-- Forgot Password Form -->
                          <form id="forgot-form" class="auth-form">
                              <div class="form-header">
                                  <h3>Reset Your Password</h3>
                                  <p>Enter your email address and we'll send you a link to reset your password.</p>
                              </div>
                              <div class="form-group">
                                  <label for="forgot-email">Email</label>
                                  <div class="input-with-icon">
                                      <i class="fas fa-envelope"></i>
                                      <input type="email" id="forgot-email" required placeholder="Enter your email">
                                  </div>
                              </div>
                              <button type="submit" class="btn btn-primary btn-block">Send Reset Link</button>
                              <button type="button" class="btn btn-secondary btn-block back-to-login">Back to Login</button>
                          </form>
                      </div>
                  </div>
              </div>
              
              <!-- Account Settings Modal -->
              <div id="account-settings-modal" class="modal-overlay">
                  <!-- Account Settings Modal Content -->
              </div>
              
              <!-- Enhanced Images Library Modal -->
              <div id="images-library-modal" class="modal-overlay">
                  <!-- Images Library Modal Content -->
              </div>
          `;
      body.insertAdjacentHTML("beforeend", authHTML);
      initAuthSystem();
    });

  // Initialize Auth System
  function initAuthSystem() {
    // Elements
    const authButton = document.getElementById("auth-button");
    const authModal = document.getElementById("auth-modal");
    const authTabs = document.querySelectorAll(".auth-tab");
    const authForms = document.querySelectorAll(".auth-form");
    const closeModalBtns = document.querySelectorAll(".close-modal");
    const forgotPasswordLink = document.querySelector(".forgot-password");
    const backToLoginBtn = document.querySelector(".back-to-login");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const forgotForm = document.getElementById("forgot-form");
    const signupPassword = document.getElementById("signup-password");
    const passwordStrengthBar = document.querySelector(".strength-bar");
    const passwordStrengthText = document.querySelector(".strength-text");

    // Mock user data for demo
    const users = [
      {
        id: 1,
        name: "Demo User",
        email: "demo@example.com",
        password: "password123", // In a real app, this would be hashed
        images: [],
      },
    ];

    let currentUser = null;

    // Check for logged in user in local storage
    const checkLoggedInUser = () => {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
      }
    };

    // Update UI for logged in user
    const updateUIForLoggedInUser = () => {
      if (authButton) {
        authButton.innerHTML = `<i class="fas fa-user-circle"></i> <span>${
          currentUser.name.split(" ")[0]
        }</span>`;
        authButton.classList.add("logged-in");
      }
    };

    // Update UI for logged out user
    const updateUIForLoggedOutUser = () => {
      if (authButton) {
        authButton.innerHTML = `<i class="fas fa-user"></i> <span>Login / Sign Up</span>`;
        authButton.classList.remove("logged-in");
      }
    };

    // Toggle auth modal
    if (authButton) {
      authButton.addEventListener("click", function (e) {
        e.preventDefault();

        if (currentUser) {
          // Show user dropdown menu
          const accountDropdown = document.getElementById("account-dropdown");
          if (accountDropdown) {
            // Update user info
            const userName = accountDropdown.querySelector(".user-name");
            const userEmail = accountDropdown.querySelector(".user-email");

            if (userName && userEmail) {
              userName.textContent = currentUser.name;
              userEmail.textContent = currentUser.email;
            }

            // Toggle dropdown
            accountDropdown.classList.toggle("active");

            // Close dropdown when clicking outside
            const closeDropdown = (event) => {
              if (
                !accountDropdown.contains(event.target) &&
                !authButton.contains(event.target)
              ) {
                accountDropdown.classList.remove("active");
                document.removeEventListener("click", closeDropdown);
              }
            };

            // Add event listener with a delay to prevent immediate closing
            setTimeout(() => {
              document.addEventListener("click", closeDropdown);
            }, 100);
          }
        } else {
          // Show auth modal for login/signup
          showModal(authModal);
        }
      });
    }

    // Tab switching
    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.getAttribute("data-tab");

        // Update active tab
        authTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Show corresponding form
        authForms.forEach((form) => {
          form.classList.remove("active");
          if (form.id === `${targetTab}-form`) {
            form.classList.add("active");
          }
        });
      });
    });

    // Close modal
    closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal-overlay");
        hideModal(modal);
      });
    });

    // Forgot password link
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        authForms.forEach((form) => form.classList.remove("active"));
        forgotForm.classList.add("active");
      });
    }

    // Back to login button
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener("click", () => {
        authForms.forEach((form) => form.classList.remove("active"));
        loginForm.classList.add("active");
      });
    }

    // Password strength meter
    if (signupPassword) {
      signupPassword.addEventListener("input", () => {
        const password = signupPassword.value;
        const strengthScore = calculatePasswordStrength(password);

        // Update strength bar
        passwordStrengthBar.style.width = `${strengthScore}%`;

        // Set color based on strength
        if (strengthScore < 30) {
          passwordStrengthBar.style.backgroundColor = "#e74c3c"; // Weak
          passwordStrengthText.textContent = "Weak password";
        } else if (strengthScore < 60) {
          passwordStrengthBar.style.backgroundColor = "#f39c12"; // Medium
          passwordStrengthText.textContent = "Medium strength";
        } else {
          passwordStrengthBar.style.backgroundColor = "#2ecc71"; // Strong
          passwordStrengthText.textContent = "Strong password";
        }
      });
    }

    // Login form submission
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const rememberMe = document.getElementById("remember-me").checked;

        // Validate inputs
        if (!email || !password) {
          showNotification("Please fill in all fields", "error");
          return;
        }

        // For demo purposes, check against mock users
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          // Login successful
          currentUser = user;

          // Save to local storage if remember me is checked
          if (rememberMe) {
            localStorage.setItem("currentUser", JSON.stringify(user));
          }

          // Update UI
          updateUIForLoggedInUser();

          // Close modal
          hideModal(authModal);

          // Show success message
          showNotification("Login successful! Welcome back.", "success");
        } else {
          // Login failed
          showNotification("Invalid email or password", "error");
        }
      });
    }

    // Signup form submission
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm").value;
        const termsAgreed = document.getElementById("terms-agree").checked;

        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
          showNotification("Please fill in all fields", "error");
          return;
        }

        if (password !== confirmPassword) {
          showNotification("Passwords do not match", "error");
          return;
        }

        if (!termsAgreed) {
          showNotification(
            "You must agree to the terms and privacy policy",
            "error"
          );
          return;
        }

        // Check if email already exists
        if (users.some((u) => u.email === email)) {
          showNotification("Email already in use", "error");
          return;
        }

        // Create new user
        const newUser = {
          id: users.length + 1,
          name,
          email,
          password, // In a real app, this would be hashed
          images: [],
        };

        // Add to users array
        users.push(newUser);

        // Set as current user
        currentUser = newUser;

        // Save to local storage
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        // Update UI
        updateUIForLoggedInUser();

        // Close modal
        hideModal(authModal);

        // Show success message
        showNotification("Account created successfully!", "success");
      });
    }

    // Forgot password form submission
    if (forgotForm) {
      forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("forgot-email").value;

        // Validate email
        if (!email) {
          showNotification("Please enter your email", "error");
          return;
        }

        // Check if email exists
        if (!users.some((u) => u.email === email)) {
          showNotification("No account found with this email", "error");
          return;
        }

        // Show success message (in a real app, this would send an email)
        showNotification(
          "Password reset link sent! Please check your email.",
          "success"
        );

        // Go back to login form
        authForms.forEach((form) => form.classList.remove("active"));
        loginForm.classList.add("active");
      });
    }

    // Implement logout functionality
    document.addEventListener("click", (e) => {
      if (e.target.closest(".logout-link")) {
        e.preventDefault();

        // Clear current user
        currentUser = null;
        localStorage.removeItem("currentUser");

        // Update UI
        updateUIForLoggedOutUser();

        // Close user dropdown if open
        const accountDropdown = document.getElementById("account-dropdown");
        if (accountDropdown) {
          accountDropdown.classList.remove("active");
        }

        // Show success message
        showNotification("You have been logged out", "success");
      }
    });

    // Account settings modal
    document.addEventListener("click", (e) => {
      if (e.target.closest("#account-settings")) {
        e.preventDefault();

        // Close account dropdown
        const accountDropdown = document.getElementById("account-dropdown");
        if (accountDropdown) {
          accountDropdown.classList.remove("active");
        }

        // Show account settings modal
        const accountSettingsModal = document.getElementById(
          "account-settings-modal"
        );
        if (accountSettingsModal) {
          showModal(accountSettingsModal);

          // Fill form with user data
          const nameInput = document.getElementById("profile-first-name");
          const emailInput = document.getElementById("profile-email");

          if (nameInput && emailInput && currentUser) {
            const nameParts = currentUser.name.split(" ");
            nameInput.value = nameParts[0] || "";
            document.getElementById("profile-last-name").value =
              nameParts.slice(1).join(" ") || "";
            emailInput.value = currentUser.email || "";
          }
        }
      }
    });

    // My Images modal
    document.addEventListener("click", (e) => {
      if (e.target.closest("#my-images")) {
        e.preventDefault();

        // Close account dropdown
        const accountDropdown = document.getElementById("account-dropdown");
        if (accountDropdown) {
          accountDropdown.classList.remove("active");
        }

        // Show images library modal
        const imagesLibraryModal = document.getElementById(
          "images-library-modal"
        );
        if (imagesLibraryModal) {
          showModal(imagesLibraryModal);
        }
      }
    });

    // Settings tabs
    const settingsTabs = document.querySelectorAll(".settings-tab");
    settingsTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.getAttribute("data-tab");

        // Update active tab
        settingsTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Show corresponding panel
        const panels = document.querySelectorAll(".settings-panel");
        panels.forEach((panel) => {
          panel.classList.remove("active");
          if (panel.id === `${targetTab}-panel`) {
            panel.classList.add("active");
          }
        });
      });
    });

    // Library view options
    const viewOptions = document.querySelectorAll(".view-option");
    const libraryContent = document.querySelector(".library-content");

    viewOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const viewType = option.getAttribute("data-view");

        // Update active option
        viewOptions.forEach((o) => o.classList.remove("active"));
        option.classList.add("active");

        // Update view
        if (libraryContent) {
          libraryContent.className = `library-content ${viewType}-view`;
        }
      });
    });

    // Library filters
    const filterOptions = document.querySelectorAll(".filter-option");

    filterOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Update active filter in the same group
        const filterGroup = option.closest(".filter-group");
        if (filterGroup) {
          filterGroup
            .querySelectorAll(".filter-option")
            .forEach((o) => o.classList.remove("active"));
          option.classList.add("active");
        }

        // Apply filter (in a real app, this would filter the images)
        // For demo purposes, we'll just show a notification
        const filterType = option.getAttribute("data-filter");
        if (filterType === "custom") {
          // Show date picker (not implemented in this demo)
          showNotification("Date range picker would open here", "info");
        }
      });
    });

    // Utility function to show modal
    function showModal(modal) {
      if (!modal) return;

      // Prevent body scrolling
      document.body.style.overflow = "hidden";

      // Show modal
      modal.classList.add("active");

      // Close modal on background click
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          hideModal(modal);
        }
      });

      // Close on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          hideModal(modal);
        }
      });
    }

    // Utility function to hide modal
    function hideModal(modal) {
      if (!modal) return;

      // Allow body scrolling
      document.body.style.overflow = "";

      // Hide modal
      modal.classList.remove("active");
    }

    // Password strength calculation
    function calculatePasswordStrength(password) {
      if (!password) return 0;

      let score = 0;

      // Length
      score += Math.min(password.length * 4, 40);

      // Lowercase
      if (/[a-z]/.test(password)) score += 10;

      // Uppercase
      if (/[A-Z]/.test(password)) score += 10;

      // Numbers
      if (/[0-9]/.test(password)) score += 10;

      // Special characters
      if (/[^a-zA-Z0-9]/.test(password)) score += 10;

      // Variety
      const variety = new Set(password.split("")).size;
      score += Math.min(variety * 2, 20);

      return Math.min(score, 100);
    }

    // Notification function (uses the existing notification system)
    function showNotification(message, type = "success") {
      // Check if the notification function exists in the global scope
      if (typeof window.showNotification === "function") {
        window.showNotification(message, type);
      } else {
        // Fallback if notification function doesn't exist
        alert(message);
      }
    }

    // Check for logged in user on load
    checkLoggedInUser();
  }

  // Make notification function globally available
  window.showNotification = function (message, type = "success") {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById(
      "notification-container"
    );
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.id = "notification-container";
      notificationContainer.style.position = "fixed";
      notificationContainer.style.top = "100px";
      notificationContainer.style.right = "20px";
      notificationContainer.style.zIndex = "9999";
      document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
          <div class="notification-content">
              <i class="fas ${
                type === "success"
                  ? "fa-check-circle"
                  : type === "error"
                  ? "fa-exclamation-circle"
                  : "fa-info-circle"
              }"></i>
              <span>${message}</span>
          </div>
          <button class="close-notification"><i class="fas fa-times"></i></button>
      `;

    // Notification styles
    if (!document.getElementById("notification-styles")) {
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
              
              .notification.success { border-left-color: #2ecc71; }
              .notification.error { border-left-color: #e74c3c; }
              .notification.info { border-left-color: var(--primary-color); }
              
              .notification-content {
                  display: flex;
                  align-items: center;
              }
              
              .notification-content i {
                  margin-right: 10px;
                  font-size: 18px;
              }
              
              .notification.success i { color: #2ecc71; }
              .notification.error i { color: #e74c3c; }
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
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = notificationStyles;
      document.head.appendChild(style);
    }

    // Add close button functionality
    notification
      .querySelector(".close-notification")
      .addEventListener("click", () => {
        notification.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => {
          notification.remove();
        }, 300);
      });

    // Add to container
    notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.animation = "slideIn 0.3s forwards";
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  };
});

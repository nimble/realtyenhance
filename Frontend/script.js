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
  const signInForm = document.getElementById("signInForm");

  // Global variables
  let uploadedFiles = [];
  let enhancedImages = [];

  // Add header scroll effect for enhanced aesthetics
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }
  });

  // Initialize animation on scroll
  initializeAnimations();

  // Initialize smooth scrolling for anchor links
  initializeSmoothScrolling();

  // Initialize drag and drop functionality
  initializeDragAndDrop();

  // Add event listeners to buttons if they exist
  addButtonEventListeners();

  // Initialize pricing toggle functionality
  initializePricingToggle();

  // Initialize chatbot
  initializeChatbot();

  // Initialize auth system
  initializeAuthSystem();

  // Functions
  function initializeAnimations() {
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
  }

  function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const headerOffset =
            document.querySelector("header")?.offsetHeight || 0;
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
  }

  function initializeDragAndDrop() {
    // Check if elements exist before adding event listeners to prevent errors
    if (browseBtn && fileInput) {
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
  }

  function addButtonEventListeners() {
    if (enhanceBtn) {
      enhanceBtn.addEventListener("click", enhanceImages);
    }

    if (downloadAllBtn) {
      downloadAllBtn.addEventListener("click", downloadAllImages);
    }

    if (startOverBtn) {
      startOverBtn.addEventListener("click", resetApp);
    }

    // Add sign-in form listener if it exists
    if (signInForm) {
      signInForm.addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = "signin.html";
      });
    }
  }

  function initializePricingToggle() {
    if (pricingToggle) {
      pricingToggle.addEventListener("change", function () {
        const payAsYouGo = document.querySelector(
          ".pricing-options.pay-as-you-go"
        );
        const subscription = document.querySelector(
          ".pricing-options.subscription"
        );

        if (payAsYouGo && subscription) {
          if (this.checked) {
            // Show subscription plans
            payAsYouGo.classList.add("hidden");
            subscription.classList.remove("hidden");
          } else {
            // Show pay-as-you-go plans
            subscription.classList.add("hidden");
            payAsYouGo.classList.remove("hidden");
          }
        }
      });
    }
  }

  // Utility functions
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    if (dropArea) {
      dropArea.classList.add("active");
    }
  }

  function unhighlight() {
    if (dropArea) {
      dropArea.classList.remove("active");
    }
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
                        `<div class="file-thumbnail" title="${file.name}">
                        <img src="${URL.createObjectURL(file)}" alt="Preview">
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
        const headerOffset =
          document.querySelector("header")?.offsetHeight || 0;
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
      const headerOffset = document.querySelector("header")?.offsetHeight || 0;
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
  function addComparisonStyles() {
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
  }
  addComparisonStyles();

  // Image lazy loading for better performance
  function lazyLoadImages() {
    const lazyImages = document.querySelectorAll(".example-img[data-src]");

    if ("IntersectionObserver" in window && lazyImages.length > 0) {
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
  }

  // Initialize lazy loading
  lazyLoadImages();

  // Chatbot functionality
  function initializeChatbot() {
    // Add the chatbot HTML
    addChatbotHTML();

    // Get elements
    const chatbotButton = document.getElementById("chatbot-button");
    const chatbotPanel = document.getElementById("chatbot-panel");
    const chatbotMinimize = document.getElementById("chatbot-minimize");
    const chatbotClose = document.getElementById("chatbot-close");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSend = document.getElementById("chatbot-send");
    const chatbotConversation = document.getElementById("chatbot-conversation");
    const chatbotTyping = document.getElementById("chatbot-typing");

    if (!chatbotButton || !chatbotPanel) return;

    // Toggle chatbot panel
    chatbotButton.addEventListener("click", () => {
      chatbotPanel.classList.toggle("active");

      if (chatbotPanel.classList.contains("active") && chatbotInput) {
        chatbotInput.focus();
        // Show notification dot on button
        const notificationDot =
          chatbotButton.querySelector(".notification-dot");
        if (notificationDot) {
          notificationDot.remove();
        }
      }
    });

    // Minimize chatbot
    if (chatbotMinimize) {
      chatbotMinimize.addEventListener("click", () => {
        chatbotPanel.classList.remove("active");
      });
    }

    // Close chatbot
    if (chatbotClose) {
      chatbotClose.addEventListener("click", () => {
        chatbotPanel.classList.remove("active");
      });
    }

    // Send message
    if (chatbotSend && chatbotInput) {
      chatbotSend.addEventListener("click", sendMessage);

      // Send message on Enter key
      chatbotInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      });
    }

    // Function to add a message to the conversation
    function addMessage(text, sender) {
      if (!chatbotConversation) return;

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
      if (!chatbotInput || !chatbotTyping) return;

      const text = chatbotInput.value.trim();
      if (text.length === 0) return;

      // Add user message
      addMessage(text, "user");

      // Clear input
      chatbotInput.value = "";

      // Show typing indicator
      chatbotTyping.classList.remove("hidden");

      // Scroll to see the typing indicator
      if (chatbotConversation) {
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
      }

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
          keywords: [
            "contact",
            "support",
            "help",
            "question",
            "service",
            "team",
          ],
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
          keywords: [
            "bulk",
            "discount",
            "large",
            "volume",
            "multiple",
            "batch",
          ],
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
        chatbotPanel &&
        chatbotButton &&
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
        if (chatbotPanel && !chatbotPanel.classList.contains("active")) {
          // Add notification dot to the chat button
          addNotificationDot();
        }
      }, 60000 + Math.random() * 60000);
    }

    // Initialize the proactive message timer
    startProactiveMessageTimer();

    // Reset the timer on user interaction
    if (chatbotInput) {
      chatbotInput.addEventListener("focus", startProactiveMessageTimer);
    }
    document.addEventListener("click", startProactiveMessageTimer);

    // Expose the chatbot API for potential future integrations
    window.realtyChatbot = {
      open: function () {
        if (chatbotPanel) {
          chatbotPanel.classList.add("active");
          if (chatbotInput) chatbotInput.focus();
        }
      },
      close: function () {
        if (chatbotPanel) {
          chatbotPanel.classList.remove("active");
        }
      },
      addMessage: addMessage,
    };
  }

  function addChatbotHTML() {
    // Check if chatbot already exists
    if (document.getElementById("chatbot-container")) return;

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
    if (!document.getElementById("chatbot-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "chatbot-styles";
      styleElement.textContent = chatbotStyles;
      document.head.appendChild(styleElement);
    }
  }

  // Auth System
  function initializeAuthSystem() {
    // Make notification function globally available
    window.showNotification = showNotification;

    // DOM Elements
    const body = document.body;
    const signInBtn = document.getElementById("signIn-Btn");

    // Add event listener to the sign-in button if it exists
    if (signInBtn) {
      const signInForm = signInBtn.closest("form");
      if (signInForm) {
        signInForm.addEventListener("submit", function (event) {
          event.preventDefault();
          window.location.href = "signin.html";
        });
      }
    }

    // Find and initialize any existing auth buttons
    const existingAuthButton = document.getElementById("auth-button");
    if (existingAuthButton) {
      existingAuthButton.addEventListener("click", function (e) {
        e.preventDefault();
        // Check if we already have a user
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          toggleUserDropdown();
        } else {
          // Navigate to signin page or show auth modal
          window.location.href = "signin.html";
        }
      });
    }

    // Function to toggle user dropdown menu
    function toggleUserDropdown() {
      let accountDropdown = document.getElementById("account-dropdown");
      if (!accountDropdown) {
        // Create dropdown if it doesn't exist
        accountDropdown = document.createElement("div");
        accountDropdown.id = "account-dropdown";
        accountDropdown.className = "account-dropdown";
        accountDropdown.innerHTML = `
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
              <span class="user-name">User Name</span>
              <span class="user-email">user@example.com</span>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <ul class="dropdown-menu">
            <li><a href="#" id="account-settings"><i class="fas fa-cog"></i> Account Settings</a></li>
            <li><a href="#" id="my-images"><i class="fas fa-images"></i> My Images</a></li>
            <li><a href="#" class="logout-link"><i class="fas fa-sign-out-alt"></i> Log Out</a></li>
          </ul>
        `;
        document.body.appendChild(accountDropdown);

        // Add styles for the dropdown
        if (!document.getElementById("dropdown-styles")) {
          const dropdownStyles = document.createElement("style");
          dropdownStyles.id = "dropdown-styles";
          dropdownStyles.textContent = `
            .account-dropdown {
              position: absolute;
              top: 80px;
              right: 20px;
              width: 280px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 5px 20px rgba(0,0,0,0.15);
              z-index: 1000;
              padding: 15px 0;
              opacity: 0;
              transform: translateY(-10px);
              pointer-events: none;
              transition: all 0.3s ease;
            }
            
            .account-dropdown.active {
              opacity: 1;
              transform: translateY(0);
              pointer-events: all;
            }
            
            .user-info {
              display: flex;
              align-items: center;
              padding: 0 20px 15px;
            }
            
            .user-avatar {
              width: 42px;
              height: 42px;
              background-color: var(--primary-light);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
            }
            
            .user-avatar i {
              font-size: 22px;
              color: var(--primary-color);
            }
            
            .user-details {
              display: flex;
              flex-direction: column;
            }
            
            .user-name {
              font-weight: 600;
              font-size: 15px;
              margin-bottom: 3px;
            }
            
            .user-email {
              font-size: 13px;
              color: var(--dark-gray);
              opacity: 0.8;
            }
            
            .dropdown-divider {
              border-top: 1px solid var(--medium-gray);
              margin: 0 0 10px;
            }
            
            .dropdown-menu {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .dropdown-menu li {
              margin: 0;
              padding: 0;
            }
            
            .dropdown-menu li a {
              display: flex;
              align-items: center;
              padding: 10px 20px;
              color: var(--text-color);
              text-decoration: none;
              font-size: 14px;
              transition: background-color 0.2s;
            }
            
            .dropdown-menu li a:hover {
              background-color: var(--light-gray);
              color: var(--primary-color);
            }
            
            .dropdown-menu li a i {
              margin-right: 10px;
              font-size: 16px;
              width: 18px;
              text-align: center;
            }
            
            .logout-link {
              color: #dc3545 !important;
            }
            
            .logout-link:hover {
              background-color: rgba(220, 53, 69, 0.1) !important;
            }
          `;
          document.head.appendChild(dropdownStyles);
        }

        // Add event listeners to dropdown items
        const accountSettings = document.getElementById("account-settings");
        const myImages = document.getElementById("my-images");
        const logoutLink = document.querySelector(".logout-link");

        if (accountSettings) {
          accountSettings.addEventListener("click", function (e) {
            e.preventDefault();
            accountDropdown.classList.remove("active");
            showNotification("Account settings feature coming soon!", "info");
          });
        }

        if (myImages) {
          myImages.addEventListener("click", function (e) {
            e.preventDefault();
            accountDropdown.classList.remove("active");
            showNotification("Image library feature coming soon!", "info");
          });
        }

        if (logoutLink) {
          logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("currentUser");
            accountDropdown.classList.remove("active");
            showNotification(
              "You have been logged out successfully",
              "success"
            );

            // Update auth button
            const authButton = document.getElementById("auth-button");
            if (authButton) {
              authButton.innerHTML = `<i class="fas fa-user"></i> <span>Login / Sign Up</span>`;
            }
          });
        }
      }

      // Toggle active state
      accountDropdown.classList.toggle("active");

      // Update user info if we have a current user
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "null"
      );
      if (currentUser && accountDropdown.classList.contains("active")) {
        const userName = accountDropdown.querySelector(".user-name");
        const userEmail = accountDropdown.querySelector(".user-email");

        if (userName && userEmail) {
          userName.textContent = currentUser.name || "User";
          userEmail.textContent = currentUser.email || "user@example.com";
        }
      }

      // Close dropdown when clicking outside
      if (accountDropdown.classList.contains("active")) {
        setTimeout(() => {
          const closeDropdown = (event) => {
            if (
              !accountDropdown.contains(event.target) &&
              !existingAuthButton?.contains(event.target)
            ) {
              accountDropdown.classList.remove("active");
              document.removeEventListener("click", closeDropdown);
            }
          };
          document.addEventListener("click", closeDropdown);
        }, 100);
      }
    }

    // Check for logged in user and update UI accordingly
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    if (currentUser && existingAuthButton) {
      existingAuthButton.innerHTML = `<i class="fas fa-user-circle"></i> <span>${
        currentUser.name ? currentUser.name.split(" ")[0] : "User"
      }</span>`;
      existingAuthButton.classList.add("logged-in");
    }
  }
});

// Main application logic
class CocktailGalleryApp {
  constructor() {
    this.db = new CocktailDatabase();
    this.init();
  }

  async init() {
    try {
      await this.db.init();
      this.setupEventListeners();
      this.loadCocktails();
      this.loadPreferences();
      console.log("Cocktail Gallery App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.showNotification("Failed to initialize database", "error");
    }
  }

  loadPreferences() {
    // Load saved layout
    const savedLayout = localStorage.getItem("cocktailLayout");
    if (savedLayout) {
      this.changeLayout(savedLayout);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("cocktailTheme");
    if (savedTheme) {
      this.changeTheme(savedTheme);
    }
  }

  centerImages() {
    const gallery = document.getElementById("cocktailGallery");
    const cards = gallery.querySelectorAll(".cocktail-card");
    const cardCount = cards.length;

    if (cardCount === 0) return;

    // Remove any existing centering classes
    gallery.classList.remove("center-1", "center-2", "center-3", "center-4");

    // Apply centering based on number of cards
    if (cardCount <= 4) {
      // All cards in one row
      gallery.classList.add(`center-${cardCount}`);
    } else if (cardCount <= 8) {
      // Two rows with maximum symmetry
      let firstRow = Math.ceil(cardCount / 2);
      let secondRow = cardCount - firstRow;

      // Ensure first row has more or equal cards for visual balance
      if (secondRow > firstRow) {
        const temp = firstRow;
        firstRow = secondRow;
        secondRow = temp;
      }

      gallery.classList.add(`center-${firstRow}-${secondRow}`);
    } else {
      // More than 8 cards - use standard 4-column grid
      gallery.classList.add("center-4");
    }
  }

  setupEventListeners() {
    const uploadForm = document.getElementById("uploadForm");
    const cocktailGallery = document.getElementById("cocktailGallery");

    // Form submission
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmission();
    });

    // Delete button delegation
    cocktailGallery.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const cocktailId = parseInt(e.target.dataset.id);
        this.deleteCocktail(cocktailId);
      }
    });

    // File input preview
    const imageFile = document.getElementById("imageFile");
    imageFile.addEventListener("change", (e) => {
      this.handleImagePreview(e);
    });

    // URL input preview
    const imageUrl = document.getElementById("imageUrl");
    imageUrl.addEventListener("input", (e) => {
      this.handleUrlPreview(e);
    });

    // Toggle upload form
    const toggleUpload = document.getElementById("toggleUpload");
    const uploadFormContainer = document.getElementById("uploadFormContainer");
    const closeUpload = document.getElementById("closeUpload");

    toggleUpload.addEventListener("click", () => {
      this.showUploadForm();
    });

    closeUpload.addEventListener("click", () => {
      this.hideUploadForm();
    });

    // Close form when clicking outside
    uploadFormContainer.addEventListener("click", (e) => {
      if (e.target === uploadFormContainer) {
        this.hideUploadForm();
      }
    });

    // Close form with Escape key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        uploadFormContainer.classList.contains("active")
      ) {
        this.hideUploadForm();
      }
    });

    // Layout controls
    const layoutBtns = document.querySelectorAll(".layout-btn");
    layoutBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.changeLayout(btn.dataset.layout);
      });
    });

    // Theme controls
    const themeBtns = document.querySelectorAll(".theme-btn");
    themeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.changeTheme(btn.dataset.theme);
      });
    });
  }

  async handleFormSubmission() {
    const form = document.getElementById("uploadForm");
    const submitBtn = form.querySelector(".submit-btn");
    const formData = new FormData(form);

    const cocktailName = formData.get("cocktailName").trim();
    const ingredients = formData.get("ingredients").trim();
    const imageFile = formData.get("imageFile");
    const imageUrl = formData.get("imageUrl").trim();

    if (!cocktailName || !ingredients) {
      this.showNotification(
        "Please fill in cocktail name and ingredients",
        "error"
      );
      return;
    }

    if (!imageFile && !imageUrl) {
      this.showNotification(
        "Please provide either an image file or image URL",
        "error"
      );
      return;
    }

    // Show loading state
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    try {
      let imageDataUrl;
      let fileName;

      if (imageFile) {
        // Handle file upload
        imageDataUrl = await this.convertImageToBase64(imageFile);
        fileName = imageFile.name;
      } else if (imageUrl) {
        // Handle URL input
        const isValidUrl = await this.validateImageUrl(imageUrl);
        if (!isValidUrl) {
          this.showNotification("Please provide a valid image URL", "error");
          return;
        }
        imageDataUrl = imageUrl;
        fileName = "image_from_url";
      }

      const cocktail = {
        name: cocktailName,
        ingredients: ingredients,
        imageUrl: imageDataUrl,
        fileName: fileName,
      };

      const id = await this.db.addCocktail(cocktail);

      // Add to UI
      this.addCocktailToUI({ id, ...cocktail });

      // Reset form and hide overlay
      form.reset();
      this.clearImagePreview();
      this.hideUploadForm();

      this.showNotification("Cocktail added successfully!", "success");

      // Add success animation
      submitBtn.classList.add("success");
      setTimeout(() => {
        submitBtn.classList.remove("success");
      }, 500);
    } catch (error) {
      console.error("Error adding cocktail:", error);
      this.showNotification("Failed to add cocktail", "error");
    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  }

  convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  }

  async validateImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Try to handle CORS

      img.onload = () => {
        resolve(true);
      };

      img.onerror = () => {
        // If CORS fails, try without crossOrigin
        const img2 = new Image();
        img2.onload = () => resolve(true);
        img2.onerror = () => resolve(false);
        img2.src = url;
      };

      img.src = url;
    });
  }

  showUploadForm() {
    const uploadFormContainer = document.getElementById("uploadFormContainer");
    uploadFormContainer.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  hideUploadForm() {
    const uploadFormContainer = document.getElementById("uploadFormContainer");
    uploadFormContainer.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling

    // Reset form and clear preview
    const form = document.getElementById("uploadForm");
    form.reset();
    this.clearImagePreview();
  }

  changeLayout(layoutType) {
    const gallery = document.getElementById("cocktailGallery");
    const layoutBtns = document.querySelectorAll(".layout-btn");

    // Update active button
    layoutBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.layout === layoutType) {
        btn.classList.add("active");
      }
    });

    // Remove all layout classes
    gallery.classList.remove(
      "grid-layout",
      "random-layout",
      "masonry-layout",
      "polaroid-layout"
    );

    // Add new layout class
    gallery.classList.add(`${layoutType}-layout`);

    // Apply random effects for random layout
    if (layoutType === "random") {
      this.applyRandomEffects();
    }

    // Save layout preference
    localStorage.setItem("cocktailLayout", layoutType);
  }

  changeTheme(themeType) {
    const body = document.body;
    const themeBtns = document.querySelectorAll(".theme-btn");

    // Update active button
    themeBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.theme === themeType) {
        btn.classList.add("active");
      }
    });

    // Remove all theme classes
    body.classList.remove("theme-fun", "theme-vintage", "theme-neon");

    // Add new theme class
    if (themeType !== "default") {
      body.classList.add(`theme-${themeType}`);
    }

    // Save theme preference
    localStorage.setItem("cocktailTheme", themeType);
  }

  applyRandomEffects() {
    const cards = document.querySelectorAll(".cocktail-card");
    cards.forEach((card) => {
      const rotation = (Math.random() - 0.5) * 20; // -10 to +10 degrees
      const scale = 0.9 + Math.random() * 0.2; // 0.9 to 1.1 scale

      card.style.setProperty("--random-rotation", `${rotation}deg`);
      card.style.setProperty("--random-scale", scale);
    });
  }

  handleImagePreview(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  handleUrlPreview(event) {
    const url = event.target.value.trim();
    if (!url) {
      this.clearImagePreview();
      return;
    }

    // Validate URL format
    try {
      new URL(url);
      this.showImagePreview(url);
    } catch (error) {
      this.clearImagePreview();
    }
  }

  showImagePreview(dataUrl) {
    // Create preview element if it doesn't exist
    let preview = document.querySelector(".image-preview");
    if (!preview) {
      preview = document.createElement("div");
      preview.className = "image-preview";
      preview.innerHTML = `
                <img src="" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                <button type="button" class="clear-preview">×</button>
            `;

      const formGroup = document.querySelector(".form-group:last-child");
      formGroup.appendChild(preview);

      // Add clear functionality
      preview.querySelector(".clear-preview").addEventListener("click", () => {
        this.clearImagePreview();
      });
    }

    preview.querySelector("img").src = dataUrl;
    preview.style.display = "block";
  }

  clearImagePreview() {
    const preview = document.querySelector(".image-preview");
    if (preview) {
      preview.style.display = "none";
    }
  }

  async loadCocktails() {
    try {
      const cocktails = await this.db.getAllCocktails();
      const gallery = document.getElementById("cocktailGallery");
      gallery.innerHTML = "";

      if (cocktails.length === 0) {
        gallery.innerHTML = `
                    <div class="empty-state">
                        <p>No cocktails yet! Add your first cocktail using the form.</p>
                    </div>
                `;
        return;
      }

      cocktails.forEach((cocktail) => {
        this.addCocktailToUI(cocktail);
      });

      // Center images after loading
      this.centerImages();
    } catch (error) {
      console.error("Error loading cocktails:", error);
      this.showNotification("Failed to load cocktails", "error");
    }
  }

  addCocktailToUI(cocktail) {
    const gallery = document.getElementById("cocktailGallery");
    const template = document.getElementById("cocktailTemplate");

    // Remove empty state if it exists
    const emptyState = gallery.querySelector(".empty-state");
    if (emptyState) {
      emptyState.remove();
    }

    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".cocktail-card");
    const cardImage = card.querySelector(".card-image");

    // Set data
    cardImage.src = cocktail.imageUrl;
    cardImage.alt = cocktail.name;
    card.querySelector(".card-title").textContent = cocktail.name;
    card.querySelector(".card-ingredients").textContent = cocktail.ingredients;
    card.querySelector(".delete-btn").dataset.id = cocktail.id;

    // Handle image loading errors
    cardImage.onerror = () => {
      // If it's a URL (not base64), try to fix common issues
      if (cocktail.imageUrl && !cocktail.imageUrl.startsWith("data:")) {
        // Try adding CORS proxy or other fixes
        const originalUrl = cocktail.imageUrl;

        // Try different approaches
        const attempts = [
          originalUrl,
          `https://cors-anywhere.herokuapp.com/${originalUrl}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(
            originalUrl
          )}`,
        ];

        let attemptIndex = 0;

        const tryNextAttempt = () => {
          if (attemptIndex < attempts.length) {
            cardImage.src = attempts[attemptIndex];
            attemptIndex++;
          } else {
            // All attempts failed, show placeholder
            cardImage.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTE2LjU2OSA2MCAxMzAgNzMuNDMxIDEzMCA5MEMxMzAgMTA2LjU2OSAxMTYuNTY5IDEyMCAxMDAgMTIwQzgzLjQzMSAxMjAgNzAgMTA2LjU2OSA3MCA5MEM3MCA3My40MzEgODMuNDMxIDYwIDEwMCA2MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMDAgNjBDMTE2LjU2OSA2MCAxMzAgNzMuNDMxIDEzMCA5MEMxMzAgMTA2LjU2OSAxMTYuNTY5IDEyMCAxMDAgMTIwQzgzLjQzMSAxMjAgNzAgMTA2LjU2OSA3MCA5MEM3MCA3My40MzEgODMuNDMxIDYwIDEwMCA2MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+";
            cardImage.alt = `${cocktail.name} (Image not available)`;
          }
        };

        cardImage.onerror = tryNextAttempt;
        cardImage.onload = () => {
          // Success, remove error handler
          cardImage.onerror = null;
        };

        // Start with first attempt
        tryNextAttempt();
      } else {
        // For base64 images, just show placeholder
        cardImage.src =
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTE2LjU2OSA2MCAxMzAgNzMuNDMxIDEzMCA5MEMxMzAgMTA2LjU2OSAxMTYuNTY5IDEyMCAxMDAgMTIwQzgzLjQzMSAxMjAgNzAgMTA2LjU2OSA3MCA5MEM3MCA3My40MzEgODMuNDMxIDYwIDEwMCA2MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+";
        cardImage.alt = `${cocktail.name} (Image not available)`;
      }
    };

    // Add animation delay for staggered effect
    const cards = gallery.querySelectorAll(".cocktail-card");
    card.style.animationDelay = `${cards.length * 0.1}s`;

    // Apply random effects if in random layout
    if (gallery.classList.contains("random-layout")) {
      const rotation = (Math.random() - 0.5) * 20;
      const scale = 0.9 + Math.random() * 0.2;

      card.style.setProperty("--random-rotation", `${rotation}deg`);
      card.style.setProperty("--random-scale", scale);
    }

    gallery.appendChild(card);

    // Center images after adding new card
    this.centerImages();
  }

  async deleteCocktail(id) {
    if (!confirm("Are you sure you want to delete this cocktail?")) {
      return;
    }

    try {
      await this.db.deleteCocktail(id);

      // Remove from UI with animation
      const card = document
        .querySelector(`[data-id="${id}"]`)
        .closest(".cocktail-card");
      card.style.animation = "fadeOut 0.3s ease-out";

      setTimeout(() => {
        card.remove();

        // Check if gallery is empty
        const gallery = document.getElementById("cocktailGallery");
        if (gallery.children.length === 0) {
          gallery.innerHTML = `
                        <div class="empty-state">
                            <p>No cocktails yet! Add your first cocktail using the form.</p>
                        </div>
                    `;
        } else {
          // Center images after deletion
          this.centerImages();
        }
      }, 300);

      this.showNotification("Cocktail deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting cocktail:", error);
      this.showNotification("Failed to delete cocktail", "error");
    }
  }

  showNotification(message, type = "info") {
    // Remove existing notifications
    const existing = document.querySelector(".notification");
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

    // Set background color based on type
    const colors = {
      success: "#4CAF50",
      error: "#f44336",
      info: "#2196F3",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Add additional CSS for notifications and animations
const additionalStyles = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .empty-state {
        text-align: center;
        padding: 40px;
        color: #fff;
        font-style: italic;
    }
    
    .image-preview {
        margin-top: 10px;
        position: relative;
        display: none;
    }
    
    .clear-preview {
        position: absolute;
        top: -10px;
        right: -10px;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        border: none;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
    }
    
    .clear-preview:hover {
        background: rgba(255, 0, 0, 1);
    }
`;

// Inject additional styles
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CocktailGalleryApp();
});

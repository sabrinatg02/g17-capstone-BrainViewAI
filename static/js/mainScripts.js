document.addEventListener("DOMContentLoaded", () => {
  // Check authentication using session
  const checkAuth = async () => {
    try {
      const response = await fetch('/g17-capstone-BrainViewAI/check-auth.php');
      const data = await response.json();
      
      if (!data.authenticated) {
        window.location.href = "login.html";
      } else {
        // Update UI with user info
        const userId = data.user_id; // Get the user_id from session
        const nameParts = userId.split(" "); // Split in case it's a full name
        const initials = nameParts.map(part => part[0].toUpperCase()).join("");
        
        document.querySelector(".user-name").textContent = userId; // Show user_id instead of name
        document.querySelector(".user-avatar").textContent = initials;
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      window.location.href = "login.html";
    }
  };

  checkAuth();

  // Update logout functionality
  document.getElementById("logout-link").addEventListener("click", async () => {
    try {
      await fetch('/g17-capstone-BrainViewAI/logout.php');
      window.location.href = "login.html";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });

  // Dropdown menu toggle
  const dropdownBtn = document.getElementById("user-dropdown-btn");
  const dropdownMenu = document.getElementById("user-dropdown-menu");

  // Toggle the dropdown menu visibility when user clicks on avatar or name
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();  // Prevent the event from bubbling up to document
    dropdownMenu.classList.toggle("show");
  });

  // Close dropdown menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdownBtn.contains(e.target)) {
      dropdownMenu.classList.remove("show");
    }
  });

  // Upload CT Scan functionality
  const uploadBtn = document.getElementById("upload-btn");
  const uploadInput = document.getElementById("upload-input");
  const analyzeBtn = document.getElementById("analyze-btn");
  const imagePreview = document.getElementById("image-preview");

  // Processing INPUT
  uploadBtn.addEventListener("click", () => {
    uploadInput.click(); 
  });

  // Handle file upload
  uploadInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show loading state
      uploadBtn.disabled = true;
      uploadBtn.textContent = "Uploading...";
      
      // Show preview
      const reader = new FileReader();
      reader.onload = function(event) {
        imagePreview.innerHTML = `<img src="${event.target.result}" alt="Uploaded CT Scan" class="uploaded-image">`;
      };
      reader.readAsDataURL(file);

      // Upload to db
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/g17-capstone-BrainViewAI/upload-image.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          analyzeBtn.disabled = false;
          alert('Upload successful!');
        } else {
          alert('Upload failed: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      } finally {
        // Reset button state
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload CT Scan";
      }
    }
  });

  // Analyze button functionality
  analyzeBtn.addEventListener("click", async () => {
    // Add analyzing class to button for pulse animation
    analyzeBtn.classList.add('analyzing');
    analyzeBtn.disabled = true;

    // Show progress bar
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.innerHTML = `
      <div class="progress-bar">
        <div class="progress-bar-fill"></div>
      </div>
      <div class="analysis-text">Analyzing CT Scan...</div>
    `;

    // Insert progress bar after image preview
    const imagePreview = document.getElementById("image-preview");
    imagePreview.insertAdjacentElement('afterend', progressContainer);
    progressContainer.style.display = "block";

    // Start progress animation
    setTimeout(() => {
      const progressBarFill = progressContainer.querySelector('.progress-bar-fill');
      progressBarFill.style.width = '100%';
    }, 100);

    try {
      const imageElement = document.querySelector('.uploaded-image');
      if (!imageElement) {
        throw new Error('No image found to analyze');
      }

      // Wait for progress bar animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const imageSource = imageElement.src;
      const response = await fetch('/g17-capstone-BrainViewAI/analyze-scan.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSource
        })
      });

      if (!response.ok) {
        const textResponse = await response.text();
        console.error('Server response:', textResponse);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Create and show the results popup
      const resultPopup = document.createElement("div");
      resultPopup.classList.add("popup");
      resultPopup.innerHTML = `
        <h3>Analysis Results</h3>
        <p>${result.analysis || 'Analysis completed successfully'}</p>
        <p>Confidence Level: ${result.confidence || 'N/A'}%</p>
        <button id="popup-close-btn">
          View Detailed Report in Patient Manager
        </button>
      `;
      
      document.body.appendChild(resultPopup);
      void resultPopup.offsetWidth;
      resultPopup.classList.add('show');

      // Handle popup close and redirect
      document.getElementById("popup-close-btn").addEventListener("click", () => {
        resultPopup.classList.remove('show');
        setTimeout(() => {
          resultPopup.remove();
          window.location.href = "patientManager.html";
        }, 600);
      });

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed: ' + error.message);
    } finally {
      // STOP Everything,
      analyzeBtn.classList.remove('analyzing');
      analyzeBtn.disabled = false;
      progressContainer.remove();
    }
  });
});
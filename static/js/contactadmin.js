document.addEventListener("DOMContentLoaded", () => {
    const appContainer = document.getElementById("app-container");
    const contactForm = document.getElementById("contact-form");
    const userMessage = document.getElementById("user-message");
    const userEmail = document.getElementById("email");
  
    // Initially, hide the main content
    appContainer.style.display = "none";
    
    const checkAuth = async () => {
      try {
        const response = await fetch('check-auth.php');
        const data = await response.json();
  
        if (!data.authenticated) {
          console.log("User not authenticated. Redirecting to login page...");
          alert("Unauthorized access. Please login.");
          window.location.href = "login.html";
        } else {
          console.log("User authenticated:", data.user_id);
          const userId = data.user_id; // Get the user_id from session
          const nameParts = userId.split(" "); // Split in case it's a full name
          const initials = nameParts.map(part => part[0].toUpperCase()).join("");
          
          document.querySelector(".user-name").textContent = userId; // Show user_id instead of name
          document.querySelector(".user-avatar").textContent = initials;
  
          // Show the main content
          appContainer.style.display = "block";
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
        alert("Unauthorized access. Please login.");
        window.location.href = "login.html";
      }
    };
  
    checkAuth();
  
    // Toggle dropdown menu visibility
    const userDropdownBtn = document.getElementById("user-dropdown-btn");
    const userDropdownMenu = document.getElementById("user-dropdown-menu");
    const logoutLink = document.getElementById("logout-link");
  
    userDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent the click from propagating to the window
      userDropdownMenu.classList.toggle("show");
    });
    
    window.addEventListener("click", () => {
      userDropdownMenu.classList.remove("show");
    });
  
    // Logout functionality for dashboard logout button
    if (logoutLink) {
      logoutLink.addEventListener("click", () => {
        const confirmation = confirm("Are you sure you want to log out?");
        if (confirmation) {
          fetch('logout.php')
            .then(response => {
              if (response.ok) {
                alert("Logout successful. Redirecting to login page...");
                window.location.href = "login.html";
              } else {
                alert("Error logging out. Please try again.");
              }
            })
            .catch(error => {
              console.error("Error during logout:", error);
              alert("Error logging out. Please try again.");
            });
        }
      });
    }
  
    // Handle contact form submission
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevent the default form submission
  
      const message = userMessage.value.trim();
      if (!message) {
        alert("Please enter a message.");
        return;
      }
  
      // Show success pop-up message
      showSuccessPopup();
  
      // Submit the form to Web3Forms
      setTimeout(() => {
        contactForm.submit(); // Submit the form after the popup shows
      }, 1500); // Simulate delay for better user experience
    });
  
    // Function to show the success pop-up
    function showSuccessPopup() {
      const popup = document.createElement("div");
      popup.className = "popup";
      popup.innerHTML = `
        <div class="popup-content">
          <img src="/g17-capstone-BrainViewAI-0.2-integration/assets/tick.png" alt="Success" class="popup-tick">
          <h3>Successfully Sent</h3>
          <p>Your message has been sent successfully. We'll get back to you soon.</p>
          <button id="popup-close-btn">Close</button>
        </div>
      `;
      document.body.appendChild(popup);
  
      // Show the popup
      void popup.offsetWidth; // Trigger a reflow to enable animation
      popup.classList.add("show");
  
      // Close the popup when the button is clicked
      document.getElementById("popup-close-btn").addEventListener("click", () => {
        popup.classList.remove("show");
        setTimeout(() => {
          popup.remove();
        }, 300); // Allow time for the animation to finish
  
        // Clear the email and message fields after closing the popup
        userEmail.value = '';
        userMessage.value = '';
      });
    }
  });
  

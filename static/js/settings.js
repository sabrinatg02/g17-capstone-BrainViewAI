document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app-container");

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

  const userDropdownBtn = document.getElementById("user-dropdown-btn");
  const userDropdownMenu = document.getElementById("user-dropdown-menu");
  const logoutLink = document.getElementById("logout-link");

  // Toggle dropdown menu visibility
  userDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent the click from propagating to the window
    userDropdownMenu.classList.toggle("show");
  });

  // Close dropdown when clicking outside
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

  appContainer.style.display = "none";
  const editProfileButton = document.getElementById("edit-user-profile");
  const editProfileModal = document.getElementById("editProfileModal");
  const closeModalButton = document.getElementById("close-modal-btn");

  // Show modal when Edit button is clicked
  editProfileButton.addEventListener("click", () => {
    editProfileModal.classList.add("show");
  });

   // Close modal when close button is clicked and clear form fields
   if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      clearFormFields(); // Clear all input fields
      editProfileModal.classList.remove("show"); // Close the modal
    });

  // Form submission to update user info
  const editProfileForm = document.getElementById("edit-profile-form");

  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const userId = document.getElementById("user-id").value.trim();
      const oldPassword = document.getElementById("old-password").value.trim();
      const newPassword = document.getElementById("new-password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();

      if (!userId || !oldPassword || !newPassword || !confirmPassword) {
        alert("All fields are required");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      

      const data = {
        user_id: userId,
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      };

      // Send data to backend to update user info
      fetch('update-handler.php', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Profile updated successfully");

          // Clear all input fields
          clearFormFields();
          editProfileModal.classList.remove("show"); // Close the modal
        } else {
          alert("Error: " + data.error);
        }
      })
      .catch(error => {
        console.error("Error updating profile:", error);
        alert("An error occurred while updating your profile");
      });
    });
  }
  // Function to clear all form fields
  function clearFormFields() {
    document.getElementById("user-id").value = "";
    document.getElementById("old-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
  }

  // Select the Contact Admin button and add event listener
  const contactAdminButton = document.getElementById("contact-admin");

  if (contactAdminButton) {
    // Add event listener for click event
    contactAdminButton.addEventListener("click", () => {
      window.location.href = "/g17-capstone-BrainViewAI-0.2-integration/contact.html"; // Redirect to help page
    });
  }


  const logoutButton = document.getElementById("logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
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
  }
})

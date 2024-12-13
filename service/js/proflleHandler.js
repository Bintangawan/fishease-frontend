API_URL = 'http://localhost:3000'; // Change in prod

document.addEventListener('DOMContentLoaded', function() {
    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.innerHTML = `
        <link rel="stylesheet" href="css/loading.css" />
         <div class="loading-overlay">
          <div class="spinner">
           <div class="spinner-inner"></div>
          </div>
          <p>Getting data...</p>
         </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
       }
      
    // Remove loading overlay
    function removeLoadingOverlay(overlay) {
        if (overlay) overlay.remove();
    }

    function createDialogContainer() {
        if (document.getElementById('custom-dialog-container')) return;

        const dialogContainer = document.createElement('div');
        dialogContainer.id = 'custom-dialog-container';
        dialogContainer.innerHTML = `
            <link rel="stylesheet" href="css/dialog.css" />
            <div class="custom-dialog">
                <h2 id="custom-dialog-title">Confirm Deletion</h2>
                <p id="custom-dialog-message">Are you sure you want to delete this entry?</p>
                <div class="custom-dialog-buttons">
                    <button class="custom-dialog-cancel" id="custom-dialog-cancel">Cancel</button>
                    <button class="custom-dialog-confirm" id="custom-dialog-confirm">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialogContainer);
    }

    // Show custom dialog
    function showDialog(title, message, onConfirm) {
        const dialogContainer = document.getElementById('custom-dialog-container');
        const dialogTitle = document.getElementById('custom-dialog-title');
        const dialogMessage = document.getElementById('custom-dialog-message');
        const confirmButton = document.getElementById('custom-dialog-confirm');
        const cancelButton = document.getElementById('custom-dialog-cancel');

        dialogTitle.textContent = title;

        // Clear previous content and add HTML or text
        dialogMessage.innerHTML = typeof message === 'string' 
            ? message 
            : message.toString();

        dialogContainer.style.display = 'flex';

        // Remove previous listeners to prevent multiple bindings
        confirmButton.onclick = null;
        cancelButton.onclick = null;

        // Add new listeners
        confirmButton.onclick = () => {
            dialogContainer.style.display = 'none';
            onConfirm();
        };

        cancelButton.onclick = () => {
            dialogContainer.style.display = 'none';
        };

    }

    // Show success dialog
    function showSuccessDialog(message) {
        const dialogContainer = document.getElementById('custom-dialog-container');
        const dialogTitle = document.getElementById('custom-dialog-title');
        const dialogMessage = document.getElementById('custom-dialog-message');
        const confirmButton = document.getElementById('custom-dialog-confirm');
        const cancelButton = document.getElementById('custom-dialog-cancel');

        dialogTitle.textContent = 'Success';
        dialogMessage.textContent = message;
        confirmButton.textContent = 'OK';
        cancelButton.style.display = 'none';
        dialogContainer.style.display = 'flex';

        return new Promise((resolve) => {
            const handleConfirm = () => {
              dialogContainer.style.display = 'none';
              confirmButton.textContent = 'Confirm';
              cancelButton.style.display = 'block';
              
              // Remove the event listener to prevent memory leaks
              confirmButton.removeEventListener('click', handleConfirm);
              
              // Resolve the promise
              resolve();
            };
        
            // Add event listener
            confirmButton.addEventListener('click', handleConfirm);
          });
    }
    
    // Get token from AuthService
    const token = authService.getToken();

    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // formats as DD/MM/YYYY
    }

    // Function to update profile UI
    function updateProfileUI(userData) {
        const userInfoElement = document.querySelector('.user-info');
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${userData.email || 'N/A'}  <a href="#">Change Email</a></p>
                <p><strong>Account Created:</strong> ${formatDate(userData.created_at) || 'N/A'}</p>
                <p><strong>Phone Number:</strong> ${userData.phone || 'N/A'}</p>
            `;
        }
    }

    // Email validation function
    function validateEmail(email) {
        // Comprehensive email validation regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        // Check if email matches the regex pattern
        if (!emailRegex.test(email)) {
            return false;
        }

        // Additional checks
        // Ensure email is not too long
        if (email.length > 254) {
            return false;
        }

        // Prevent some common invalid email patterns
        const invalidPatterns = [
            /\.{2,}/, // Multiple consecutive dots
            /^\./, // Starts with a dot
            /\.$/, // Ends with a dot
            /@\./, // Dot immediately after @
            /\.@/ // Dot before @
        ];

        return !invalidPatterns.some(pattern => pattern.test(email));
    }

    const originalUpdateProfileUI = window.updateProfileUI || function() {};
    window.updateProfileUI = function(userData) {
        // Call original implementation
        originalUpdateProfileUI(userData);
        
        // Ensure the "Change Email" link exists after update
        const userInfoElement = document.querySelector('.user-info');
        if (userInfoElement) {
            const emailChangeLink = userInfoElement.querySelector('a[href="#"]');
            if (!emailChangeLink) {
                const emailParagraph = userInfoElement.querySelector('p:nth-child(2)');
                if (emailParagraph) {
                    emailParagraph.innerHTML += ' <a href="#">Change Email</a>';
                }
            }
        }
    };

    // Function to create entry item HTML
    function createEntryItemHTML(entry) {
        return `
        <div class="entry-item">
            <div class="entry-info" data-entry-id="${entry.id_entry}">
                <p><strong>Entry ID:</strong> #${entry.id_entry}</p>
                <p><strong>Disease:</strong> ${entry.disease_name}</p>
                <p><strong>Confidence:</strong> ${parseFloat(entry.confidence_score.toFixed(0))}%</p>
                <p><strong>Date:</strong> ${formatDate(entry.created_at)}</p>
            </div>  
            <div class="entry-actions">
                <a href="#" data-action="delete"><i class="fa-solid fa-trash"></i></a>
                <a href="viewDetails.html?entryId=${entry.id_entry}&diseaseName=${encodeURIComponent(entry.disease_name)}">
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        </div>
        `;
    }

    // Function to render scan history
    function renderScanHistory(scans) {
        const entryHistoryContainer = document.querySelector('.main-content');
        const titleElement = entryHistoryContainer.querySelector('.title');
        
        if (!entryHistoryContainer || !titleElement) {
            console.error('Required elements not found');
            return;
        }
        
        // Remove existing entry items
        const existingEntryItems = entryHistoryContainer.querySelectorAll('.entry-item');
        existingEntryItems.forEach(item => item.remove());

        // Render each scan entry
        scans.forEach(entry => {
            const entryHTML = createEntryItemHTML(entry);
            titleElement.insertAdjacentHTML('afterend', entryHTML);
        });
    }

    // Function to update entry count
    function updateEntryCount(totalScans) {
        const entryCountElement = document.querySelector('.entry-stat h1');
        if (entryCountElement) {
            entryCountElement.textContent = totalScans;
        }
    }

    // Function to fetch user data
    async function fetchUserData() {
        try {
            loadingOverlay = createLoadingOverlay();
            const response = await fetch(`${API_URL}/userInfo`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const { data } = await response.json();
            updateProfileUI(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Function to fetch scan history
    async function fetchScanHistory() {
        try {
            const response = await fetch(`${API_URL}/scan-history`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch scan history');
            }
            const { total_scans, data } = await response.json();
            
            // Update entry count
            updateEntryCount(total_scans);

            // Render scan history
            renderScanHistory(data);
        } catch (error) {
            console.error('Error fetching scan history:', error);
            updateEntryCount(0);
        } finally {
            removeLoadingOverlay(loadingOverlay);
        }
    }

    // Function to delete an entry
    async function deleteEntry(event) {
        event.preventDefault();
        
        // Find the closest entry item and its ID
        const entryItem = event.target.closest('.entry-item');
        const entryInfoElement = entryItem.querySelector('.entry-info');
        
        if (!entryInfoElement) {
            console.error('Entry ID not found');
            return;
        }
        
        const entryId = entryInfoElement.getAttribute('data-entry-id');
        const entryDisease = entryInfoElement.querySelector('p:nth-child(2)').textContent.replace('Disease: ', '');
        
        // Show confirmation dialog
        showDialog(
            'Confirm Deletion', 
            `Are you sure you want to delete the entry for ${entryDisease}?`,
            async () => {
                try {
                    const response = await fetch(`${API_URL}/scan-history/${entryId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete entry');
                    }

                    // Remove the entry item from the DOM
                    entryItem.remove();

                    // Refresh scan history to update the count
                    await fetchScanHistory();

                    // Show success dialog
                    showSuccessDialog(`The entry for ${entryDisease} has been successfully deleted.`);

                } catch (error) {
                    console.error('Error deleting entry:', error);
                    const checkEntryExists = await fetch(`${API_URL}/scan-history/${entryId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (checkEntryExists.ok) {
                        await showSuccessDialog('Failed to delete entry. Please try again.');
                    }
                }
            }
        );
    }

    createDialogContainer();

    document.addEventListener('click', function(event) {
        // Check if the clicked element is the "Change Email" link
        const changeEmailLink = event.target.closest('.user-info a[href="#"]');
        
        if (changeEmailLink) {
            event.preventDefault();
            
            // Show dialog
            showDialog('Change Email', `
                <form id="change-email-form" style="text-align: left;">
                    <label for="new-email" style="display: block; margin-bottom: 5px;">New Email</label>
                    <input type="email" id="new-email" placeholder="Enter new email" required style="width: 100%; padding: 10px; margin-bottom: 15px;">
                    
                    <label for="current-password" style="display: block; margin-bottom: 5px;">Current Password</label>
                    <input type="password" id="current-password" placeholder="Enter current password" required style="width: 100%; padding: 10px; margin-bottom: 15px;">
                </form>
            `, async () => {
                const newEmail = document.getElementById('new-email').value;
                const password = document.getElementById('current-password').value;

                if (!validateEmail(newEmail)) {
                    alert('Please enter a valid email address');
                    removeLoadingOverlay(loadingOverlay);
                    return;
                }

                try {
                    await updateEmail(newEmail, password);
                } catch (error) {
                    console.error('Email update error:', error);
                }
            });

            // Modify confirm button text
            const confirmButton = document.getElementById('custom-dialog-confirm');
            confirmButton.textContent = 'Update Email';
        }
    }
);

    // Function to update email
    async function updateEmail(newEmail, password) {
        try {
            loadingOverlay = createLoadingOverlay();
            const token = authService.getToken();

            const response = await fetch(`${API_URL}/update-mail`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newEmail,
                    password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                removeLoadingOverlay(loadingOverlay);
                throw new Error(result.message || 'Failed to update email');
            }

            if (result.data && result.data.token) {
                authService.setToken(result.data.token);

                const dialogContainer = document.getElementById('custom-dialog-container');
                if (dialogContainer) {
                    dialogContainer.style.display = 'none';
                }
                
                removeLoadingOverlay(loadingOverlay);
                await showSuccessDialog('Email updated successfully');
                location.reload(true);
            }

            return result;
        } catch (error) {
            console.error('Email update error:', error);
            showDialog('Error', error.message || 'Failed to update email', () => {});
            throw error;
        } 
    }

   // Add event delegation for delete buttons
   const mainContent = document.querySelector('.main-content');
   if (mainContent) {
       mainContent.addEventListener('click', function(event) {
           // Check if the clicked element is inside a delete button
           const deleteButton = event.target.closest('a[data-action="delete"]');
           if (deleteButton) {
               deleteEntry(event);
           }
       });
   }

    // Check if user is logged in before fetching data
    if (authService.isLoggedIn()) {
        // Fetch both user data and scan history when page loads
        fetchUserData();
        fetchScanHistory();
    } else {
        // Redirect to login page if not logged in
        window.location.href = '/login.html';
    }
});
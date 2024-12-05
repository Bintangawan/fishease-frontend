API_URL = 'http://localhost:3000'; // Change in prod

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.login-form');

    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.innerHTML = `
        <link rel="stylesheet" href="css/loading.css" />
         <div class="loading-overlay">
          <div class="spinner">
           <div class="spinner-inner"></div>
          </div>
          <p>Getting your data in...</p>
         </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
       }
      
    // Remove loading overlay
    function removeLoadingOverlay(overlay) {
        if (overlay) overlay.remove();
    }
    
    // Phone number validation
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        // Remove any non-digit characters
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 13 digits
        if (value.length > 13) {
            value = value.slice(0, 13);
        }
        
        // Update input value
        e.target.value = value;
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const loadingOverlay = createLoadingOverlay();
        
        // Get form values
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        if (phone.length < 6) {
            alert('Phone number must be at least 6 digits!');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    name: fullname,
                    phone: phone
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Registration successful
                alert('Registration successful!');
                window.location.href = '/service/login.html';
            } else {
                // Registration failed
                alert(data.message || 'Registration failed. Please try again.');
            }
        } 
        
        catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }

        finally {
            removeLoadingOverlay(loadingOverlay);
        }
    });
});
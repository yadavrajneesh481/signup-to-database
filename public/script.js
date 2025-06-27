    // <!-- JavaScript code for handling form submission -->

        // Get references to form elements
        const form = document.getElementById('contactForm'); // The form element
        const submitBtn = document.getElementById('submitBtn'); // Submit button
        const messageContainer = document.getElementById('messageContainer'); // Message display area
        
        // Add event listener for form submission
        form.addEventListener('submit', async function(event) {
            // Prevent the default form submission behavior
            event.preventDefault();
            
            // Show loading state on button
            submitBtn.textContent = 'Sending...';
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Clear any previous messages
            messageContainer.innerHTML = '';
            
            // Get form data
            const formData = new FormData(form);
            
            // Convert FormData to a regular object
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                age: formData.get('age'),
                message: formData.get('message')
            };
            
            try {
                // Send POST request to our server
                const response = await fetch('/submit-form', {
                    method: 'POST', // HTTP method
                    headers: {
                        'Content-Type': 'application/json', // Tell server we're sending JSON
                    },
                    body: JSON.stringify(data) // Convert data to JSON string
                });
                
                // Parse the JSON response from server
                const result = await response.json();
                
                // Check if the request was successful
                if (result.success) {
                    // Show success message
                    showMessage('✅ ' + result.message, 'success');
                    // Reset the form fields
                    form.reset();
                } else {
                    // Show error message
                    showMessage('❌ ' + result.message, 'error');
                }
                
            } catch (error) {
                // Handle network or other errors
                console.error('Error:', error);
                showMessage('❌ Something went wrong. Please try again.', 'error');
            } finally {
                // Reset button state regardless of success or failure
                submitBtn.textContent = 'Send Message';
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
        
        // Function to display success or error messages
        function showMessage(text, type) {
            // Create a new div element for the message
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`; // Add CSS classes
            messageDiv.textContent = text; // Set the message text
            
            // Add the message to the container
            messageContainer.appendChild(messageDiv);
            
            // Automatically remove the message after 5 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }

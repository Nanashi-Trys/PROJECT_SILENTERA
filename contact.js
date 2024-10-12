document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this); // Get form data

    fetch('https://formspree.io/f/xkgnngrr', { // Replace with your Formspree endpoint
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Thank you for your message! We will get back to you soon.');
            this.reset(); // Reset the form after successful submission
        } else {
            alert('There was a problem with your submission. Please try again.');
        }
    })
    .catch(error => {
        alert('There was a problem with your submission. Please try again.');
        console.error('Error:', error);
    });
});

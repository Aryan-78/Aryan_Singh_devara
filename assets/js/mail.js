document.querySelector('#contact-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // prevent page reload
  const form = e.target;

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
        window.location.hash ="ThankYou";
        document.getElementById("contact-form").reset();
    } else {
        window.location.hash ="Fail";  
    }
  } catch (error) {
    console.error(error);
    window.location.hash ="InternalError";  
  }
});
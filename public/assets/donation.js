// public/assets/donation.js

// Import Stripe library
const Stripe = window.Stripe

// Stripe configuration
const stripe = Stripe("pk_test_51P2GkSSEzW86D25YUkzW9QoZE31ODA3vRCoQpwmKlue7nrsuj7MI0MVD5w8oVUXwsSYhjbV7Xvq2iNu12Mi6vpjQ00a8DAondY") // Replace with your actual publishable key
const elements = stripe.elements()

// Custom styling for Stripe elements
const style = {
  base: {
    color: "#333",
    fontFamily: "Inter, sans-serif",
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#aab7c4",
    },
  },
  invalid: {
    color: "#e74c3c",
    iconColor: "#e74c3c",
  },
}

// Create card element
const cardElement = elements.create("card", { style })
cardElement.mount("#card-element")

// Handle real-time validation errors from the card Element
cardElement.on("change", ({ error }) => {
  const displayError = document.getElementById("card-errors")
  if (error) {
    displayError.textContent = error.message
  } else {
    displayError.textContent = ""
  }
})

// Amount selection functionality
const amountButtons = document.querySelectorAll(".amount-btn")
const amountInput = document.getElementById("amount")
let selectedAmount = null

amountButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault()

    // Remove previous selection
    amountButtons.forEach((btn) => btn.classList.remove("selected"))

    // Add selection to clicked button
    button.classList.add("selected")

    const amount = button.getAttribute("data-amount")
    selectedAmount = amount

    if (amount !== "custom") {
      amountInput.value = amount
    } else {
      amountInput.value = ""
      amountInput.focus()
    }
  })
})

// Handle custom amount input
amountInput.addEventListener("input", () => {
  if (amountInput.value) {
    // Remove selection from preset buttons if custom amount is entered
    amountButtons.forEach((btn) => {
      if (btn.getAttribute("data-amount") !== "custom") {
        btn.classList.remove("selected")
      }
    })

    // Select custom button if amount is entered
    const customBtn = document.querySelector('[data-amount="custom"]')
    if (customBtn && amountInput.value !== selectedAmount) {
      customBtn.classList.add("selected")
    }
  }
})

// Form submission
const form = document.getElementById("donation-form")
const submitButton = document.getElementById("submit-button")
const buttonText = document.getElementById("button-text")
const spinner = document.getElementById("spinner")

form.addEventListener("submit", async (event) => {
  event.preventDefault()

  // Validate form
  const amount = Number.parseFloat(amountInput.value)
  const donorName = document.getElementById("donor-name").value.trim()
  const donorEmail = document.getElementById("donor-email").value.trim()

  if (!amount || amount < 1) {
    showError("Please enter a valid donation amount.")
    return
  }

  if (!donorName) {
    showError("Please enter your full name.")
    return
  }

  if (!donorEmail || !validateEmail(donorEmail)) {
    showError("Please enter a valid email address.")
    return
  }

  // Disable submit button and show loading
  setLoading(true)

  try {
    // Create payment intent on the server
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        donor_name: donorName,
        donor_email: donorEmail,
        message: document.getElementById("message").value.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }

    const { client_secret } = await response.json()

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: donorName,
          email: donorEmail,
        },
      },
    })

    if (error) {
      showError(error.message)
    } else if (paymentIntent.status === "succeeded") {
      showSuccess(
        `Thank you ${donorName}! Your donation of $${amount} has been processed successfully. You will receive a confirmation email at ${donorEmail}.`,
      )
      resetForm()
    }
  } catch (error) {
    console.error("Error:", error)
    showError("An error occurred while processing your donation. Please try again.")
  } finally {
    setLoading(false)
  }
})

function setLoading(loading) {
  submitButton.disabled = loading
  if (loading) {
    buttonText.style.display = "none"
    spinner.classList.remove("hidden")
  } else {
    buttonText.style.display = "inline"
    spinner.classList.add("hidden")
  }
}

function showError(message) {
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`

  // Insert before the form
  form.parentNode.insertBefore(errorDiv, form)

  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove()
  }, 5000)

  // Scroll to error
  errorDiv.scrollIntoView({ behavior: "smooth", block: "center" })
}

function showSuccess(message) {
  const successDiv = document.createElement("div")
  successDiv.className = "success-message"
  successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`

  // Insert before the form
  form.parentNode.insertBefore(successDiv, form)

  // Remove after 10 seconds
  setTimeout(() => {
    successDiv.remove()
  }, 10000)

  // Scroll to success message
  successDiv.scrollIntoView({ behavior: "smooth", block: "center" })
}

function resetForm() {
  form.reset()
  cardElement.clear()
  amountButtons.forEach((btn) => btn.classList.remove("selected"))
  selectedAmount = null
  document.getElementById("card-errors").textContent = ""
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

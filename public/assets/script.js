// DOM Elements
const navbar = document.getElementById("navbar")
const mobileMenu = document.getElementById("mobile-menu")
const navLinks = document.querySelector(".nav-links")

// Navbar scroll effect
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }
})

// Mobile menu toggle
if (mobileMenu) {
  mobileMenu.addEventListener("click", () => {
    navLinks.classList.toggle("active")
    const icon = mobileMenu.querySelector("i")
    icon.classList.toggle("fa-bars")
    icon.classList.toggle("fa-times")
  })
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Counter animation
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number")

  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target
        const target = Number.parseInt(counter.getAttribute("data-target"))
        const duration = 2000 // 2 seconds
        const step = target / (duration / 16) // 60fps
        let current = 0

        const updateCounter = () => {
          if (current < target) {
            current += step
            if (current > target) current = target

            // Format number with commas
            counter.textContent = Math.floor(current).toLocaleString()
            requestAnimationFrame(updateCounter)
          } else {
            counter.textContent = target.toLocaleString()
          }
        }

        updateCounter()
        observer.unobserve(counter)
      }
    })
  }, observerOptions)

  counters.forEach((counter) => observer.observe(counter))
}

// Simple AOS (Animate On Scroll) implementation
function initAOS() {
  const elements = document.querySelectorAll("[data-aos]")

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute("data-aos-delay") || 0
        setTimeout(() => {
          entry.target.classList.add("aos-animate")
        }, delay)
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  elements.forEach((element) => observer.observe(element))
}

// Scroll indicator click
const scrollIndicator = document.querySelector(".scroll-indicator")
if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    const nextSection = document.querySelector(".stats")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  })
}

// Initialize animations when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  animateCounters()
  initAOS()
})

// Form validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Show success/error messages
function showMessage(message, type = "success") {
  const messageDiv = document.createElement("div")
  messageDiv.className = `${type}-message`
  messageDiv.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        ${message}
    `

  // Insert at the top of the page
  document.body.insertBefore(messageDiv, document.body.firstChild)

  // Remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove()
  }, 5000)
}

// Lazy loading for images
function initLazyLoading() {
  const images = document.querySelectorAll("img[data-src]")

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))
}

// Initialize lazy loading
document.addEventListener("DOMContentLoaded", initLazyLoading)

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Apply debounce to scroll handler
const debouncedScrollHandler = debounce(() => {
  if (window.scrollY > 100) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }
}, 10)

window.addEventListener("scroll", debouncedScrollHandler)

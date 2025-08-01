const express = require("express")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const path = require("path")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));

// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/programs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "programs.html"));
});

app.get("/impact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "impact.html"));
});

app.get("/donate", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "donate.html"));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Create payment intent endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, donor_name, donor_email, message } = req.body

    // Validate amount
    if (!amount || amount < 50) {
      // Minimum $0.50
      return res.status(400).json({ error: "Invalid amount" })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || "usd",
      metadata: {
        donor_name,
        donor_email,
        message: message || "",
        organization: "Green Pulse Education",
      },
      receipt_email: donor_email,
      description: `Donation to Green Pulse Education from ${donor_name}`,
    })

    res.json({
      client_secret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Webhook endpoint for Stripe events
app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object
      console.log("Payment succeeded:", paymentIntent.id)

      // Here you can:
      // - Send confirmation email
      // - Update database
      // - Send thank you message
      // - Generate tax receipt

      break
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object
      console.log("Payment failed:", failedPayment.id)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Visit http://localhost:${PORT} to view the website`)
})

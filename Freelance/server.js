require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");

const app = express();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:3000"
  ].filter(Boolean)
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Freelancing Hub backend is running!");
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential missing"
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google account verification failed"
      });
    }

    // Verified Google user details
    const user = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };

    // Demo response. Add database and a secure session
    // before using this as a production login system.
    return res.json({
      success: true,
      message: "Google login successful",
      user
    });

  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Google sign-in failed. Check your Client ID."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
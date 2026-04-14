import { admin, db } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "FIREBASE_API_KEY is not set in environment variables." });
  }

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
        return res.status(400).json({ error: data.error?.message || "Login failed" });
    }

    // Now get the user's data from firestore
    const userDoc = await db.collection("users").doc(data.localId).get();
    let userData = {};
    if (userDoc.exists) {
        userData = userDoc.data() || {};
    }

    res.status(200).json({
        uid: data.localId,
        idToken: data.idToken,
        email: data.email,
        ...userData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

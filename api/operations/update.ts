import { db } from "../../lib/firebaseAdmin.js";
import { verifyToken } from "../../lib/authMiddleware.js";

export default async function handler(req, res) {
  if (req.method !== "PATCH" && req.method !== "PUT") return res.status(405).end();

  try {
    const user = await verifyToken(req);
    const { id, ...updates } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Operation ID is required" });
    }

    // Security: Ensure the user owns the document they're trying to update
    const docRef = db.collection("operations").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Operation not found" });
    }

    if (doc.data().userId !== user.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Recalculate ROI/Profit if odds or bets are updated (Backend robustness)
    // Note: Since this is often handled on the frontend, we'll focus on accepting the fields.
    
    await docRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

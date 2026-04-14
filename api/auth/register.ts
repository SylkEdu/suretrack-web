import { admin, db } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, name, bancaInicial } = req.body;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    await db.collection("users").doc(user.uid).set({
      name,
      email,
      bancaInicial: Number(bancaInicial) || 0,
      createdAt: new Date(),
    });

    res.status(200).json({ uid: user.uid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

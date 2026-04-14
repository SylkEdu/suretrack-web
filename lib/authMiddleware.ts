import { admin } from "./firebaseAdmin";

export async function verifyToken(req: any) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    throw new Error("Token não fornecido");
  }

  const decoded = await admin.auth().verifyIdToken(token);
  return decoded;
}

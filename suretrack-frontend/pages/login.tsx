import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin() {
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/dashboard");
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl w-80">
        <h1 className="text-xl mb-4">Login</h1>
        <input
          className="w-full p-2 mb-2 bg-gray-700"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 bg-gray-700"
          placeholder="Senha"
          type="password"
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 p-2 rounded"
          onClick={handleLogin}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

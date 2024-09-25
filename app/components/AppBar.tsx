"use client";
import { signIn, useSession, signOut } from "next-auth/react";

export default function AppBar() {
  const session = useSession();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>Muzyc</div>
        <div>
            {session.data?.user && <button onClick={() => signOut()}>LogOut</button>}
            {!session.data?.user && <button onClick={() => signIn()}>SignIn</button>}
        </div>
      </div>
    </div>
  );
}
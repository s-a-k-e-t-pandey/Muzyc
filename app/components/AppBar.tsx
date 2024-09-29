"use client";
import { signIn, useSession, signOut } from "next-auth/react";
import { CgController } from "react-icons/cg";
import { MdLibraryMusic } from "react-icons/md";
import { PiShieldStarBold } from "react-icons/pi";

export default function AppBar() {
  const session = useSession();
  return (
    <div className="flex justify-between flex-row flex-1">
      <div className="flex justify-between flex-row flex-1">
        <div className="font-extrabold text-4xl pt-2 shadow-xl px-1 shadow-emerald-200 text-emerald-100">Muzyc</div>
        <div className="flex gap-32 text-emerald-200 font-semibold text-xl mt-4">
          <div className="flex justify-between"><CgController className="mt-0.5"/>Products</div>
          <div className="flex justify-between"><MdLibraryMusic className="mt-1"/>Your library</div>
          <div className="flex justify-between"><PiShieldStarBold className="mt-0.5"/>About us</div>
        </div>
        <div className="flex gap-2 text-emerald-100 font-semibold text-xl mt-1 bg-slate-700 p-2 rounded-md border-emerald-500 border-2">
            {session.data?.user && <button onClick={() => signOut()}>LogOut</button>}
            {!session.data?.user && <button onClick={() => signIn()}>SignIn</button>}
        </div>
      </div>
    </div>
  );
}
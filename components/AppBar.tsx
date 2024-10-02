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
          <button className="flex justify-between"><CgController className="mt-0.5"/>Products</button>
          <button className="flex justify-between"><MdLibraryMusic className="mt-1"/>Your library</button>
          <button className="flex justify-between"><PiShieldStarBold className="mt-0.5"/>About us <DropDown/></button>
        </div>
        <div className="flex gap-2 text-emerald-100 font-semibold text-xl mt-1 bg-slate-700 p-2 rounded-md border-emerald-500 border-2">
            {session.data?.user && <button onClick={() => signOut()}>LogOut</button>}
            {!session.data?.user && <button onClick={() => signIn()}>SignIn</button>}
        </div>       
          
        </div>
    </div>
  );
}


import React, { useState } from 'react';

const DropDown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);

  // Toggle the main dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    // Close sub-dropdown when main dropdown is closed
    if (isDropdownOpen) {
      setIsSubDropdownOpen(false);
    }
  };

  // Toggle the sub-dropdown visibility
  const toggleSubDropdown = () => {
    setIsSubDropdownOpen(!isSubDropdownOpen);
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className=""
        type="button"
      >
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="z-10 absolute text-emerald-200 right-0 mt-2 w-44 border-2 border-emerald-500 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-2 00">
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-emerald-200 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >Dashboard
              </a>
            </li>
            <li>
              <button
                onClick={toggleSubDropdown}
                className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Dropdown
                <svg
                  className="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </button>
              {isSubDropdownOpen && (
                <div className="z-10 absolute left-full top-0 mt-0 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Overview
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        My downloads
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Billing
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Rewards
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Earnings
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Sign out
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};


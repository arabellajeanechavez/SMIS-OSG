"use client";
import React from 'react';
import Image from "next/image";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#283971] relative">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 pt-14">
        <Image src="/transparent_logo.png" alt="Logo" width={250} height={100} className="object-contain" />
      </div>

      <div className="bg-white shadow-lg rounded-[24px] p-12 w-[600px] flex flex-col items-center justify-center relative z-10 text-center">
        <h1 className="text-3xl font-semibold mb-4">Welcome</h1>
        <p className="text-gray-600 mb-8">Your journey begins here</p>

        <div className="flex flex-col w-full space-y-4">
          <Link href="/login" className="w-full">
            <button
              className="w-full h-[50px] bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-[18px] transition duration-200"
            >
              Sign In
            </button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <a href="#" className="text-blue-600 hover:underline">Contact support</a></p>
        </div>
      </div>

      <div className="absolute bottom-4 text-white text-sm">
        © {new Date().getFullYear()} Xavier University Ateneo De Cagayan
      </div>
    </div>
  );
};

export default LandingPage;
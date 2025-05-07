"use client";
import Link from "next/link";
import React, { useState } from "react";

export default function Verify() {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#283971] to-[#1e2c5a] px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#283971] mb-4">
              Verify Your Account
            </h1>
            <p className="text-gray-600 mb-6">
              An OTP has been sent to your email address.
            </p>
          </div>


          <div className="text-center mt-4">
            <Link href="/login" className="text-gray-600 hover:text-[#283971] transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
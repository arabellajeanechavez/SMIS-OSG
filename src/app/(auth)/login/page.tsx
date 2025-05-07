"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOST } from "@/constants/host";

// Custom Spinner Component
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true); // Start loading

    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch(`${HOST}/login/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // check if sent otp or account already exists
        const { message, data } = await res.json();

        //TODO: change cso to osg
        if (message === "ACCOUNT ALREADY EXISTS") {

          if (data.type === 'scholar') {
            router.push("/scholarMainDashboard");
          }

          else if (data.type === 'cso') {
            router.push("/csoMainDashboard");
          }

          else {
            setError("Something went wrong. Please try again.");
          }

        }

        else if (message === "SUCCESSFULLY SENT OTP CODE") {
          router.push("/verify");
        }

        else {
          setError("Something went wrong. Please try again.");
        }
      }
      else {
        const errorMessage = await res.json();
        setError(errorMessage.message || "Login failed. Please try again.");
      }
    }

    catch (error) {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }

  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#283971] relative">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 pt-14">
        <Image src="/transparent_logo.png" alt="Logo" width={250} height={100} className="object-contain" />
      </div>

      <div className="bg-white shadow-lg rounded-[24px] p-12 w-[600px] flex flex-col justify-center relative z-10">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign in</h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 text-center">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              id="email"
              className="mt-1 block w-full h-[50px] p-4 border border-gray-300 bg-gray-100 rounded-[18px] focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              id="password"
              className="mt-1 mb-8 block w-full h-[50px] p-4 border border-gray-300 bg-gray-100 rounded-[18px] focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>


          <button
            type="submit"
            className="w-full h-[50px] bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-[18px] transition duration-200 mt-2 hover:cursor-pointer flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
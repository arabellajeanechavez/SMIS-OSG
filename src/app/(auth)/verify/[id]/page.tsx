"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useCookies } from 'next-client-cookies';

export default function VerificationStatus() {
  const { id } = useParams();
  const [loginStatus, setLoginStatus] = useState('Verifying your login...');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const cookies = useCookies();

  // Custom spinner component
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
          className="text-[#283971]"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    </div>
  );

  // TODO: change cso to osg
  useEffect(() => {
    async function getTokenCookie() {
      try {
        const res = await fetch(`/verify/api/${id}`);
        const { message, data } = await res.json();

        setIsLoading(false);
        setLoginStatus(message);

        if (res.status === 200) {
          setLoginError(false);

          setTimeout(() => {
            if (data.type === 'cso') {
              router.push('/csoMainDashboard');
            }
            else if (data.type === 'scholar') {
              router.push('/scholarMainDashboard');
            }
          }, 1000);
        }

        else {
          setLoginError(true);
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        setLoginError(true);
        setLoginStatus('An error occurred. Please try again.');
      }
    }

    getTokenCookie();
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#283971] to-[#1e2c5a] px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 space-y-6 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Spinner />
              <h1 className="text-2xl font-bold text-[#283971]">
                Verifying Login
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your credentials
              </p>
            </div>
          ) : (
            <>
              <div className={`mb-6 ${loginError ? 'text-red-600' : 'text-green-600'}`}>
                {loginError ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto mb-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto mb-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-2xl font-bold mb-4">Verification Successful</h1>
                  </>
                )}

                <p className="text-gray-700 mb-6">{loginStatus}</p>
              </div>

              {loginError && (
                <Link href="/login" className="block">
                  <button className="w-full bg-[#283971] text-white py-3 rounded-lg font-semibold hover:bg-[#1e2c5a] transition-colors hover:cursor-pointer">
                    Retry Login
                  </button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
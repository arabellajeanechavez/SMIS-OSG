"use client";

import React, { useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, ChevronLeft, Home, LogOut, Bell } from "lucide-react";
import LogoutModal from './LogoutModal';
import { useCookies } from 'next-client-cookies';
interface MenuItemType {
  icon: string;
  label: string;
  href?: string;
}

interface SidebarClientProps {
  menuItems: MenuItemType[];
  bottomMenuItems: MenuItemType[];
}

export default function SidebarClient({ menuItems, bottomMenuItems }: SidebarClientProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cookies = useCookies();

  const handleLogout = () => {
    cookies.remove('token');
    console.log("User logged out");
    router.push('/login');
  };

  const iconMap: Record<string, React.ElementType> = {
    "Home": Home,
    "Bell": Bell,
    "LogOut": LogOut
  };

  return (
    <>
      <div
        className={`bg-[#283971] text-white h-full flex flex-col transition-all duration-300 ease-in-out ${isOpen ? "w-80 rounded-tr-[20px] rounded-br-[20px]" : "w-20"
          } shadow-lg shrink-0`}
      >
        {/* Top Section with Close Button and Logo */}
        <div className="p-4">
          <div className="flex justify-end">
            <button
              className={`text-white hover:bg-[#A19158] p-2 rounded-full transition-all ${!isOpen && "hidden"}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          {isOpen && (
            <div className="flex justify-center mt-4">
              <Image
                src="/transparent_logo.png"
                alt="XU Logo"
                width={220}
                height={43}
                className="opacity-100 scale-100"
              />
            </div>
          )}
        </div>

        {/* Collapse Button */}
        {!isOpen && (
          <button
            className="text-white hover:bg-[#A19158] p-2 rounded-full transition-all mt-4 mx-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} />
          </button>
        )}

        {/* Menu Items */}
        <div className="overflow-y-auto flex-1 py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item, index) => {
              const IconComponent = iconMap[item.icon];
              return (
                <li key={index}>
                  <Link
                    href={item.href || "#"}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${pathname === item.href
                      ? "bg-[#A19158] text-white"
                      : "text-white hover:bg-[#A19158]/70 hover:shadow-md"
                      } ${!isOpen && "justify-center"} group`}
                  >
                    {IconComponent && (
                      <IconComponent
                        size={isOpen ? 20 : 24}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    {isOpen && (
                      <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Menu Items */}
        <div className="mt-auto py-4">
          <ul className="space-y-2 px-3">
            {bottomMenuItems.map((item, index) => {
              const IconComponent = iconMap[item.icon];
              return (
                <li key={index}>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className={`flex items-center gap-4 p-3 rounded-lg w-full transition-all duration-300 text-white hover:bg-[#A19158]/70 hover:shadow-md ${!isOpen && "justify-center"
                      } group`}
                  >
                    {IconComponent && (
                      <IconComponent
                        size={isOpen ? 20 : 24}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    {isOpen && (
                      <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Refrigerator, Cookie } from "lucide-react";
import UserDropdown from "./UserDropdown";
import { checkUser } from "@/lib/checkUser";



const Header = async() => {
  
  const user = await checkUser(); // Check if user exists in Strapi and get subscription tier
  
  return (
    <header className="fixed top-0 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-stone-50/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <Image src="/logo.png" alt="BiteBuddy Logo" width={80} height={60} className="w-16" />
        </Link>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-stone-600">
          <Link href="/recipe" className="hover:text-orange-600 transition-colors flex gap-1.5 items-center" >
          <Cookie className="w-4 h-4" />My Recipes
          </Link>
          <Link href="/pantry" className="hover:text-orange-600 transition-colors flex gap-1.5 items-center" >
          <Refrigerator className="w-4 h-4" />My Pantry
          </Link>
        </div>

        <div className="flex items-center space-x-4">

        <Show when="signed-in">
          {/* have to add a how to cook button here */}
          <UserDropdown />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 font-medium">Sign In</Button> 
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="primary" className="rounded-full px-6">
              Get Started 
            </Button>
          </SignUpButton>
        </Show>
        </div>
      </nav>
    </header>
  );
};

export default Header;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User, MapPin } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInDialog } from "@/components/Auth/SignInDialog";
import { SignUpDialog } from "@/components/Auth/SignUpDialog";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const handleSignInClick = () => {
    setSignInOpen(true);
  };

  const handleSignUpClick = () => {
    setSignUpOpen(true);
  };

  const handleSwitchToSignUp = () => {
    setSignUpOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setSignInOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CebuFlexi<span className="text-blue-600">Tours</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Tours
            </Link>
            <Link href="/car-rentals" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Car Rentals
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={handleSignInClick}
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignUpClick}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="/" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/tours" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Tours
            </Link>
            <Link href="/car-rentals" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Car Rentals
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>
            <Link href="/blog" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Blog
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
            
            <div className="pt-4 border-t">
              {loading ? (
                <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Account</span>
                  </div>
                  <div className="pl-6 space-y-2">
                    <button 
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                      disabled
                    >
                      My Account
                    </button>
                    <button 
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                      disabled
                    >
                      Bookings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    onClick={handleSignInClick}
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleSignUpClick}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <SignInDialog 
        open={signInOpen} 
        onOpenChange={setSignInOpen}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      
      <SignUpDialog 
        open={signUpOpen} 
        onOpenChange={setSignUpOpen}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </header>
  );
}

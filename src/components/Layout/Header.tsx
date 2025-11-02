import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User, MapPin } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInDialog } from "@/components/Auth/SignInDialog";
import { SignUpDialog } from "@/components/Auth/SignUpDialog";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const isHomePage = router.pathname === "/";

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
      toast({
        title: "Successfully logged out!",
        description: "You have been signed out successfully.",
        duration: 2000,
      });
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return isHomePage ? (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {isHomePage ? (
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <MapPin className="h-8 w-8 text-blue-600" />
              </motion.div>
            ) : (
              <MapPin className="h-8 w-8 text-blue-600" />
            )}
            <span className="text-2xl font-bold text-gray-900">CebuFlexi<span className="text-blue-600">Tours</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Tours
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/car-rentals" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Car Rentals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Blog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
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
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/bookings">
                      Bookings
                    </Link>
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
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignUpClick}
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {isHomePage ? (
            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>

        {isHomePage ? (
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden mt-4 pb-4 space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
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
                      <Link 
                        href="/account/profile"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        My Account
                      </Link>
                      <Link 
                        href="/account/bookings"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Bookings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
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
                  </motion.div>
                )}
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        ) : (
          mobileMenuOpen && (
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
                      <Link 
                        href="/account/profile"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        My Account
                      </Link>
                      <Link 
                        href="/account/bookings"
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Bookings
                      </Link>
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
          )
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
    </motion.header>
  ) : (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CebuFlexi<span className="text-blue-600">Tours</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Tours
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/car-rentals" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Car Rentals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Blog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
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
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/bookings">
                      Bookings
                    </Link>
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
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignUpClick}
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
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
                    <Link 
                      href="/account/profile"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      My Account
                    </Link>
                    <Link 
                      href="/account/bookings"
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Bookings
                    </Link>
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

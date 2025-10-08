import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, User, MapPin } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Link href="/tours">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Book Now
              </Button>
            </Link>
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
            <Link href="/tours" className="w-full block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Book Now
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}


import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/Animation/FadeIn";
import { useRouter } from "next/router";

export function Footer() {
  const router = useRouter();
  const isHomePage = router.pathname === "/";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {isHomePage ? (
            <FadeIn delay={0.1}>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <MapPin className="h-6 w-6 text-blue-500" />
                  </motion.div>
                  <span className="text-xl font-bold text-white">CebuFlexi<span className="text-blue-500">Tours</span></span>
                </div>
                <p className="text-sm mb-4">
                  Your trusted partner for unforgettable Cebu experiences. Explore the beauty of the Philippines with our expert-guided tours and quality car rentals.
                </p>
                <div className="flex space-x-4">
                  <motion.a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-blue-500 transition-colors"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Facebook className="h-5 w-5" />
                  </motion.a>
                  <motion.a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-blue-500 transition-colors"
                    whileHover={{ scale: 1.2, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Instagram className="h-5 w-5" />
                  </motion.a>
                </div>
              </div>
            </FadeIn>
          ) : (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">CebuFlexi<span className="text-blue-500">Tours</span></span>
              </div>
              <p className="text-sm mb-4">
                Your trusted partner for unforgettable Cebu experiences. Explore the beauty of the Philippines with our expert-guided tours and quality car rentals.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-500 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-500 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          )}

          {isHomePage ? (
            <FadeIn delay={0.2}>
              <div>
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/tours" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Tours</Link>
                  </li>
                  <li>
                    <Link href="/car-rentals" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Car Rentals</Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">About Us</Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Blog</Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Contact</Link>
                  </li>
                </ul>
              </div>
            </FadeIn>
          ) : (
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/tours" className="hover:text-blue-500 transition-colors">Tours</Link>
                </li>
                <li>
                  <Link href="/car-rentals" className="hover:text-blue-500 transition-colors">Car Rentals</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-blue-500 transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-blue-500 transition-colors">Blog</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link>
                </li>
              </ul>
            </div>
          )}

          {isHomePage ? (
            <FadeIn delay={0.3}>
              <div>
                <h3 className="text-white font-semibold mb-4">Tours</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/tours?category=Beach" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Beach Tours</Link>
                  </li>
                  <li>
                    <Link href="/tours?category=Adventure" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Adventure Tours</Link>
                  </li>
                  <li>
                    <Link href="/tours?category=Cultural" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Cultural Tours</Link>
                  </li>
                  <li>
                    <Link href="/tours?category=Food" className="hover:text-blue-500 transition-all duration-300 hover:translate-x-1 inline-block">Food Tours</Link>
                  </li>
                </ul>
              </div>
            </FadeIn>
          ) : (
            <div>
              <h3 className="text-white font-semibold mb-4">Tours</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/tours?category=Beach" className="hover:text-blue-500 transition-colors">Beach Tours</Link>
                </li>
                <li>
                  <Link href="/tours?category=Adventure" className="hover:text-blue-500 transition-colors">Adventure Tours</Link>
                </li>
                <li>
                  <Link href="/tours?category=Cultural" className="hover:text-blue-500 transition-colors">Cultural Tours</Link>
                </li>
                <li>
                  <Link href="/tours?category=Food" className="hover:text-blue-500 transition-colors">Food Tours</Link>
                </li>
              </ul>
            </div>
          )}

          {isHomePage ? (
            <FadeIn delay={0.4}>
              <div>
                <h3 className="text-white font-semibold mb-4">Contact Info</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MapPin className="h-5 w-5 text-blue-500 mt-0.5 transition-transform duration-300 group-hover:scale-110" />
                    </motion.div>
                    <span className="text-sm">123 Osmeña Blvd, Cebu City, Philippines 6000</span>
                  </li>
                  <li className="flex items-center space-x-2 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Phone className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                    </motion.div>
                    <span className="text-sm">+63 32 123 4567</span>
                  </li>
                  <li className="flex items-center space-x-2 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mail className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                    </motion.div>
                    <span className="text-sm">info@cebuflexitours.com</span>
                  </li>
                </ul>
              </div>
            </FadeIn>
          ) : (
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <span className="text-sm">123 Osmeña Blvd, Cebu City, Philippines 6000</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">+63 32 123 4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">info@cebuflexitours.com</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 CebuFlexi Tours. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className={`text-sm text-gray-400 hover:text-blue-500 ${isHomePage ? 'transition-all duration-300 hover:translate-y-[-2px]' : 'transition-colors'}`}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={`text-sm text-gray-400 hover:text-blue-500 ${isHomePage ? 'transition-all duration-300 hover:translate-y-[-2px]' : 'transition-colors'}`}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

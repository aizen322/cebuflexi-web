
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, Check, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function CarRentalTeaser() {
  const features = [
    { icon: Car, title: "Self-Drive or With Driver", desc: "Choose what suits you best", color: "text-teal-300" },
    { icon: Clock, title: "Flexible Rental", desc: "Daily, weekly, or monthly", color: "text-teal-300" },
    { icon: Shield, title: "24/7 Support", desc: "Always here to help", color: "text-teal-300" }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center mb-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Car className="h-10 w-10 mr-3" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Rent a Car & Explore Cebu
            </h2>
          </div>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Experience the freedom to explore Cebu at your own pace. Premium vehicles with flexible options.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <CardContent className="p-5 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    <feature.icon className={`h-8 w-8 mx-auto mb-2 ${feature.color}`} />
                  </motion.div>
                  <h3 className={`font-semibold text-base mb-1 ${feature.color}`}>{feature.title}</h3>
                  <p className="text-sm text-blue-100">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Vehicle Images Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div 
              className="relative overflow-hidden rounded-lg shadow-xl group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop"
                alt="Sedan car rental"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <h4 className="font-bold text-base">Sedans</h4>
                  <p className="text-xs text-gray-200">Perfect for city trips</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-lg shadow-xl group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop"
                alt="SUV car rental"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <h4 className="font-bold text-base">SUVs</h4>
                  <p className="text-xs text-gray-200">Ideal for adventures</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-lg shadow-xl group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&h=600&fit=crop"
                alt="Van car rental"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <h4 className="font-bold text-base">Vans</h4>
                  <p className="text-xs text-gray-200">Great for groups</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <Link href="/car-rentals">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-gray-100 text-base px-8 py-5 font-semibold shadow-xl"
                >
                  Browse All Vehicles
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

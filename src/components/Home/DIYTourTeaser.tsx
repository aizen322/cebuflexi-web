import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map, Calendar, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function DIYTourTeaser() {
  const features = [
    { icon: Map, title: "Choose Your Spots", desc: "Select from iconic landmarks", color: "text-orange-300" },
    { icon: Calendar, title: "Flexible Schedule", desc: "Build your perfect itinerary", color: "text-orange-300" },
    { icon: Sparkles, title: "Live Pricing", desc: "See costs update in real-time", color: "text-orange-300" },
    { icon: CheckCircle, title: "Easy Booking", desc: "Confirm in just a few clicks", color: "text-orange-300" }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 text-white relative overflow-hidden">
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
              <Map className="h-10 w-10 mr-3" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold">
              DIY Tour - Build Your Perfect Day
            </h2>
          </div>
          <p className="text-lg text-orange-100 max-w-3xl mx-auto">
            Craft your own Cebu adventure! Choose from our curated collection of historical landmarks, 
            cultural treasures, and iconic sites. Design a custom itinerary that matches your interests 
            and schedule, with transparent pricing and real-time route planning.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
                  <p className="text-sm text-orange-100">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Preview Images */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="relative overflow-hidden rounded-lg shadow-xl group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop"
                alt="Fort San Pedro"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <div>
                  <h4 className="font-bold text-sm">Fort San Pedro</h4>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-lg shadow-xl group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop"
                alt="Magellan's Cross"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <div>
                  <h4 className="font-bold text-sm">Magellan's Cross</h4>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-lg shadow-xl group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1502920514313-52581002a659?w=400&h=300&fit=crop"
                alt="Santo Niño Church"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <div>
                  <h4 className="font-bold text-sm">Santo Niño</h4>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-lg shadow-xl group"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&h=300&fit=crop"
                alt="Taoist Temple"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <div>
                  <h4 className="font-bold text-sm">Taoist Temple</h4>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <Link href="/custom-itinerary">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-orange-700 hover:bg-gray-100 text-base px-8 py-5 font-semibold shadow-xl"
                >
                  Create Your Tour
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


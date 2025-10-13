
import { Shield, Users, Clock, Leaf, Award, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/Animation/FadeIn";
import { StaggerContainer, staggerItem } from "@/components/Animation/StaggerContainer";

const features = [
  {
    icon: Users,
    title: "Expert Local Guides",
    description: "Our passionate guides are born and raised in Cebu, offering authentic insights and unforgettable stories"
  },
  {
    icon: HeartHandshake,
    title: "Tailored Itineraries",
    description: "Customize every aspect of your tour to match your interests, pace, and preferences"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock assistance ensures your peace of mind throughout your Cebu adventure"
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Options",
    description: "Sustainable tourism practices that protect Cebu's natural beauty for future generations"
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Fully insured tours with comprehensive safety measures and modern equipment"
  },
  {
    icon: Award,
    title: "DOT Accredited",
    description: "Officially accredited by the Department of Tourism for quality and reliability"
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose CebuFlexi Tours
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional experiences that showcase the best of Cebu
            </p>
          </div>
        </FadeIn>

        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="border-2 hover:border-blue-600 transition-colors duration-300 group hover:shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <motion.div 
                          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="h-8 w-8 text-blue-600 group-hover:text-white" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}

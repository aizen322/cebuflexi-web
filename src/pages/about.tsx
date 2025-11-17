
import Head from "next/head";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Heart, Users, Shield, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/Animation/FadeIn";
import { StaggerContainer, staggerItem } from "@/components/Animation/StaggerContainer";

export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Authentic Experiences",
      description: "We showcase the real Cebu through local eyes, beyond typical tourist traps."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safety First",
      description: "DOT-accredited with comprehensive insurance and trained guides for your peace of mind."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Sustainable Tourism",
      description: "Eco-friendly practices and community partnerships that benefit local Cebuanos."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Personalized Service",
      description: "Flexible itineraries tailored to your interests, pace, and budget."
    }
  ];

  return (
    <>
      <Head>
        <title>About Us - Local Cebu Tour Experts | CebuFlexi Tours</title>
        <meta name="description" content="Learn about CebuFlexi Tours - DOT-accredited tour operator with 15+ years of experience. Meet our team of local guides passionate about sustainable tourism in Cebu, Philippines." />
        <meta name="keywords" content="Cebu tour company, DOT accredited tours Cebu, local tour guides Cebu, sustainable tourism Philippines" />
        <link rel="canonical" href="https://cebuflexitours.com/about" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <FadeIn>
              <Badge className="mb-4 bg-white text-blue-600">DOT Accredited</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Your Local Cebu Experts
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                For over 15 years, we've been sharing the magic of Cebu with travelers from around the world. Our passion is your unforgettable adventure.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Story</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-700 mb-4">
                    CebuFlexi Tours was born from a simple dream: to show the world the Cebu we know and love. Founded in 2010 by Maria Santos, a native Cebuano with deep roots in the island's tourism industry, we started with just two tours and a commitment to authentic, responsible travel.
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    Today, we're proud to be one of Cebu's most trusted tour operators, recognized by the Department of Tourism for our excellence in service and commitment to sustainable tourism practices. Our team of local guides doesn't just show you the sights - they share their stories, their culture, and their genuine love for this beautiful island.
                  </p>
                  <p className="text-lg text-gray-700">
                    Every tour we design reflects our core values: authenticity, safety, sustainability, and personalization. Whether you're swimming with whale sharks in Oslob, exploring Spanish colonial architecture in the city, or discovering hidden waterfalls in the highlands, you're experiencing Cebu through the eyes of those who call it home.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Choose Us</h2>
            </FadeIn>
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, idx) => (
                  <motion.div key={idx} variants={staggerItem}>
                    <Card className="text-center hover:shadow-lg transition-shadow group">
                      <CardContent className="pt-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {value.icon}
                          </motion.div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-300">{value.title}</h3>
                        <p className="text-gray-600">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>

        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-xl mb-8">
                  To promote sustainable tourism in Cebu by creating authentic experiences that benefit local communities, preserve our natural and cultural heritage, and create lasting memories for our guests.
                </p>
              </FadeIn>
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <motion.div variants={staggerItem}>
                    <div>
                      <div className="text-4xl font-bold mb-2">15+</div>
                      <p className="text-blue-100">Years of Experience</p>
                    </div>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <div>
                      <div className="text-4xl font-bold mb-2">10,000+</div>
                      <p className="text-blue-100">Happy Travelers</p>
                    </div>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <div>
                      <div className="text-4xl font-bold mb-2">50+</div>
                      <p className="text-blue-100">Tour Packages</p>
                    </div>
                  </motion.div>
                </div>
              </StaggerContainer>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Award className="h-16 w-16 mx-auto mb-6 text-blue-600" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">Accreditations & Partnerships</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Proud member of the Philippine Department of Tourism's accredited tour operators. We maintain partnerships with local communities, environmental organizations, and hospitality providers to ensure the highest standards of service and sustainability.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <Badge variant="outline" className="text-base py-2 px-4 transition-all duration-300 hover:scale-110">DOT Accredited</Badge>
                  <Badge variant="outline" className="text-base py-2 px-4 transition-all duration-300 hover:scale-110">Eco-Tourism Certified</Badge>
                  <Badge variant="outline" className="text-base py-2 px-4 transition-all duration-300 hover:scale-110">PATA Member</Badge>
                  <Badge variant="outline" className="text-base py-2 px-4 transition-all duration-300 hover:scale-110">TripAdvisor Excellence</Badge>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

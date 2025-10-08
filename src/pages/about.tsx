
import Head from "next/head";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Heart, Users, Shield, Globe, Star } from "lucide-react";

export default function AboutPage() {
  const team = [
    {
      name: "Maria Santos",
      role: "Founder & Lead Guide",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      bio: "Born and raised in Cebu, Maria has 15+ years of experience showcasing the beauty of her homeland."
    },
    {
      name: "Carlos Reyes",
      role: "Operations Manager",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "Logistics expert ensuring every tour runs smoothly. DOT-certified with a passion for sustainable tourism."
    },
    {
      name: "Ana Cruz",
      role: "Cultural Heritage Guide",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "Historian specializing in Cebu's Spanish colonial past and indigenous Visayan culture."
    },
    {
      name: "Diego Mendoza",
      role: "Adventure Tour Specialist",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      bio: "Marine biologist and certified dive master leading our water-based adventures."
    }
  ];

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
            <Badge className="mb-4 bg-white text-blue-600">DOT Accredited</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Local Cebu Experts
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              For over 15 years, we've been sharing the magic of Cebu with travelers from around the world. Our passion is your unforgettable adventure.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
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
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, idx) => (
                <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Local experts passionate about sharing Cebu's wonders with the world
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64">
                    <img
                      src={member.image}
                      alt={`${member.name} - ${member.role}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl mb-8">
                To promote sustainable tourism in Cebu by creating authentic experiences that benefit local communities, preserve our natural and cultural heritage, and create lasting memories for our guests.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div>
                  <div className="text-4xl font-bold mb-2">15+</div>
                  <p className="text-blue-100">Years of Experience</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <p className="text-blue-100">Happy Travelers</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <p className="text-blue-100">Tour Packages</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Award className="h-16 w-16 mx-auto mb-6 text-blue-600" />
              <h2 className="text-3xl font-bold mb-4">Accreditations & Partnerships</h2>
              <p className="text-lg text-gray-700 mb-6">
                Proud member of the Philippine Department of Tourism's accredited tour operators. We maintain partnerships with local communities, environmental organizations, and hospitality providers to ensure the highest standards of service and sustainability.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Badge variant="outline" className="text-base py-2 px-4">DOT Accredited</Badge>
                <Badge variant="outline" className="text-base py-2 px-4">Eco-Tourism Certified</Badge>
                <Badge variant="outline" className="text-base py-2 px-4">PATA Member</Badge>
                <Badge variant="outline" className="text-base py-2 px-4">TripAdvisor Excellence</Badge>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}


import Head from "next/head";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { HeroSection } from "@/components/Home/HeroSection";
import { FeaturedTours } from "@/components/Home/FeaturedTours";
import { WhyChooseUs } from "@/components/Home/WhyChooseUs";
import { CarRentalTeaser } from "@/components/Home/CarRentalTeaser";
import { Testimonials } from "@/components/Home/Testimonials";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>CebuFlexi Tours - Explore the Best of Cebu | Tours & Car Rentals</title>
        <meta name="description" content="Discover Cebu's pristine beaches, rich history, and unforgettable adventures. Book guided tours and car rentals with CebuFlexi Tours - your trusted local travel partner." />
        <meta name="keywords" content="Cebu tours, Cebu travel, Philippines tours, beach tours Cebu, island hopping, car rental Cebu, Cebu adventure, guided tours Philippines" />
        <meta property="og:title" content="CebuFlexi Tours - Explore the Best of Cebu" />
        <meta property="og:description" content="Experience world-class beaches, rich history, and unforgettable adventures in the heart of the Philippines" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=630&fit=crop" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://cebuflexitours.com" />
      </Head>

      <Header />
      
      <main className="overflow-x-hidden">
        <HeroSection />
        <FeaturedTours />
        <WhyChooseUs />
        <CarRentalTeaser />
        <Testimonials />
      </main>

      <Footer />
    </>
  );
}

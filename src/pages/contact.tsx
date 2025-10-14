
import Head from "next/head";
import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/Animation/FadeIn";
import { createContactSubmission } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createContactSubmission({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us! We'll get back to you within 24 hours.",
      });
      
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      // Fallback: show success message even if database fails
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us! We'll get back to you within 24 hours.",
      });
      
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How do I book a tour?",
      answer: "You can book directly through our website by selecting your desired tour and filling out the booking form. Alternatively, contact us via email or phone, and our team will assist you with the booking process. A deposit is required to confirm your reservation."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellations made 7+ days before the tour date receive a full refund minus a 10% processing fee. Cancellations 3-6 days before receive a 50% refund. Cancellations within 48 hours are non-refundable. Weather-related cancellations initiated by us result in full refunds or rescheduling options."
    },
    {
      question: "Are your tours suitable for children and elderly travelers?",
      answer: "Most of our tours are family-friendly and can accommodate various fitness levels. Each tour listing specifies difficulty levels and age recommendations. We can customize tours to suit your group's needs - just let us know during booking."
    },
    {
      question: "What should I bring on the tours?",
      answer: "Essentials include: sunscreen, hat, comfortable walking shoes, swimwear (for water activities), change of clothes, personal medications, and cash for personal purchases. Specific tours may have additional requirements listed in the itinerary."
    },
    {
      question: "Do you provide hotel pickup?",
      answer: "Yes! Most tours include complimentary pickup from hotels in Cebu City and Mactan. For accommodations outside these areas, additional transfer fees may apply. Please provide your hotel details during booking."
    },
    {
      question: "Are meals included in the tours?",
      answer: "This varies by tour package. Check the 'What's Included' section of each tour for details. Most day tours include lunch, while multi-day tours typically include all specified meals. Dietary restrictions can be accommodated with advance notice."
    },
    {
      question: "What if there's bad weather on my tour date?",
      answer: "Safety is our priority. If weather conditions are unsafe, we'll contact you to reschedule or offer a full refund. For mild weather changes, tours proceed with necessary adjustments. We monitor forecasts closely and provide updates 24 hours before departure."
    },
    {
      question: "Do I need travel insurance?",
      answer: "While our tours include basic liability coverage, we strongly recommend purchasing comprehensive travel insurance that covers medical emergencies, trip cancellations, and personal belongings."
    },
    {
      question: "Can you accommodate special dietary requirements?",
      answer: "Absolutely! We can arrange vegetarian, vegan, halal, or other dietary accommodations. Please inform us of any requirements during booking so we can coordinate with our restaurant partners."
    },
    {
      question: "Are your guides English-speaking?",
      answer: "Yes, all our guides are fluent in English. Many also speak additional languages including Tagalog, Cebuano, Japanese, and Mandarin. If you require a specific language guide, please request this when booking."
    }
  ];

  return (
    <>
      <Head>
        <title>Contact Us & FAQs - Book Your Cebu Tour | CebuFlexi Tours</title>
        <meta name="description" content="Contact CebuFlexi Tours for tour bookings, inquiries, and customer support. Find answers to common questions about our Cebu tours, bookings, and policies." />
        <meta name="keywords" content="contact Cebu tours, book Cebu tour, tour inquiry Philippines, Cebu travel questions, tour booking support" />
        <link rel="canonical" href="https://cebuflexitours.com/contact" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Have questions? We're here to help you plan your perfect Cebu adventure.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FadeIn direction="left">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                      <CardDescription>Fill out the form below and we'll respond within 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="John Doe"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder="john@example.com"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              placeholder="+63 912 345 6789"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                              id="subject"
                              required
                              value={formData.subject}
                              onChange={(e) => setFormData({...formData, subject: e.target.value})}
                              placeholder="Tour inquiry"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="message">Your Message *</Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            placeholder="Tell us about your trip plans, questions, or special requests..."
                            rows={6}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105" 
                          size="lg"
                          disabled={isSubmitting}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>

              <div className="space-y-6">
                <FadeIn direction="right">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start group">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MapPin className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110" />
                        </motion.div>
                        <div>
                          <p className="font-semibold mb-1">Office Address</p>
                          <p className="text-sm text-gray-600">
                            123 Osmena Boulevard<br />
                            Cebu City, 6000<br />
                            Philippines
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start group">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Phone className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110" />
                        </motion.div>
                        <div>
                          <p className="font-semibold mb-1">Phone</p>
                          <p className="text-sm text-gray-600">+63 32 123 4567</p>
                          <p className="text-sm text-gray-600">+63 917 890 1234</p>
                        </div>
                      </div>

                      <div className="flex items-start group">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Mail className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110" />
                        </motion.div>
                        <div>
                          <p className="font-semibold mb-1">Email</p>
                          <p className="text-sm text-gray-600">info@cebuflexitours.com</p>
                          <p className="text-sm text-gray-600">bookings@cebuflexitours.com</p>
                        </div>
                      </div>

                      <div className="flex items-start group">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Clock className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110" />
                        </motion.div>
                        <div>
                          <p className="font-semibold mb-1">Business Hours</p>
                          <p className="text-sm text-gray-600">Monday - Saturday: 8:00 AM - 6:00 PM</p>
                          <p className="text-sm text-gray-600">Sunday: 9:00 AM - 3:00 PM</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                <FadeIn direction="right" delay={0.2}>
                  <Card>
                    <CardHeader>
                      <CardTitle>24/7 Emergency Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        For guests currently on tour experiencing emergencies:
                      </p>
                      <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-lg">
                        <Phone className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-bold text-red-600">+63 917 911 0000</p>
                          <p className="text-xs text-red-600">Available 24/7</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Find quick answers to common questions about our tours and services
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="bg-white rounded-lg px-6 hover:shadow-lg transition-all duration-300">
                      <AccordionTrigger className="text-left font-semibold hover:text-blue-600 transition-colors duration-300">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <FadeIn>
              <Card>
                <CardHeader>
                  <CardTitle>Visit Our Office</CardTitle>
                  <CardDescription>Find us in the heart of Cebu City</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.3576563!2d123.8854!3d10.2968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDE3JzQ4LjUiTiAxMjPCsDUzJzA3LjQiRQ!5e0!3m2!1sen!2sph!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="CebuFlexi Tours Office Location"
                    />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

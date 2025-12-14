import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";



const Page = async () => {

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Page;


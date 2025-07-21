
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import LogoCarousel from "@/components/LogoCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative container px-4 pt-40 pb-20"
      >
        {/* Background */}
        <div 
          className="absolute inset-0 -z-10 bg-[#0A0A0A]"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full glass"
            >
              <span className="text-sm font-medium">
                <BookOpen className="w-4 h-4 inline-block mr-2" />
                Smart test preparation platform
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-normal mb-4 tracking-tight text-left">
              <span className="text-gray-200">
                <TextGenerateEffect words="Practice Smarter." />
              </span>
              <br />
              <span className="text-white font-medium">
                <TextGenerateEffect words="Perform Better" />
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl text-left"
            >
              Take customized or full-length tests and track your growth with{" "}
              <span className="text-white">advanced analytics and performance insights.</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 items-start"
            >
              <Button size="lg" className="button-gradient" onClick={() => navigate("/login")}>Start Practicing</Button>
              <Button size="lg" variant="link" className="text-white">
                View Plans <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Right side - Character image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <img
                src="/open-source/human.png"
                alt="Student character reading a book"
                className="w-80 h-80 md:w-96 md:h-96 object-contain ml-[-100px]" /* Adjust margin to align properly */
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative mx-auto max-w-5xl mt-20"
        >
          <div className="glass rounded-xl overflow-hidden">
            
          </div>
        </motion.div>
      </motion.section>

      

      {/* Features Section */}
      <div id="features" className="bg-black">
        <FeaturesSection />
      </div>

      {/* Preview/Demo Section */}
      <section className="container px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-normal mb-6 tracking-tight">
              Preview / <span className="text-gradient font-medium">Demo</span>
            </h2>
            <div className="space-y-3">
              {/*
              <div className="h-2 bg-muted rounded-full w-full"></div>
              <div className="h-2 bg-muted rounded-full w-4/5"></div>
              <div className="h-2 bg-muted rounded-full w-2/3"></div>
              */}
            </div>
            <p className="text-lg text-muted-foreground mt-6">
              Experience our interactive test interface with real-time feedback and comprehensive analytics.
            </p>
          </div>
          <div className="glass rounded-xl p-8 h-64 flex items-center justify-center">
            <span className="text-muted-foreground">Interactive Demo Preview</span>
          </div>
        </div>
      </section>

      {/* Logo Carousel */}
      <LogoCarousel />

      {/* Pricing Section */}
      <div id="pricing" className="bg-black">
        <PricingSection />
      </div>

      {/* Testimonials Section */}
      <div className="bg-black">
        <TestimonialsSection />
      </div>

      {/* CTA Section */}
      <section className="container px-4 py-20 relative bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0A0A0A]/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12 text-center relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Practice Smarter?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already improved their test scores with our platform.
          </p>
          <Button size="lg" className="button-gradient">
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default Index;

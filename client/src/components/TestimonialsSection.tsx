"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "B.Tech Student, Computer Science",
    image: "https://avatars.githubusercontent.com/u/1234567?v=4",
    content: "This platform helped me understand complex concepts in a much simpler way. The interactive content and real-world projects made learning fun and effective."
  },
  {
    name: "Rahul Mehta",
    role: "MBA Student, Finance",
    image: "https://avatars.githubusercontent.com/u/2345678?v=4",
    content: "The case studies and simulations gave me practical exposure that no textbook ever could. I feel more prepared for real-world challenges now."
  },
  {
    name: "Priya Nair",
    role: "B.A. Student, Psychology",
    image: "https://avatars.githubusercontent.com/u/3456789?v=4",
    content: "The platform’s structured approach and easy-to-follow modules kept me motivated throughout the semester. I’ve never enjoyed studying this much before!"
  },
  {
    name: "Aman Singh",
    role: "B.Sc Student, Mathematics",
    image: "https://avatars.githubusercontent.com/u/4567890?v=4",
    content: "I love how the concepts are broken down with real-world examples. It helped me improve my problem-solving skills drastically."
  },
  {
    name: "Sneha Reddy",
    role: "Engineering Student, ECE",
    image: "https://avatars.githubusercontent.com/u/5678901?v=4",
    content: "The mentorship and doubt-clearing sessions were a game-changer for me. I scored the highest in my class thanks to the constant support!"
  },
  {
    name: "Arjun Kapoor",
    role: "B.Com Student, Accounting",
    image: "https://avatars.githubusercontent.com/u/6789012?v=4",
    content: "As someone who struggled with theory-heavy subjects, the visual learning tools and step-by-step guides helped me grasp the topics easily."
  }
];


const TestimonialsSection = () => {
  return (
    <section className="py-20 overflow-hidden bg-black">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-normal mb-4">Trusted by Students</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied Students on Physiosimplified
          </p>
        </motion.div>

        <div className="relative flex flex-col antialiased">
          <div className="relative flex overflow-hidden py-4">
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-1`} className="w-[400px] shrink-0 bg-black/40 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-white/90">{testimonial.name}</h4>
                      <p className="text-sm text-white/60">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-2`} className="w-[400px] shrink-0 bg-black/40 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-white/90">{testimonial.name}</h4>
                      <p className="text-sm text-white/60">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
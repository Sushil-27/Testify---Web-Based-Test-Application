
import { Upload, Clock, FileText, BarChart3 } from "lucide-react";

export const testFeatures = [
  {
    title: "Create Your Own Test",
    description: "Build custom tests with various question types and difficulty levels",
    icon: <Upload className="w-6 h-6" />,
    image: "/open-source/testui.png"
  },
  {
    title: "Time-based or Flexible Tests",
    description: "Set time limits or allow unlimited time for comprehensive learning",
    icon: <Clock className="w-6 h-6" />,
    image: "/open-source/79f2b901-8a4e-42a5-939f-fae0828e0aef.png"
  },
  {
    title: "Subject Chapter-wise Practice",
    description: "Organize tests by subjects and chapters for structured learning",
    icon: <FileText className="w-6 h-6" />,
    image: "/open-source/86329743-ee49-4f2e-96f7-50508436273d.png"
  },
  {
    title: "Smart Performance Analysis",
    description: "Track your progress with detailed analytics and performance insights",
    icon: <BarChart3 className="w-6 h-6" />,
    image: "/open-source/b6436838-5c1a-419a-9cdc-1f9867df073d.png"
  }
];

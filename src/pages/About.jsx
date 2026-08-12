import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Target, Eye, Shield, Sparkles, Users, Clock, MapPin } from "lucide-react";
import background from '../assets/image2.webp'

export default function About() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 bg-[#96C1B9]">
      <div className="bg-gradient-to-r from-[#155B5F]/10 to-[#96C1B9]/10 border border-[#155B5F]/20 p-8 mb-12 rounded-lg shadow-sm">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="text-[#155B5F] border-[#155B5F] mb-2">
            Our Story
          </Badge>
          <h1 className="text-4xl font-bold text-[#155B5F] mb-6">About MoroCare</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            MoroCare is a Moroccan digital health platform dedicated to improving access to medical services for everyone — from urban centers to remote regions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="bg-white/50 backdrop-blur-sm border-[#96C1B9]">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-[#155B5F] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#155B5F]">10K+</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-[#96C1B9]">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-[#155B5F] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#155B5F]">50+</p>
            <p className="text-sm text-gray-600">Cities Covered</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-[#96C1B9]">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-[#155B5F] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#155B5F]">24/7</p>
            <p className="text-sm text-gray-600">Support Available</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-[#96C1B9]">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 text-[#155B5F] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#155B5F]">98%</p>
            <p className="text-sm text-gray-600">Satisfaction Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-md border-[#96C1B9] hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#155B5F]" />
              <CardTitle className="text-[#155B5F] text-xl">Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              To democratize access to healthcare by offering teleconsultation,
              appointment booking, and medication delivery across Morocco.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-[#96C1B9] hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#155B5F]" />
              <CardTitle className="text-[#155B5F] text-xl">Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              Building a fully connected digital health ecosystem that supports
              citizens, professionals, and institutions equally.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-[#96C1B9] hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#155B5F]" />
              <CardTitle className="text-[#155B5F] text-xl">Our Values</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#155B5F]" />
                <span className="text-gray-600">Accessibility</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#155B5F]" />
                <span className="text-gray-600">Transparency</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#155B5F]" />
                <span className="text-gray-600">Innovation</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#155B5F]" />
                <span className="text-gray-600">Respect & Ethics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <div className="h-[1px] w-full bg-gray-200 mb-6"></div>
        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          Designed and developed by the MoroCare team
        </p>
      </div>
    </section>
  );
}

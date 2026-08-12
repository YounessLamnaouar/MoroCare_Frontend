import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import contactImage from "@/assets/contact.webp"; 

export default function Contact() {
  return (
    <section className="max-w-7xl mx-auto bg-[#96C1B9] px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#155B5F] mb-4">Contact Us</h1>
        <p className="text-gray-600">
          Have a question, a partnership idea, or need assistance?  
          Fill out the form — our team will get back to you shortly!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <img
            src={contactImage}
            alt="Contact MoroCare"
            className="rounded-lg shadow-md w-full max-w-md object-cover"
          />
        </div>
        <Card className="bg-white shadow-lg border-2 border-[#96C1B9]">
          <CardContent className="p-8">
            <form className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-[#155B5F]">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  className="bg-[#F7FAFA] focus:ring-[#155B5F]"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#155B5F]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#F7FAFA] focus:ring-[#155B5F]"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-[#155B5F]">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message here..."
                  rows={5}
                  className="bg-[#F7FAFA] focus:ring-[#155B5F]"
                />
              </div>

              <Button type="submit" className="w-full bg-[#155B5F] hover:bg-[#0F4A4D] text-white">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

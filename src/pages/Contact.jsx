import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import contactImage from "@/assets/contact.webp"; 
import { useState } from "react";
import api from "@/api";
import { toast } from "sonner";

export default function Contact() {
  const [sending, setSending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    try {
      const { data } = await api.post('/api/contact', Object.fromEntries(new FormData(form)));
      toast.success(data.message);
      form.reset();
    } catch (error) {
      toast.error(Object.values(error.response?.data?.errors || {}).flat().join(' ') || 'Unable to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };
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
            <form className="space-y-6" onSubmit={submit}>
              <div>
                <Label htmlFor="name" className="text-[#155B5F]">Name</Label>
                <Input
                  id="name"
                  name="name" required maxLength={255}
                  placeholder="Enter your name"
                  className="bg-[#F7FAFA] focus:ring-[#155B5F]"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#155B5F]">Email</Label>
                <Input
                  id="email"
                  name="email" required maxLength={255}
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#F7FAFA] focus:ring-[#155B5F]"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-[#155B5F]">Message</Label>
                <Textarea
                  id="message"
                  name="message" required maxLength={5000}
                  placeholder="Write your message here..."
                  rows={5}
                  className="bg-[#F7FAFA] focus:ring-[#155B5F]"
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full bg-[#155B5F] hover:bg-[#0F4A4D] text-white">
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

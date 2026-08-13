import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export default function AssistantChat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm MoroCare's virtual doctor assistant. Please describe your symptoms or ask a health-related question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://morocarebackend-production.up.railway.app/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: userMessage.text }),
      });

      const data = await response.json();

      const botMessage = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "An error occurred. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#155B5F] text-center">
        AI Medical Assistant
      </h1>
      <Card className="h-[500px] flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-[#96C1B9] text-white ml-auto text-right"
                    : "bg-[#F0F4F4] text-gray-800 mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex p-4 border-t items-center gap-2">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading}
            className="bg-[#155B5F] text-white hover:bg-[#0F4A4D]"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send"}
          </Button>
        </div>
      </Card>

    </section>
  );
}

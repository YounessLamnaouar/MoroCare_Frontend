import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TeleconsultationRoom() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const roomId = params.get("room") || "morocare-default";

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-[#155B5F]">Teleconsultation Room</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Room ID: {roomId}</p>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="text-[#155B5F] border-[#155B5F] hover:bg-[#155B5F] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <iframe
            src={`https://meet.jit.si/${roomId}?config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`}
            allow="camera; microphone; fullscreen; display-capture"
            style={{ width: "100%", height: "calc(100vh - 200px)", border: "none" }}
            title="Teleconsultation Room"
          />
        </CardContent>
      </Card>
    </div>
  );
}

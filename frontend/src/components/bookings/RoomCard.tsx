import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { RoomFixture } from "@/lib/fixtures/campus";

type RoomCardProps = {
  room: RoomFixture;
  onRequest: (room: RoomFixture) => void;
};

export function RoomCard({ room, onRequest }: RoomCardProps) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">{room.name}</h3>
          <p className="text-sm text-muted-foreground">
            {room.floor} · {room.capacity} seats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            label={room.conflict ? "Time clash" : room.available ? "Available" : "Unavailable"}
            tone={room.conflict ? "danger" : room.available ? "success" : "warning"}
          />
          <Button type="button" disabled={!room.available && !room.conflict} onClick={() => onRequest(room)}>
            Request booking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

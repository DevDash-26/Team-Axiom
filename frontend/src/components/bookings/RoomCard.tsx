"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { ResourceRead } from "@/types";

type RoomCardProps = {
  room: ResourceRead;
  onRequest: (room: ResourceRead) => void;
};

export function RoomCard({ room, onRequest }: RoomCardProps) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">{room.name}</h3>
          <p className="text-sm text-muted-foreground">
            {room.floor ?? room.location} · {room.capacity} seats · {room.kind === "SPORTS" ? "Sports" : "Classroom"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            label={room.available ? "Available" : "Time clash"}
            tone={room.available ? "success" : "danger"}
          />
          <Button type="button" disabled={!room.available} onClick={() => onRequest(room)}>
            Request booking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

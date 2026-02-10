import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "../../components/ui/Button";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "available" | "pending" | "confirmed";
};

type Props = {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
};

const MeetingCalendar: React.FC<Props> = ({ events, setEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Add availability slot
  const handleSelect = (info: any) => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: "Available Slot",
      start: info.startStr,
      end: info.endStr,
      status: "available",
    };

    setEvents((prev) => [...prev, newEvent]);
  };

  // Click event
  const handleEventClick = (info: any) => {
    const event = events.find((e) => e.id === info.event.id);
    if (event) setSelectedEvent(event);
  };

  // Accept meeting
  const acceptMeeting = () => {
    if (!selectedEvent) return;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id
          ? { ...e, title: "Confirmed Meeting", status: "confirmed" }
          : e
      )
    );

    setSelectedEvent(null);
  };

  // Decline meeting
  const declineMeeting = () => {
    if (!selectedEvent) return;

    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  // Delete slot
  const deleteSlot = () => {
    if (!selectedEvent) return;

    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        select={handleSelect}
        eventClick={handleEventClick}
        height="70vh"
        events={events.map((event) => ({
          ...event,
          backgroundColor:
            event.status === "available"
              ? "#22c55e"
              : event.status === "pending"
              ? "#facc15"
              : "#2563eb",
        }))}
      />

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg overflow-hidden">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                Meeting Action
              </h2>

              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-600 hover:text-gray-900 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                What do you want to do with this slot?
              </p>

              <div className="flex gap-3">
                <Button className="w-full" onClick={acceptMeeting}>
                  Accept
                </Button>

                <Button variant="error" className="w-full" onClick={declineMeeting}>
                  Decline
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={deleteSlot}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCalendar;

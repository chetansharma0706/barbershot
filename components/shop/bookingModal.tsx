"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Armchair, User, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopId?: string;
};

type chair = {
  id: string;
  name: string;
  imgUrl?: string;
  isAvailable: boolean;
}



const supabase = createClient();

/* ----------------------- Helpers ----------------------- */

const getNextDays = (count: number) => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    days.push({
      label: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      display: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      dateObj: d,
    });
  }
  return days;
};

const generateSlots = (
  date: Date | null,
  chairId: string | null,
  booked: any[],
  startHour = 10,
  endHour = 20,
  interval = 45
) => {
  if (!date || !chairId) return [];

  const slots: string[] = [];
  const now = new Date();

  const cursor = new Date(date);
  cursor.setHours(startHour, 0, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);

  while (cursor < end) {
    const slotTs = cursor.getTime();

    const isPast =
      date.toDateString() === now.toDateString() && slotTs <= now.getTime();

    const isBooked = booked.some((b) => {
      return (
        b.station_id === chairId &&
        Math.abs(new Date(b.start_time).getTime() - slotTs) < 60_000
      );
    });

    if (!isPast && !isBooked) {
      slots.push(
        cursor.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }

    cursor.setMinutes(cursor.getMinutes() + interval);
  }

  return slots;
};

/* ----------------------- Component ----------------------- */

export default function BookingModal({
  isOpen,
  onClose,
  shopName,
  shopId,
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [dates] = useState(getNextDays(4));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<string | null>(null);

  const [chairs, setChairs] = useState<chair[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  const resetState = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedChair(null);
    setBookedSlots([]);
  };

  useEffect(() => {
    console.log("BookingModal useEffect triggered:", { isOpen, shopId });
    if (!isOpen || !shopId) return;

    const fetchData = async () => {
      setLoading(true);

      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 4);

      const { data: booked } = await supabase.rpc("get_booked_slots", {
        target_shop_id: shopId,
        query_start_time: start.toISOString(),
        query_end_time: end.toISOString(),
      });

      const { data: stationData } = await supabase
        .from("stations")
        .select("id, name, station_image_url, is_active")
        .eq("shop_id", shopId).filter("is_active", "eq", true);

      const chairsData = stationData?.map((s) => ({
        id: s.id,
        name: s.name,
        imgUrl: s.station_image_url || undefined,
        isAvailable: s.is_active,
      })) || [];



      console.log("Fetched booked slots:", booked);
      console.log("Fetched stations:", chairsData);
      setBookedSlots(booked || []);
      setChairs(chairsData);
      setSelectedDate(getNextDays(4)[0].dateObj);
      setLoading(false);
    };

    fetchData();

    const stored = localStorage.getItem("barberAppUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserName(parsed.name);
      setUserPhone(parsed.phone);
      setIsReturningUser(true);
    }
  }, [isOpen, shopId]);

  const availableSlots = generateSlots(
    selectedDate,
    selectedChair,
    bookedSlots
  );

  const finalizeBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedChair) return;

    const [h, m] = selectedTime.split(":").map(Number);

    const startTime = new Date(selectedDate);
    startTime.setHours(h, m, 0, 0);

    const endTime = new Date(startTime.getTime() + 45 * 60000);

    const { error } = await supabase.from("appointments").insert({
      barber_shop_id: shopId,
      station_id: selectedChair,
      customer_name: userName,
      customer_phone: userPhone,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "booked",
    });

    if (error) {
      alert(error.message);
      return;
    }

    setStep(3);
  };

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => {
          resetState();
          onClose();
        }}
      />

      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="p-6 flex justify-between border-b">
          <div>
            <h3 className="text-xl font-bold">
              {step === 2 ? "Your Details" : "Book Appointment"}
            </h3>
            <p className="text-sm text-muted-foreground">at {shopName}</p>
          </div>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
          >
            <X />
          </button>
        </div>
        {loading ? (
          <div className="p-6 flex justify-center items-center max-h-[70vh]">
            <div className="flex items-center justify-center min-h-screen bg-transparent">
              <div
                role="status"
                aria-label="Loading"
                className="w-10 h-10 rounded-full border-4 border-gold border-t-black animate-spin"
                style={{ animationDuration: "0.6s" }}
              />
            </div>
          </div>
        ) : (

          <>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {step === 1 && (
                <>
                  {/* Chairs */}
                  <div>
                    <label className="text-sm font-medium">Select Chair</label>
                    {/* Changed grid-cols-3 to grid-cols-2 for a cleaner, wider layout */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {chairs.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedChair(c.id);
                            setSelectedTime(null);
                          }}
                          // Flex container for side-by-side layout
                          className={`
          relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all
          ${selectedChair === c.id
                              ? "border-primary bg-primary/10 ring-1 ring-primary"
                              : "border-border bg-card hover:border-primary/50"
                            }
        `}
                        >
                          {/* 1. Image/Icon Container (Avatar style) */}
                          <div className={`
          w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/50
          ${selectedChair === c.id ? "bg-primary/20" : "bg-muted"}
        `}>
                            {c.imgUrl ? (
                              <img
                                src={c.imgUrl}
                                alt={c.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              // Fallback icon if no image
                              <Armchair className={`w-5 h-5 ${selectedChair === c.id ? "text-primary" : "text-muted-foreground"}`} />
                            )}
                          </div>

                          {/* 2. Text Info */}
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate">{c.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Barber</span>
                          </div>

                          {/* 3. Checkmark (Visible only when selected) */}
                          {selectedChair === c.id && (
                            <div className="absolute top-2 right-2 text-primary">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className={!selectedChair ? "opacity-50 pointer-events-none" : ""}>
                    <label className="text-sm font-medium">Select Date</label>
                    <div className="flex gap-3 mt-2 overflow-x-auto">
                      {dates.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedDate(d.dateObj);
                            setSelectedTime(null);
                          }}
                          className={`w-20 h-20 rounded-xl border ${selectedDate?.toDateString() ===
                            d.dateObj.toDateString()
                            ? "border-primary bg-primary/10"
                            : "border-border"
                            }`}
                        >
                          <div className="text-xs">{d.label}</div>
                          <div className="font-bold">{d.display}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slots */}
                  <div
                    className={
                      !selectedChair || !selectedDate
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  >
                    <label className="text-sm font-medium">Available Slots</label>
                    <div className="grid grid-cols-4 gap-3 mt-2">
                      {availableSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-2 rounded-lg border ${selectedTime === t
                            ? "border-primary bg-primary/10"
                            : "border-border"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    localStorage.setItem(
                      "barberAppUser",
                      JSON.stringify({ name: userName, phone: userPhone })
                    );
                    finalizeBooking();
                  }}
                  className="space-y-4"
                >
                  <input
                    required
                    placeholder="Full Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full h-10 border rounded-lg px-3"
                  />
                  <input
                    required
                    placeholder="Phone"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full h-10 border rounded-lg px-3"
                  />
                </form>
              )}

              {step === 3 && (
                <div className="text-center py-10">
                  <CheckCircle2 className="mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-bold">Booking Confirmed</h3>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              {step === 1 && (
                <Button
                  className="w-full"
                  disabled={!selectedDate || !selectedTime || !selectedChair}
                  onClick={() =>
                    isReturningUser ? finalizeBooking() : setStep(2)
                  }
                >
                  Confirm Booking
                  {loading && <span className="ml-2 loading-spinner" />}
                </Button>
              )}
              {step === 2 && (
                <Button className="w-full" onClick={finalizeBooking}>
                  Complete Booking
                  {loading && <span className="ml-2 loading-spinner" />}
                </Button>
              )}
              {step === 3 && (
                <Button className="w-full" variant="outline" onClick={onClose}>
                  Done
                  {loading && <span className="ml-2 loading-spinner" />}
                </Button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

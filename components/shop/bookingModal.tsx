"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, CheckCircle2, Armchair, Loader2, Clock, CalendarX2 } from "lucide-react";
import { Button } from "../ui/button";
import { fetchBookingModalData } from "@/app/actions/fetchBookingData";
import { bookAppointment } from "@/app/actions/bookAppointment";
import { createClient } from "@/utils/supabase/client";

/* ====================== TYPES ====================== */

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopId?: string;
  userId?: string;
};

type Chair = {
  id: string;
  name: string;
  imgUrl?: string;
  isAvailable: boolean;
};

type BookedSlot = {
  station_id: string;
  start_time: string;
  duration?: number; // Optional, defaults to standard duration if missing
};

type DateOption = {
  label: string;
  display: string;
  dateObj: Date;
};

type UserInfo = {
  name: string;
  phone: string;
};

type DaySchedule = {
  open: string;
  close: string;
  isOpen: boolean;
};

type BusinessHours = {
  [key: string]: DaySchedule;
};

/* ====================== CONSTANTS ====================== */

const BOOKING_DURATION_MINUTES = 45; // Standard duration for new bookings
const DAYS_TO_SHOW = 4;

/* ====================== UTILITIES ====================== */

const getNextDays = (count: number): DateOption[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    return {
      label:
        i === 0
          ? "Today"
          : date.toLocaleDateString("en-US", { weekday: "short" }),
      display: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
      dateObj: date,
    };
  });
};

// Helper to check if two time ranges overlap
const doIntervalsOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) => {
  return startA < endB && endA > startB;
};

const generateAvailableSlots = (
  date: Date | null,
  chairId: string | null,
  bookedSlots: BookedSlot[],
  businessHours: BusinessHours | null,
  intervalMinutes: number = BOOKING_DURATION_MINUTES
): string[] => {
  if (!date || !chairId || !businessHours) return [];

  // 1. Determine the day of the week (monday, tuesday...)
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const schedule = businessHours[dayName];

  // 2. If no schedule found or shop is closed, return empty
  if (!schedule || !schedule.isOpen) return [];

  const slots: string[] = [];
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  // 3. Parse Open and Close times (e.g., "09:00" -> 9, 0)
  const [openHour, openMinute] = schedule.open.split(":").map(Number);
  const [closeHour, closeMinute] = schedule.close.split(":").map(Number);

  // 4. Set boundaries for the day
  const cursor = new Date(date);
  cursor.setHours(openHour, openMinute, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(closeHour, closeMinute, 0, 0);

  // 5. Filter bookings for this specific chair only
  const chairBookings = bookedSlots.filter((slot) => slot.station_id === chairId);

  // 6. Generate slots
  while (cursor < endTime) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + intervalMinutes * 60000);

    // Stop if the slot extends beyond closing time
    if (slotEnd > endTime) break;

    // Check 1: Is in the past?
    if (isToday && slotStart.getTime() <= now.getTime()) {
      cursor.setMinutes(cursor.getMinutes() + intervalMinutes);
      continue;
    }

    // Check 2: Overlap detection (The Fix)
    const isBlocked = chairBookings.some((booking) => {
      const bookingStart = new Date(booking.start_time);
      // Use booking duration if exists, otherwise default
      const bookingDuration = booking.duration || intervalMinutes; 
      const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60000);

      return doIntervalsOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
    });

    if (!isBlocked) {
      slots.push(
        slotStart.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // 24h format for cleaner UI logic, can format to 12h in render if needed
        })
      );
    }

    // Move to next interval
    cursor.setMinutes(cursor.getMinutes() + intervalMinutes);
  }

  return slots;
};

const getStoredUserInfo = async (userId: string): Promise<UserInfo | null> => {
  try {
    const supabase = createClient();
    const { data: customer } = await supabase
      .from("customers")
      .select("auth_user_id, name, phone")
      .eq("auth_user_id", userId)
      .single();

    if (customer && customer.name && customer.phone) {
      return {
        name: customer.name,
        phone: customer.phone,
      };
    }
    return null;
  } catch (error) {
    console.error("Error reading user info:", error);
    return null;
  }
};

const saveUserInfo = async (userId: string, userInfo: UserInfo) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .upsert(
      {
        auth_user_id: userId,
        name: userInfo.name.trim(),
        phone: userInfo.phone.trim(),
      },
      { onConflict: "auth_user_id" }
    )
    .select()
    .single();

  if (error) console.error("customer save failed", error);
};

/* ====================== SUB-COMPONENTS ====================== */

const BookingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Chair Skeleton */}
    <div>
      <div className="h-4 w-24 bg-muted rounded mb-3" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 border border-border/50 rounded-xl"
          >
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-3 w-12 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Date Skeleton */}
    <div>
      <div className="h-4 w-24 bg-muted rounded mb-3" />
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-20 h-20 rounded-xl border border-border/50 bg-muted/20"
          />
        ))}
      </div>
    </div>
    {/* Time Slots Skeleton */}
    <div>
      <div className="h-4 w-32 bg-muted rounded mb-3" />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-10 bg-muted/50 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

/* ====================== COMPONENT ====================== */

export default function BookingModal({
  isOpen,
  onClose,
  shopName,
  shopId,
  userId,
}: BookingModalProps) {
  // State management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<string | null>(null);

  const [chairs, setChairs] = useState<Chair[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  // Memoized values
  const dates = useMemo(() => getNextDays(DAYS_TO_SHOW), []);

  // Determine if the currently selected date is open/closed
  const isShopClosedOnSelectedDate = useMemo(() => {
    if (!selectedDate || !businessHours) return false;
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const schedule = businessHours[dayName];
    return schedule ? !schedule.isOpen : false;
  }, [selectedDate, businessHours]);

  const availableSlots = useMemo(
    () => generateAvailableSlots(selectedDate, selectedChair, bookedSlots, businessHours),
    [selectedDate, selectedChair, bookedSlots, businessHours]
  );

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedChair(null);
    setBookedSlots([]);
    setBusinessHours(null);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const fetchBookingData = useCallback(async () => {
    if (!shopId) return;

    setLoading(true);

    try {
      // NOTE: Ensure your fetchBookingModalData action returns 'business_hours' mapped to 'businessHours' or matches naming
      const data = await fetchBookingModalData(shopId);
      
      const { bookedSlots, stations, businessHours } = data as any; // Cast to any to safely access business_hours if type is strict

      const transformedChairs: Chair[] = stations.map((station: any) => ({
        id: station.id,
        name: station.name,
        imgUrl: station.station_image_url || undefined,
        isAvailable: station.is_active,
      }));

      setBookedSlots(bookedSlots || []);
      setChairs(transformedChairs);
      setBusinessHours(businessHours);
      console.log("Fetched business hours:", businessHours);

      if (dates.length > 0) {
        setSelectedDate(dates[0].dateObj);
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
    } finally {
      setLoading(false);
    }
  }, [shopId, dates]);

  const loadUserInfo = useCallback(async () => {
    const userInfo = await getStoredUserInfo(userId || "");
    if (userInfo) {
      setUserName(userInfo.name);
      setUserPhone(userInfo.phone);
      setIsReturningUser(true);
    }
  }, [userId]);

  const handleChairSelect = useCallback((chairId: string) => {
    setSelectedChair(chairId);
    setSelectedTime(null);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  }, []);

  const finalizeBooking = useCallback(async () => {
    if (!selectedDate || !selectedTime || !selectedChair || !shopId) {
      return;
    }

    setSubmitting(true);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(
        startTime.getTime() + BOOKING_DURATION_MINUTES * 60000
      );

      await bookAppointment({
        shopId,
        stationId: selectedChair,
        customerName: userName,
        customerPhone: userPhone,
        startTimeISO: startTime.toISOString(),
        endTimeISO: endTime.toISOString(),
      });
      if (userId) {
        saveUserInfo(userId, { name: userName.trim(), phone: userPhone.trim() });
      }

      setStep(3);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      alert(error.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedDate, selectedTime, selectedChair, shopId, userName, userPhone]);

  const handleUserDetailsSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      finalizeBooking();
    },
    [finalizeBooking]
  );

  const handlePrimaryAction = useCallback(() => {
    if (step === 1) {
      if (isReturningUser) {
        finalizeBooking();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      finalizeBooking();
    } else {
      handleClose();
    }
  }, [step, isReturningUser, finalizeBooking, handleClose]);

  useEffect(() => {
    if (isOpen && shopId) {
      fetchBookingData();
      loadUserInfo();
    }
  }, [isOpen, shopId, fetchBookingData, loadUserInfo]);

  if (!isOpen) return null;

  const isStep1Valid = selectedDate && selectedTime && selectedChair;
  const isStep2Valid = userName.trim() && userPhone.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 flex justify-between items-start border-b">
          <div>
            <h3 className="text-xl font-bold">
              {step === 2
                ? "Your Details"
                : step === 3
                ? "Confirmation"
                : "Book Appointment"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">at {shopName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <BookingSkeleton />
          ) : (
            <>
              {/* Step 1: Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Chair Selection */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block">
                      Select Barber
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {chairs.map((chair) => (
                        <button
                          key={chair.id}
                          onClick={() => handleChairSelect(chair.id)}
                          className={`
                            relative flex items-center gap-3 p-3 rounded-xl border text-left
                            transition-all duration-200
                            ${
                              selectedChair === chair.id
                                ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                                : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                            }
                          `}
                        >
                          <div
                            className={`
                              w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center
                              overflow-hidden border-2 transition-colors
                              ${
                                selectedChair === chair.id
                                  ? "border-primary bg-primary/20"
                                  : "border-border bg-muted"
                              }
                            `}
                          >
                            {chair.imgUrl ? (
                              <img
                                src={chair.imgUrl}
                                alt={chair.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Armchair
                                className={`w-6 h-6 ${
                                  selectedChair === chair.id
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {chair.name}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Barber
                            </p>
                          </div>
                          {selectedChair === chair.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div
                    className={`transition-opacity ${
                      !selectedChair ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <label className="text-sm font-semibold mb-3 block">
                      Select Date
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {dates.map((dateOption, index) => {
                        // Check if this specific date is closed in business hours
                        const dayName = dateOption.dateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                        const isDayClosed = businessHours && businessHours[dayName] ? !businessHours[dayName].isOpen : false;

                        return (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(dateOption.dateObj)}
                            disabled={!selectedChair}
                            className={`
                              flex-shrink-0 w-20 h-20 rounded-xl border transition-all duration-200
                              ${
                                selectedDate?.toDateString() ===
                                dateOption.dateObj.toDateString()
                                  ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                              }
                            `}
                          >
                            <div className="text-xs text-muted-foreground">
                              {dateOption.label}
                            </div>
                            <div className="font-bold mt-1">
                              {dateOption.display}
                            </div>
                            {isDayClosed && (
                               <div className="text-[10px] text-red-500 font-medium mt-1">Closed</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div
                    className={`transition-opacity ${
                      !selectedChair || !selectedDate
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <label className="text-sm font-semibold mb-3 block">
                      Available Time Slots
                    </label>

                    {/* Logic to handle CLOSED shops vs NO SLOTS */}
                    {isShopClosedOnSelectedDate ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/20">
                          <CalendarX2 className="w-8 h-8 mb-2 opacity-50" />
                          <p className="font-medium">Shop Closed</p>
                          <p className="text-xs">The shop is not open on this day.</p>
                        </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((timeSlot) => (
                          <button
                            key={timeSlot}
                            onClick={() => setSelectedTime(timeSlot)}
                            disabled={!selectedChair || !selectedDate}
                            className={`
                              py-2.5 rounded-lg border text-sm font-medium transition-all duration-200
                              ${
                                selectedTime === timeSlot
                                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/50"
                                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                              }
                            `}
                          >
                            {timeSlot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">
                          No available slots
                        </p>
                        <p className="text-xs mt-1">
                          Try selecting another date or barber
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: User Details */}
              {step === 2 && (
                <form onSubmit={handleUserDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter your full name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full h-11 border border-border rounded-lg px-4 bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="Enter your phone number"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full h-11 border border-border rounded-lg px-4 bg-background
                      focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                  </div>
                </form>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Booking Confirmed!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your appointment has been successfully booked
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Chair:</span>
                      <span className="font-medium">
                        {chairs.find((c) => c.id === selectedChair)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-muted/20">
          <Button
            className="w-full h-11 font-medium"
            disabled={
              loading ||
              (step === 1 && (!isStep1Valid || isShopClosedOnSelectedDate)) || // Disable if shop is closed
              (step === 2 && !isStep2Valid) ||
              submitting
            }
            onClick={handlePrimaryAction}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : step === 1 ? (
              isShopClosedOnSelectedDate ? "Shop Closed" : "Continue to Booking"
            ) : step === 2 ? (
              "Complete Booking"
            ) : (
              "Close"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
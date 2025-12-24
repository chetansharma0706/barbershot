"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, CheckCircle2, Armchair, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { fetchBookingModalData } from "@/app/actions/fetchBookingData";
import { bookAppointment } from "@/app/actions/bookAppointment";

/* ====================== TYPES ====================== */

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopId?: string;
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

/* ====================== CONSTANTS ====================== */

const BOOKING_DURATION_MINUTES = 45;
const SHOP_START_HOUR = 10;
const SHOP_END_HOUR = 20;
const DAYS_TO_SHOW = 4;
const LOCAL_STORAGE_KEY = "barberAppUser";

/* ====================== UTILITIES ====================== */

/**
 * Generates the next N days starting from today
 */
const getNextDays = (count: number): DateOption[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    return {
      label: i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" }),
      display: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      dateObj: date,
    };
  });
};

/**
 * Generates available time slots for a given date and chair
 * Filters out past times and already booked slots
 */
const generateAvailableSlots = (
  date: Date | null,
  chairId: string | null,
  bookedSlots: BookedSlot[],
  startHour: number = SHOP_START_HOUR,
  endHour: number = SHOP_END_HOUR,
  intervalMinutes: number = BOOKING_DURATION_MINUTES
): string[] => {
  if (!date || !chairId) return [];

  const slots: string[] = [];
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const cursor = new Date(date);
  cursor.setHours(startHour, 0, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, 0, 0, 0);

  // Create a Set of booked timestamps for O(1) lookup
  const bookedTimestamps = new Set(
    bookedSlots
      .filter((slot) => slot.station_id === chairId)
      .map((slot) => Math.floor(new Date(slot.start_time).getTime() / 60000))
  );

  while (cursor < endTime) {
    const slotTimestamp = cursor.getTime();
    const slotMinutes = Math.floor(slotTimestamp / 60000);

    // Skip if slot is in the past
    if (isToday && slotTimestamp <= now.getTime()) {
      cursor.setMinutes(cursor.getMinutes() + intervalMinutes);
      continue;
    }

    // Skip if slot is already booked
    if (!bookedTimestamps.has(slotMinutes)) {
      slots.push(
        cursor.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }

    cursor.setMinutes(cursor.getMinutes() + intervalMinutes);
  }

  return slots;
};

/**
 * Retrieves user info from localStorage
 */
const getStoredUserInfo = (): UserInfo | null => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error reading user info from localStorage:", error);
    return null;
  }
};

/**
 * Saves user info to localStorage
 */
const saveUserInfo = (userInfo: UserInfo): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error("Error saving user info to localStorage:", error);
  }
};

/* ====================== COMPONENT ====================== */

export default function BookingModal({
  isOpen,
  onClose,
  shopName,
  shopId,
}: BookingModalProps) {
  // State management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<string | null>(null);

  const [chairs, setChairs] = useState<Chair[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  // Memoized values
  const dates = useMemo(() => getNextDays(DAYS_TO_SHOW), []);
  
  // const supabase = useMemo(() => createClient(), []);

  const availableSlots = useMemo(
    () => generateAvailableSlots(selectedDate, selectedChair, bookedSlots),
    [selectedDate, selectedChair, bookedSlots]
  );

  /**
   * Reset all state when modal closes
   */
  const resetState = useCallback(() => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedChair(null);
    setBookedSlots([]);
    setSubmitting(false);
  }, []);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  /**
   * Fetch chairs and booked slots from Supabase
   */
  const fetchBookingData = useCallback(async () => {
    if (!shopId) return;

    setLoading(true);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + DAYS_TO_SHOW);

      // Parallel data fetching for better performance
     fetchBookingModalData(shopId).then(({ bookedSlots, stations }) => {
   
       const transformedChairs: Chair[] =
         stations.map((station) => ({
           id: station.id,
           name: station.name,
           imgUrl: station.station_image_url || undefined,
           isAvailable: station.is_active,
         })) || [];

         console.log("Fetched booked slots:", bookedSlots);
         console.log("Fetched stations:", stations);
         console.log("Transformed chairs:", transformedChairs);
     
       setBookedSlots(bookedSlots || []);
       setChairs(transformedChairs);
  });

      // Transform station data
      
      // Auto-select first date
      if (dates.length > 0) {
        setSelectedDate(dates[0].dateObj);
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
      alert("Failed to load booking information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [shopId, dates]);

  /**
   * Load user info from localStorage
   */
  const loadUserInfo = useCallback(() => {
    const userInfo = getStoredUserInfo();
    if (userInfo) {
      setUserName(userInfo.name);
      setUserPhone(userInfo.phone);
      setIsReturningUser(true);
    }
  }, []);

  /**
   * Handle chair selection
   */
  const handleChairSelect = useCallback((chairId: string) => {
    setSelectedChair(chairId);
    setSelectedTime(null); // Reset time when chair changes
  }, []);

  /**
   * Handle date selection
   */
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  }, []);

  /**
   * Finalize and submit booking
   */
  const finalizeBooking = useCallback(async () => {
    if (!selectedDate || !selectedTime || !selectedChair || !shopId) {
      return;
    }

    setSubmitting(true);

    try {
      // Parse selected time
      const [hours, minutes] = selectedTime.split(":").map(Number);

      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime.getTime() + BOOKING_DURATION_MINUTES * 60000);

      // Insert booking
      await bookAppointment({
      shopId,
      stationId: selectedChair,
      customerName: userName,
      customerPhone: userPhone,
      startTimeISO: startTime.toISOString(),
      endTimeISO: endTime.toISOString(),
    });
      // Save user info for next time
      saveUserInfo({ name: userName.trim(), phone: userPhone.trim() });

      setStep(3);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      alert(error.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedDate,
    selectedTime,
    selectedChair,
    shopId,
    userName,
    userPhone,
  ]);

  /**
   * Handle form submission for user details
   */
  const handleUserDetailsSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      finalizeBooking();
    },
    [finalizeBooking]
  );

  /**
   * Handle primary action button click
   */
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

  // Effects
  useEffect(() => {
    if (isOpen && shopId) {
      fetchBookingData();
      loadUserInfo();
    }
  }, [isOpen, shopId, fetchBookingData, loadUserInfo]);

  // Don't render if not open
  if (!isOpen) return null;

  const isStep1Valid = selectedDate && selectedTime && selectedChair;
  const isStep2Valid = userName.trim() && userPhone.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 flex justify-between items-start border-b">
          <div>
            <h3 className="text-xl font-bold">
              {step === 2 ? "Your Details" : step === 3 ? "Confirmation" : "Book Appointment"}
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

        {/* Loading State */}
        {loading ? (
          <div className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading availability...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Step 1: Selection */}
              {step === 1 && (
                <>
                  {/* Chair Selection */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block">
                      Select Chair
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
                          {/* Avatar */}
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

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {chair.name}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Barber
                            </p>
                          </div>

                          {/* Checkmark */}
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
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {dates.map((dateOption, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(dateOption.dateObj)}
                          disabled={!selectedChair}
                          className={`
                            flex-shrink-0 w-20 h-20 rounded-xl border transition-all duration-200
                            ${
                              selectedDate?.toDateString() === dateOption.dateObj.toDateString()
                                ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                                : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                            }
                          `}
                        >
                          <div className="text-xs text-muted-foreground">
                            {dateOption.label}
                          </div>
                          <div className="font-bold mt-1">{dateOption.display}</div>
                        </button>
                      ))}
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
                    {availableSlots.length > 0 ? (
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
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No available slots for this date</p>
                        <p className="text-xs mt-1">Please select another date</p>
                      </div>
                    )}
                  </div>
                </>
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
                  <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your appointment has been successfully booked
                  </p>
                  
                  {/* Booking Details */}
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
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-muted/20">
              <Button
                className="w-full h-11 font-medium"
                disabled={
                  (step === 1 && !isStep1Valid) ||
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
                  "Continue to Booking"
                ) : step === 2 ? (
                  "Complete Booking"
                ) : (
                  "Close"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { X, CheckCircle2, Armchair, User, Phone } from "lucide-react"; 
import { Button } from "../ui/button";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
};

// --- Mock Data: Booked Slots ---
const bookedSlots = [
  { date: "22 Dec", time: "11:30", chairId: 1 }, 
  { date: "22 Dec", time: "14:30", chairId: 1 }, 
  { date: "23 Dec", time: "10:00", chairId: 2 }, 
];

// --- Helper: Generate next 4 days ---
const getNextDays = (daysCount: number) => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: 'short' });
    const dateStr = date.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
    days.push({ day: dayName, date: dateStr, fullDate: date });
  }
  return days;
};

// --- Helper: Generate Time Slots ---
const generateTimeSlots = (
  startHour: number, 
  endHour: number, 
  intervalMinutes: number, 
  selectedDateStr: string | null,
  selectedChairId: number | null
) => {
  const slots = [];
  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0); 
  const endTime = new Date();
  endTime.setHours(endHour, 0, 0, 0); 
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
  const isToday = selectedDateStr === todayStr;

  while (currentTime < endTime) {
    const timeString = currentTime.toLocaleTimeString("en-US", { 
      hour: '2-digit', minute: '2-digit', hour12: false 
    });

    let isPast = false;
    if (isToday) {
      const slotTimeDate = new Date();
      slotTimeDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
      if (slotTimeDate < now) isPast = true;
    }

    const isBooked = bookedSlots.some(
      (booking) => 
        booking.date === selectedDateStr && 
        booking.time === timeString && 
        booking.chairId === selectedChairId
    );

    if (!isPast && !isBooked) slots.push(timeString);
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }
  return slots;
};

const BookingModal = ({ isOpen, onClose, shopName }: BookingModalProps) => {
  // Steps: 1 = Selection, 2 = User Info (if new), 3 = Success
  const [step, setStep] = useState(1);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<number | null>(null);

  // User Info State
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  const chairs = [
    { id: 1, name: "Chair 1", barber: "Alex" },
    { id: 2, name: "Chair 2", barber: "Sam" },
    { id: 3, name: "Chair 3", barber: "Mike" },
  ];

  const dates = getNextDays(4); 
  const availableTimes = generateTimeSlots(10, 20, 45, selectedDate, selectedChair);

  // --- Effect: Handle Modal Open/Close & Local Storage ---
  useEffect(() => {
    if (isOpen) {
      // Check Local Storage
      const storedData = localStorage.getItem("barberAppUser");
      if (storedData) {
        const { name, phone } = JSON.parse(storedData);
        setUserName(name);
        setUserPhone(phone);
        setIsReturningUser(true);
      } else {
        setIsReturningUser(false);
        setUserName("");
        setUserPhone("");
      }

      // Default Date Selection
      if (!selectedDate && dates.length > 0) {
        setSelectedDate(dates[0].date);
      }
    } else {
      // Reset State on Close
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedChair(null);
    }
  }, [isOpen]); // Removed 'dates' from dependency to prevent loop

  // --- Handlers ---

  const handleInitialConfirm = () => {
    if (isReturningUser) {
      // If user exists, skip to booking success
      finalizeBooking();
    } else {
      // If new user, go to Info Form
      setStep(2);
    }
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to Local Storage
    localStorage.setItem("barberAppUser", JSON.stringify({ name: userName, phone: userPhone }));
    setIsReturningUser(true);
    finalizeBooking();
  };

  const finalizeBooking = () => {
    // Here you would typically send data to backend (Supabase)
    // payload: { name: userName, phone: userPhone, date: selectedDate, time: selectedTime, chair: selectedChair }
    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-glass-bg">
          <div>
            <h3 className="text-xl font-bold text-gold">
              {step === 2 ? "Your Details" : "Book Appointment"}
            </h3>
            <p className="text-sm text-muted-foreground">at {shopName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: Selection */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Chair Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">Select Chair / Barber</label>
                <div className="grid grid-cols-3 gap-3">
                  {chairs.map((chair) => (
                    <button
                      key={chair.id}
                      onClick={() => {
                        setSelectedChair(chair.id);
                        setSelectedTime(null);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        selectedChair === chair.id
                          ? "bg-gold/10 border-gold text-gold"
                          : "border-border bg-input text-muted-foreground hover:border-gold/50"
                      }`}
                    >
                      <Armchair className={`w-6 h-6 mb-2 ${selectedChair === chair.id ? "text-gold" : "text-muted-foreground"}`} />
                      <span className="text-xs font-semibold">{chair.barber}</span>
                      <span className="text-[10px] opacity-70">{chair.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className={`${!selectedChair ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all duration-300`}>
                <label className="text-sm font-medium mb-3 block text-foreground">Select Date</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(d.date);
                        setSelectedTime(null);
                      }}
                      className={`flex-shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedDate === d.date 
                          ? "bg-gold border-gold text-black shadow-[var(--shadow-gold)]" 
                          : "border-border bg-input text-muted-foreground hover:border-gold/50"
                      }`}
                    >
                      <span className="text-xs font-medium uppercase">{d.day}</span>
                      <span className="text-lg font-bold">{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className={`${!selectedChair || !selectedDate ? 'opacity-50 pointer-events-none' : ''} transition-all duration-300`}>
                <label className="text-sm font-medium mb-3 block text-foreground">Available Slots</label>
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {availableTimes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                          selectedTime === t
                            ? "bg-gold/10 border-gold text-gold"
                            : "bg-input border-transparent text-foreground hover:border-border"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                   <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        {selectedChair && selectedDate 
                          ? "No available slots for this date." 
                          : "Select a chair & date to view slots."}
                      </p>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: User Details Form (New User Only) */}
          {step === 2 && (
            <form id="user-info-form" onSubmit={handleUserInfoSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-gold/10 border border-gold/20 p-4 rounded-xl mb-4">
                <p className="text-sm text-gold font-medium text-center">
                  Almost there! We just need your details to confirm the booking.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="Enter phone number"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Reserved for <strong className="text-foreground">{userName}</strong><br/>
                with <strong className="text-foreground">{chairs.find(c => c.id === selectedChair)?.barber}</strong><br/>
                on <strong className="text-foreground">{selectedDate}</strong> at <strong className="text-foreground">{selectedTime}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-glass-bg">
          {step === 1 && (
            <Button 
              className="w-full mobile-button" 
              onClick={handleInitialConfirm}
              disabled={!selectedDate || !selectedTime || !selectedChair}
            >
              Confirm Booking
            </Button>
          )}

          {step === 2 && (
            <Button 
              type="submit"
              form="user-info-form"
              className="w-full mobile-button" 
              disabled={!userName || userPhone.length < 10}
            >
              Complete Booking
            </Button>
          )}

          {step === 3 && (
            <Button className="w-full mobile-button" variant="outline" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
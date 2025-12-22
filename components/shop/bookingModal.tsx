import { useState, useEffect } from "react";
import { X, CheckCircle2, Armchair } from "lucide-react"; 
import { Button } from "../ui/button";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
};

// --- Mock Data: Booked Slots (Replace this with data from Supabase) ---
// Structure: Date string matching the UI format, Time string, and Chair ID
const bookedSlots = [
  { date: "22 Dec", time: "11:30", chairId: 1 }, // Chair 1 is booked at 11:30
  { date: "22 Dec", time: "14:30", chairId: 1 }, 
  { date: "23 Dec", time: "10:00", chairId: 2 }, // Chair 2 is booked tomorrow
];

// --- Helper: Generate next 4 days ---
const getNextDays = (daysCount: number) => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Format: "Tue", "14 Oct"
    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: 'short' });
    const dateStr = date.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
    
    days.push({ day: dayName, date: dateStr, fullDate: date });
  }
  return days;
};

// --- Helper: Generate Time Slots based on Working Hours & Availability ---
const generateTimeSlots = (
  startHour: number, 
  endHour: number, 
  intervalMinutes: number, 
  selectedDateStr: string | null,
  selectedChairId: number | null
) => {
  const slots = [];
  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0); // Start at opening time

  const endTime = new Date();
  endTime.setHours(endHour, 0, 0, 0); // End at closing time

  // Get current real time to filter out past slots for "Today"
  const now = new Date();
  
  // Check if the selected date in UI matches today's date
  const todayStr = now.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
  const isToday = selectedDateStr === todayStr;

  while (currentTime < endTime) {
    const timeString = currentTime.toLocaleTimeString("en-US", { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });

    // 1. Check if slot is in the past (only applies if selected date is Today)
    let isPast = false;
    if (isToday) {
      const slotTimeDate = new Date();
      slotTimeDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
      if (slotTimeDate < now) {
        isPast = true;
      }
    }

    // 2. Check if slot is already booked
    // We filter based on: Same Date AND Same Time AND Same Chair
    const isBooked = bookedSlots.some(
      (booking) => 
        booking.date === selectedDateStr && 
        booking.time === timeString &&
        booking.chairId === selectedChairId
    );

    // Only add to available slots if it's NOT in the past and NOT booked
    if (!isPast && !isBooked) {
      slots.push(timeString);
    }

    // Increment time by interval
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }
  return slots;
};

const BookingModal = ({ isOpen, onClose, shopName }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<number | null>(null);

  const chairs = [
    { id: 1, name: "Chair 1", barber: "Alex" },
    { id: 2, name: "Chair 2", barber: "Sam" },
    { id: 3, name: "Chair 3", barber: "Mike" },
  ];

  // Dynamic Date Data
  const dates = getNextDays(4); 
  
  // Dynamic Time Data (Recalculates when Date or Chair changes)
  const availableTimes = generateTimeSlots(
    10, // Open 10:00
    20, // Close 20:00
    45, // 45 min slots
    selectedDate, 
    selectedChair
  );

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedChair(null);
    }
  }, [isOpen]);

  // Auto-select "Today" when modal opens
  useEffect(() => {
    if (isOpen && !selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].date);
    }
  }, [isOpen, dates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-glass-bg">
          <div>
            <h3 className="text-xl font-bold text-gold">Book Appointment</h3>
            <p className="text-sm text-muted-foreground">at {shopName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-6">
              
              {/* 1. Chair Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">Select Chair / Barber</label>
                <div className="grid grid-cols-3 gap-3">
                  {chairs.map((chair) => (
                    <button
                      key={chair.id}
                      onClick={() => {
                        setSelectedChair(chair.id);
                        setSelectedTime(null); // Reset time if chair changes (availablity might differ)
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

              {/* 2. Date Selection (Disabled until chair is picked) */}
              <div className={`${!selectedChair ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all duration-300`}>
                <label className="text-sm font-medium mb-3 block text-foreground">Select Date</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(d.date);
                        setSelectedTime(null); // Reset time if date changes
                      }}
                      className={`flex-shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedDate === d.date 
                          ? "bg-gold border-gold text-black shadow-[var(--shadow-gold)]" 
                          : "border-border bg-input text-muted-foreground hover:border-gold/50"
                      }`}
                    >
                      <span className="text-xs font-medium uppercase">{d.day}</span>
                      <span className="text-xl font-bold">{d.date.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Time Selection (Disabled until date is picked) */}
              <div className={`${!selectedChair || !selectedDate ? 'opacity-50 pointer-events-none' : ''} transition-all duration-300`}>
                <label className="text-sm font-medium mb-3 block text-foreground">
                  Available Slots 
                </label>
                
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
                  // Empty State for NO SLOTS
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
          ) : (
            // Success State
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Reserved with <strong className="text-foreground">{chairs.find(c => c.id === selectedChair)?.barber}</strong><br/>
                on <strong className="text-foreground">{selectedDate}</strong> at <strong className="text-foreground">{selectedTime}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-glass-bg">
          {step === 1 ? (
            <Button 
              className="w-full mobile-button" 
              onClick={() => { if(selectedDate && selectedTime && selectedChair) setStep(2); }}
              disabled={!selectedDate || !selectedTime || !selectedChair}
            >
              Confirm Booking
            </Button>
          ) : (
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
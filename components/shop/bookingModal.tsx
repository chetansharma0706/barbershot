import { useState, useEffect } from "react";
import { X, CheckCircle2, Armchair, User, Phone } from "lucide-react"; 
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";
 // Ensure you import your supabase client

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopId: string | undefined; // Added shopId prop to query DB
};

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

// --- Updated Helper: Generate Time Slots ---
// Now accepts `realBookedSlots` which is the data from Supabase
const generateTimeSlots = (
  startHour: number, 
  endHour: number, 
  intervalMinutes: number, 
  selectedDateStr: string | null,
  selectedChairId: string | null, // Changed to string to match UUID
  realBookedSlots: any[] 
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

    // Check against Real Database Data
    const isBooked = realBookedSlots.some((booking) => {
      // Create a date object from the DB timestamp
      const dbDate = new Date(booking.start_time);
      
      // Format DB date to match UI format (e.g. "22 Dec")
      const dbDateStr = dbDate.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
      
      // Format DB time to match UI format (e.g. "14:30")
      // Note: Ensure timezones match (UTC vs Local)
      const dbTimeStr = dbDate.toLocaleTimeString("en-US", { 
        hour: '2-digit', minute: '2-digit', hour12: false 
      });

      return (
        dbDateStr === selectedDateStr && 
        dbTimeStr === timeString && 
        booking.station_id === selectedChairId
      );
    });

    if (!isPast && !isBooked) slots.push(timeString);
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }
  return slots;
};

const BookingModal = ({ isOpen, onClose, shopName, shopId}: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedChair, setSelectedChair] = useState<string | null>(null); // UUID string

  // State for Real Data
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [chairs, setChairs] = useState<any[]>([]); // You should also fetch these from DB
  const [loading, setLoading] = useState(false);

  // User Info State
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isReturningUser, setIsReturningUser] = useState(false);
  const supabase = createClient();

  // --- 1. Fetch Data when Modal Opens ---
  useEffect(() => {
    if (isOpen && shopId != undefined) {
      const fetchAvailability = async () => {
        setLoading(true);
        const today = new Date();
        const fourDaysLater = new Date();
        fourDaysLater.setDate(today.getDate() + 4);

        // Call the RPC function created in Step 1
        const { data, error } = await supabase.rpc('get_booked_slots', {
          target_shop_id: shopId,
          query_start_time: today.toISOString(),
          query_end_time: fourDaysLater.toISOString(),
        });

        if (error) console.error("Error fetching slots:", error);
        else setBookedSlots(data || []);

        // Fetch Stations (Chairs)
        const { data: stationData } = await supabase
          .from('stations')
          .select('*')
          .eq('barber_shop_id', shopId);
          
        if(stationData) setChairs(stationData);
        
        setLoading(false);
      };

      fetchAvailability();

      // Local Storage Check
      const storedData = localStorage.getItem("barberAppUser");
      if (storedData) {
        const { name, phone } = JSON.parse(storedData);
        setUserName(name);
        setUserPhone(phone);
        setIsReturningUser(true);
      }
      
      // Default Date
      const nextDays = getNextDays(4);
      if (!selectedDate && nextDays.length > 0) {
        setSelectedDate(nextDays[0].date);
      }
    } else {
      // Reset
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedChair(null);
      setBookedSlots([]);
    }
  }, [isOpen, shopId]);

  const dates = getNextDays(4); 
  
  // Pass the fetched `bookedSlots` to the generator
  const availableTimes = generateTimeSlots(
    10, 20, 45, 
    selectedDate, 
    selectedChair, 
    bookedSlots
  );

  // --- Handlers ---
  const handleInitialConfirm = () => {
    if (isReturningUser) finalizeBooking();
    else setStep(2);
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("barberAppUser", JSON.stringify({ name: userName, phone: userPhone }));
    setIsReturningUser(true);
    finalizeBooking();
  };

  const finalizeBooking = async () => {
    // 1. Calculate correct timestamp
    // You need to combine the selectedDate ("14 Oct") and selectedTime ("14:30")
    // into a proper ISO string for the database.
    const currentYear = new Date().getFullYear();
    const startTimeStr = `${selectedDate} ${currentYear} ${selectedTime}`; 
    const startTime = new Date(startTimeStr); 
    
    // Calculate End Time (assuming 45 min duration)
    const endTime = new Date(startTime.getTime() + 45 * 60000);

    // 2. Insert into Supabase
    const { error } = await supabase.from('appointments').insert({
      barber_shop_id: shopId,
      station_id: selectedChair,
      customer_name: userName,
      customer_phone: userPhone,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'booked'
    });

    if (error) {
      alert("Booking failed! " + error.message);
      return;
    }

    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card border-t sm:border border-border sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-glass-bg">
          <div>
            <h3 className="text-xl font-bold text-gold">{step === 2 ? "Your Details" : "Book Appointment"}</h3>
            <p className="text-sm text-muted-foreground">at {shopName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Chair Selection (Mapped from DB data now) */}
              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">Select Chair / Barber</label>
                {loading ? <p>Loading chairs...</p> : (
                  <div className="grid grid-cols-3 gap-3">
                    {chairs.map((chair) => (
                      <button
                        key={chair.id}
                        onClick={() => { setSelectedChair(chair.id); setSelectedTime(null); }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          selectedChair === chair.id
                            ? "bg-gold/10 border-gold text-gold"
                            : "border-border bg-input text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        <Armchair className={`w-6 h-6 mb-2 ${selectedChair === chair.id ? "text-gold" : "text-muted-foreground"}`} />
                        <span className="text-xs font-semibold">{chair.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className={`${!selectedChair ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all duration-300`}>
                <label className="text-sm font-medium mb-3 block text-foreground">Select Date</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(d.date); setSelectedTime(null); }}
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
                {loading ? <p className="text-center text-sm py-4">Checking availability...</p> : availableTimes.length > 0 ? (
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
                        {selectedChair && selectedDate ? "No available slots." : "Select a chair & date."}
                      </p>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2 (Form) and Step 3 (Success) logic remains the same... */}
          {step === 2 && (
             <form id="user-info-form" onSubmit={handleUserInfoSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
               {/* ... (Same input fields as before) ... */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50" placeholder="Enter Name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input type="tel" required value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50" placeholder="Enter Phone" />
                    </div>
                  </div>
                </div>
             </form>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-16 h-16 text-gold" />
              <h3 className="text-2xl font-bold text-foreground">Booking Confirmed!</h3>
              <p className="text-muted-foreground">See you on {selectedDate} at {selectedTime}</p>
            </div>
          )}
        </div>

        {/* Footer Buttons (Same logic) */}
        <div className="p-6 border-t border-border bg-glass-bg">
          {step === 1 && (
            <Button className="w-full mobile-button" onClick={handleInitialConfirm} disabled={!selectedDate || !selectedTime || !selectedChair}>
              Confirm Booking
            </Button>
          )}
          {step === 2 && (
            <Button type="submit" form="user-info-form" className="w-full mobile-button" disabled={!userName || userPhone.length < 10}>
              Complete Booking
            </Button>
          )}
          {step === 3 && (
            <Button className="w-full mobile-button" variant="outline" onClick={onClose}>Done</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
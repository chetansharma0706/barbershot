import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
};


const BookingModal = ({ isOpen, onClose, shopName }:BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!isOpen) return null;

  // Mock Dates
  const dates = [
    { day: "Today", date: "14 Oct" },
    { day: "Tue", date: "15 Oct" },
    { day: "Wed", date: "16 Oct" },
    { day: "Thu", date: "17 Oct" },
    { day: "Fri", date: "18 Oct" },
  ];

  // Mock Times
  const times = ["10:00", "11:00", "13:30", "14:15", "15:00", "16:45", "18:00"];

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
              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">Select Date</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(d.date)}
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

              {/* Time Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block text-foreground">Available Slots</label>
                <div className="grid grid-cols-4 gap-3">
                  {times.map((t) => (
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
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                You are booked for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-glass-bg">
          {step === 1 ? (
            <Button 
              className="w-full mobile-button" 
              onClick={() => { if(selectedDate && selectedTime) setStep(2); }}
              disabled={!selectedDate || !selectedTime}
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
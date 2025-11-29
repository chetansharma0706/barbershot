"use client";
import React, { useState } from 'react';
import { 
  MapPin, 
  Upload, 
  Clock, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Scissors, 
  Camera, 
  Map as MapIcon,
  Search,
  CalendarOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddressSuggestion, CardProps, InputProps, LabelProps, ScheduleDay, ShopFormData, TextareaProps, ValidationErrors, WeekDay } from '@/types';
import { Selectbb } from '@/components/ui/select';

/* --- TYPES & INTERFACES --- */

/* --- UI COMPONENTS (ADAPTED TO NEW GLOBAL THEME) --- */

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`glass-card p-0 mb-6 overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`px-5 py-4 border-b border-[hsl(var(--border))] flex items-center gap-3 ${className}`}>
    {children}
  </div>
);

const Label: React.FC<LabelProps> = ({ children, required, className = "" }) => (
  <label className={`block text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider font-dm-sans ${className}`}>
    {children} {required && <span className="text-[hsl(var(--primary))]">*</span>}
  </label>
);

const Input: React.FC<InputProps> = ({ error, className = "", ...props }) => (
  <div className="relative">
    <input
      className={`glass-input w-full text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none
        ${error ? 'border-red-500/50' : ''} 
        ${className}`}
      {...props}
    />
    {error && <span className="text-[10px] text-red-400 mt-1 absolute -bottom-4 left-1 font-medium">{error}</span>}
  </div>
);

const Textarea: React.FC<TextareaProps> = ({ error, className = "", ...props }) => (
  <div className="relative">
    <textarea
      className={`glass-input min-h-[100px] w-full p-3 h-auto text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none resize-none
        ${error ? 'border-red-500/50' : ''} 
        ${className}`}
      {...props}
    />
    {error && <span className="text-[10px] text-red-400 mt-1 absolute -bottom-4 left-1 font-medium">{error}</span>}
  </div>
);



// const Button: React.FC<ButtonProps> = ({ variant = "primary", size = "default", loading, children, className = "", ...props }) => {
//   // Mapping variants to the new CSS classes
//   const baseStyles = "mobile-button inline-flex items-center justify-center transition-all duration-300 disabled:pointer-events-none disabled:opacity-50";
  
//   const variants = {
//     primary: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--gold-light))] gold-glow font-bold",
//     outline: "border border-[hsl(var(--input))] bg-transparent hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
//     ghost: "hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
//     destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
//   };

//   const sizes = {
//     default: "", // Size handled by .mobile-button class
//     sm: "h-10 text-xs",
//     icon: "w-12 h-12 p-0",
//   };

//   return (
//     <button 
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
//       disabled={loading}
//       {...props}
//     >
//       {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
//       {children}
//     </button>
//   );
// };

// --- MOCK DATA ---
const MOCK_ADDRESSES: AddressSuggestion[] = [
  { label: "Shop 4, Phoenix Mall, Lower Parel", city: "Mumbai", state: "Maharashtra", zip: "400013" },
  { label: "12, MG Road, Indiranagar", city: "Bengaluru", state: "Karnataka", zip: "560008" },
  { label: "Plot 45, Jubilee Hills", city: "Hyderabad", state: "Telangana", zip: "500033" },
  { label: "Sector 18, Noida Market", city: "Noida", state: "Uttar Pradesh", zip: "201301" },
  { label: "Connaught Place, Inner Circle", city: "New Delhi", state: "Delhi", zip: "110001" },
  { label: "Koramangala 5th Block", city: "Bengaluru", state: "Karnataka", zip: "560034" },
  { label: "Viman Nagar, Datta Mandir Road", city: "Pune", state: "Maharashtra", zip: "411014" },
];

const DAYS_OF_WEEK: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// --- MAIN APPLICATION ---

export default function BarberShopSetup({userid}: {userid: string }) {
  // --- STATE ---
  const [loading, setLoading] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [activeHourType, setActiveHourType] = useState<'daily' | 'weekend' | 'custom'>('daily');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [expandedCustomHours, setExpandedCustomHours] = useState<boolean>(false);
  const [weeklyOff, setWeeklyOff] = useState<string>("None");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<ShopFormData>({
    user_id: userid,
    shop_name: "",
    shop_description: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: "",
    longitude: "",
    business_hours: {
      type: 'daily',
      details: { start: "09:00", end: "20:00" } 
    },
    cover_image_url: "", 
    logo_url: ""        
  });


  
  
  const [customSchedule, setCustomSchedule] = useState<Record<WeekDay, ScheduleDay>>(
    DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { isOpen: true, start: "09:00", end: "20:00" }
    }), {} as Record<WeekDay, ScheduleDay>)
  );


  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "address") {
      if (value.length > 2) {
        const filtered = MOCK_ADDRESSES.filter(item => 
          item.label.toLowerCase().includes(value.toLowerCase()) || 
          item.city.toLowerCase().includes(value.toLowerCase())
        );
        setAddressSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.label,
      city: suggestion.city,
      state: suggestion.state,
      zip_code: suggestion.zip
    }));
    setShowSuggestions(false);
    setErrors(prev => ({ ...prev, address: null, city: null, state: null }));
  };

  const handleLocationDetect = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setLocationLoading(false);
          setErrors(prev => ({ ...prev, latitude: null, longitude: null }));
        },
        (error) => {
          console.error("Geo Error:", error);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
      alert("Geolocation not supported. Please enter manually.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'logo') => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const fieldName = type === 'cover' ? 'cover_image_url' : 'logo_url';
        setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScheduleToggle = (day: WeekDay) => {
    setCustomSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }));
  };

  const handleScheduleTime = (day: WeekDay, field: 'start' | 'end', value: string) => {
    setCustomSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.shop_name.trim()) newErrors.shop_name = "Shop name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.latitude || !formData.longitude) newErrors.location = "Location coordinates are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setLoading(true);
      let finalBusinessHours: any = {};
      if (activeHourType === 'custom') {
        finalBusinessHours = customSchedule;
      } else {
        finalBusinessHours = {
          type: activeHourType,
          ...formData.business_hours.details,
          weekly_holiday: weeklyOff
        };
      }
      const finalPayload = { ...formData, business_hours: finalBusinessHours };
      setTimeout(() => {
        console.log("FINAL SUBMISSION JSON:", JSON.stringify(finalPayload, null, 2));
        setLoading(false);
        alert("Setup Complete! Check console for JSON.");
      }, 1500);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pb-28 font-manrope selection:bg-[hsl(var(--primary))] selection:text-black" onClick={() => setShowSuggestions(false)}>

      {/* A. HEADER */}
      <header className="px-6 py-6 text-center bg-[hsl(var(--background))]/80 backdrop-blur-md sticky top-0 z-40 border-b border-[hsl(var(--border))]">
        <h1 className="text-3xl font-dm-sans font-bold text-[hsl(var(--foreground))] tracking-tight">
          Setup Your <span className="text-shimmer italic">Shop</span>
        </h1>
        <div className="w-16 h-1 bg-[hsl(var(--primary))] mx-auto mt-3 rounded-full opacity-80 shadow-[0_0_15px_hsla(42,100%,55%,0.5)]"></div>
      </header>

      <div className="max-w-[428px] mx-auto p-4 pt-6 space-y-2">
        
        {/* B. SHOP INFO */}
        <Card>
          <CardHeader>
            <Scissors className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-dm-sans font-bold tracking-wide text-[hsl(var(--foreground))]">Shop Details</h2>
          </CardHeader>
          <div className="p-5 space-y-6">
            <div>
              <Label required>Shop Name</Label>
              <Input 
                name="shop_name" 
                placeholder="e.g. Royal Cuts Barbershop" 
                value={formData.shop_name}
                onChange={handleInputChange}
                error={errors.shop_name}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                name="shop_description" 
                placeholder="Tell customers what makes your shop special..." 
                value={formData.shop_description}
                onChange={handleInputChange}
              />
            </div>

            <div className="relative">
              <Label required>Full Address</Label>
              <div className="relative">
                <Input 
                  name="address" 
                  placeholder="Start typing area (e.g. Indiranagar)" 
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  autoComplete="off"
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 glass-card border-[hsl(var(--border))] rounded-lg shadow-xl max-h-48 overflow-y-auto bg-[hsl(var(--card))]">
                    {addressSuggestions.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        className="px-4 py-3 text-sm border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--secondary))] cursor-pointer flex items-start gap-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAddress(suggestion);
                        }}
                      >
                        <MapPin className="w-4 h-4 text-[hsl(var(--primary))] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[hsl(var(--foreground))] font-medium">{suggestion.label}</div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">{suggestion.city}, {suggestion.state}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-2 flex items-center gap-1">
                <Search className="w-3 h-3" /> Auto-fills City & State
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>City</Label>
                <Input 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange}
                  error={errors.city}
                />
              </div>
              <div>
                <Label required>State</Label>
                <Input 
                  name="state" 
                  value={formData.state} 
                  onChange={handleInputChange}
                  error={errors.state}
                />
              </div>
            </div>

            <div>
              <Label>ZIP Code</Label>
              <Input 
                name="zip_code" 
                placeholder="e.g. 400050" 
                inputMode="numeric"
                value={formData.zip_code}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </Card>

        {/* C. LOCATION */}
        <Card>
          <CardHeader>
            <MapIcon className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-dm-sans font-bold tracking-wide text-[hsl(var(--foreground))]">Location</h2>
          </CardHeader>
          <div className="p-5 space-y-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed font-medium">
              We need your precise location so customers can find you on the map.
            </p>
            
            <Button 
              className="h-14 text-base w-full"
              onClick={handleLocationDetect}
              loading={locationLoading}
              type="button"
            >
              {!locationLoading && <MapPin className="mr-2 h-5 w-5" />}
              {formData.latitude ? "Update Location" : "Detect My Location"}
            </Button>

            {formData.latitude && (
              <div className="glass-input h-auto py-3 flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-full text-green-400">
                  <Check className="w-4 h-4" />
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  <div className="font-bold text-[hsl(var(--foreground))]">Location Verified</div>
                  {formData.latitude}, {formData.longitude}
                </div>
              </div>
            )}

            {/* Manual Fallback / Display */}
            <div className="grid grid-cols-2 gap-4 pt-2">
               <div>
                 <Label>Latitude</Label>
                 <Input 
                   name="latitude" 
                   value={formData.latitude} 
                   onChange={handleInputChange} 
                   placeholder="00.0000"
                 />
               </div>
               <div>
                 <Label>Longitude</Label>
                 <Input 
                   name="longitude" 
                   value={formData.longitude} 
                   onChange={handleInputChange} 
                   placeholder="00.0000"
                 />
               </div>
            </div>
            {errors.location && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-3 rounded-lg border border-red-900/20">
                <AlertCircle className="w-4 h-4" /> {errors.location}
              </div>
            )}
          </div>
        </Card>

        {/* D. BUSINESS HOURS */}
        <Card>
          <CardHeader>
            <Clock className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-dm-sans font-bold tracking-wide text-[hsl(var(--foreground))]">Business Hours</h2>
          </CardHeader>
          <div className="p-5 space-y-4">
            
            {/* Radio Group Custom Implementation */}
            <div className="space-y-3">
              {[
                { id: 'daily', label: '9:00 AM - 8:00 PM', sub: 'Standard hours' },
                { id: 'weekend', label: 'Weekend Special', sub: 'Extended hours Fri-Sun' },
                { id: 'custom', label: 'Custom Timing', sub: 'Set per day' }
              ].map((option) => (
                <div 
                  key={option.id}
                  onClick={() => {
                    setActiveHourType(option.id as 'daily' | 'weekend' | 'custom');
                    if(option.id === 'custom') setExpandedCustomHours(true);
                  }}
                  className={`relative flex items-center p-4 rounded-2xl border cursor-pointer transition-all duration-300
                    ${activeHourType === option.id 
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 shadow-[0_0_20px_hsla(42,100%,55%,0.1)]' 
                      : 'border-[hsl(var(--border))] bg-transparent hover:border-[hsl(var(--primary))]/50'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 transition-colors
                    ${activeHourType === option.id ? 'border-[hsl(var(--primary))]' : 'border-[hsl(var(--muted-foreground))]'}`}>
                    {activeHourType === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]" />}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${activeHourType === option.id ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{option.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Holiday Selector (Only for Presets) */}
            {activeHourType !== 'custom' && (
               <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] animate-in fade-in">
                 <Label>Weekly Holiday (Shop Closed)</Label>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[hsl(var(--secondary))] rounded-lg">
                      <CalendarOff className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <Selectbb 
                      value={weeklyOff}
                      onChange={(e) => setWeeklyOff(e.target.value)}
                      options={[
                        { value: 'None', label: 'None (Open 7 Days)' },
                        { value: 'Monday', label: 'Monday' },
                        { value: 'Tuesday', label: 'Tuesday' },
                        { value: 'Wednesday', label: 'Wednesday' },
                        { value: 'Thursday', label: 'Thursday' },
                        { value: 'Friday', label: 'Friday' },
                        { value: 'Saturday', label: 'Saturday' },
                        { value: 'Sunday', label: 'Sunday' },
                      ]}
                    />
                 </div>
                 <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-2 opacity-70">
                   Your shop will be marked as "Closed" automatically on this day.
                 </p>
               </div>
            )}

            {/* Custom Hours Expansion */}
            {activeHourType === 'custom' && (
              <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center" onClick={() => setExpandedCustomHours(!expandedCustomHours)}>
                  <span className="text-sm font-bold text-[hsl(var(--foreground))]">Set Weekly Schedule</span>
                  {expandedCustomHours ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {expandedCustomHours && DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="bg-[hsl(var(--secondary))] p-3 rounded-lg border border-[hsl(var(--border))]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[hsl(var(--foreground))] w-24">{day}</span>
                      <button 
                        type="button"
                        onClick={() => handleScheduleToggle(day)}
                        className={`text-xs px-2 py-1.5 font-semibold rounded-md transition-colors ${customSchedule[day].isOpen 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'}`}
                      >
                        {customSchedule[day].isOpen ? 'Open' : 'Closed'}
                      </button>
                    </div>
                    
                    {customSchedule[day].isOpen && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          type="time" 
                          className="h-10 text-xs py-1"
                          value={customSchedule[day].start}
                          onChange={(e) => handleScheduleTime(day, 'start', e.target.value)}
                        />
                        <span className="text-[hsl(var(--muted-foreground))]">-</span>
                        <Input 
                          type="time" 
                          className="h-10 text-xs py-1"
                          value={customSchedule[day].end}
                          onChange={(e) => handleScheduleTime(day, 'end', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* E. IMAGES */}
        <Card>
          <CardHeader>
            <Camera className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-dm-sans font-bold tracking-wide text-[hsl(var(--foreground))]">Branding</h2>
          </CardHeader>
          <div className="p-5 space-y-6">
            
            {/* Cover Photo */}
            <div>
              <Label>Cover Photo</Label>
              <div className="mt-2 group relative w-full aspect-video rounded-2xl border-2 border-dashed border-[hsl(var(--input))] hover:border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] flex flex-col items-center justify-center overflow-hidden transition-all duration-300">
                {formData.cover_image_url ? (
                  <>
                    <img src={formData.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-medium">Click to change</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-4">
                    <Upload className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors" />
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">Tap to upload cover</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <Label>Shop Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-[hsl(var(--input))] hover:border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] flex items-center justify-center overflow-hidden shrink-0 group transition-all duration-300 shadow-lg">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                  />
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  <p className="font-medium text-[hsl(var(--foreground))]">Recommended: Square PNG</p>
                  <p>Max size: 2MB</p>
                </div>
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* F. STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
        <div className="max-w-[428px] mx-auto">
          <Button 
            variant="primary" 
            className="shadow-2xl w-full py-4 cursor-pointer tracking-wide uppercase text-sm"
            onClick={handleSubmit}
            loading={loading}
          >
            Save & Continue
          </Button>
        </div>
      </div>

    </div>
  );
}
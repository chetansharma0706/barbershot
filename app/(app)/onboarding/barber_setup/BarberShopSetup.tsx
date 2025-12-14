"use client";
import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Upload,
  Clock,
  // Check, 
  // AlertCircle, 

  Scissors,
  Camera,
  // Map as MapIcon,
  Search,
  Globe,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddressSuggestion, CardProps, InputProps, LabelProps, ScheduleDay, ShopFormData, TextareaProps, ValidationErrors, WeekDay, BusinessHoursPayload } from '@/types';
import { createShop } from '@/app/actions/createShop';
import { toast } from 'sonner';
import { useImageKit } from '@/hooks/useImageKit';
import { Image } from '@imagekit/next';
import { useOnboarding } from '@/hooks/use-onboarding';
import { checkSubdomainAvailability } from '@/app/actions/check-subdomain';

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

export default function BarberShopSetup({ userid }: { userid: string }) {
  // --- STATE ---
  const [loading, setLoading] = useState<boolean>(false);
  // const [locationLoading, setLocationLoading] = useState<boolean>(false);
  // Single per-day schedule — no presets
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  // subdomain status check
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const logoUpload = useImageKit()
  const coverUpload = useImageKit()
  const { completeOnboarding } = useOnboarding();
  // console.log(logoUpload)

  // Form State
  const [formData, setFormData] = useState<ShopFormData>({
    user_id: userid,
    shop_name: "",
    shop_subdomain: "",
    shop_description: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: "",
    longitude: "",
    business_hours: {},
    cover_image_url: "",
    logo_url: "",
    cover_img: "",
    logo_img: "",
  });




  const [customSchedule, setCustomSchedule] = useState<Record<WeekDay, ScheduleDay>>(
    DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: {
        open: day === 'Saturday' || day === 'Sunday' ? (day === 'Saturday' ? '10:00' : '10:00') : '09:00',
        close: day === 'Saturday' || day === 'Sunday' ? '16:00' : '20:00',
        isOpen: day === 'Sunday' ? false : true
      }
    }), {} as Record<WeekDay, ScheduleDay>)
  );

  useEffect(() => {
    // guard: too short → don’t check
    if (formData.shop_subdomain.length < 3) {
      setSubdomainStatus("idle");
      return;
    }

    setSubdomainStatus("checking");

    const timer = setTimeout(() => {
      // IMPORTANT: wrap async logic in an IIFE
      (async () => {
        try {
          const result = await checkSubdomainAvailability(
            formData.shop_subdomain
          );

          if (!result.available) {
            setSubdomainStatus("taken");
            setErrors(prev => ({
              ...prev,
              shop_subdomain: "This URL is already taken",
            }));
          } else {
            setSubdomainStatus("available");
            setErrors(prev => ({
              ...prev,
              shop_subdomain: null,
            }));
          }
        } catch (err) {
          console.error("Subdomain check failed", err);
          setSubdomainStatus("idle");
        }
      })();
    }, 500); // debounce delay

    return () => clearTimeout(timer);
  }, [formData.shop_subdomain]);




  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    setFormData(prev => ({ ...prev, shop_subdomain: value }));
    setSubdomainStatus('idle');
    setErrors(prev => ({ ...prev, shop_subdomain: null }));
  };


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

  // const handleLocationDetect = () => {
  //   setLocationLoading(true);
  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setFormData(prev => ({
  //           ...prev,
  //           latitude: position.coords.latitude.toFixed(6),
  //           longitude: position.coords.longitude.toFixed(6)
  //         }));
  //         setLocationLoading(false);
  //         setErrors(prev => ({ ...prev, latitude: null, longitude: null }));
  //       },
  //       (error) => {
  //         console.error("Geo Error:", error);
  //         setLocationLoading(false);
  //       }
  //     );
  //   } else {
  //     setLocationLoading(false);
  //     alert("Geolocation not supported. Please enter manually.");
  //   }
  // };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'logo') => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (type === 'cover') {
        if (coverUpload.uploadState.uploadedFile) {
          await coverUpload.deleteFile(coverUpload.uploadState.uploadedFile.fileId);
        }
        const result = await coverUpload.uploadFile(file, { folder: `/barberbro/${formData.user_id}/shop-assets` });
        if (!result) {
          toast.error("Image upload failed. Please try again.");
        }
      } else {
        if (logoUpload.uploadState.uploadedFile) {
          await logoUpload.deleteFile(logoUpload.uploadState.uploadedFile.fileId);
        }
        const result = await logoUpload.uploadFile(file, { folder: `/barberbro/${formData.user_id}/shop-assets` });
        if (!result) {
          toast.error("Image upload failed. Please try again.");
        }
      }
    }
  }

  const handleScheduleToggle = (day: WeekDay) => {
    setCustomSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }));
  };

  const handleScheduleTime = (day: WeekDay, field: 'open' | 'close', value: string) => {
    setCustomSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.shop_name.trim()) newErrors.shop_name = "Shop name is required";
    if (!formData.shop_subdomain.trim()) newErrors.shop_subdomain = "Shop URL is required";
    if (subdomainStatus === 'taken') newErrors.shop_subdomain = "Shop URL is unavailable";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    // if (!formData.latitude || !formData.longitude) newErrors.location = "Location coordinates are required";
    // Validate schedule times
    DAYS_OF_WEEK.forEach(day => {
      const s = customSchedule[day];
      if (s.isOpen) {
        // check open/close format HH:MM
        const openOk = /^\d{2}:\d{2}$/.test(s.open);
        const closeOk = /^\d{2}:\d{2}$/.test(s.close);
        if (!openOk || !closeOk || s.open >= s.close) {
          newErrors.business_hours = `Invalid times for ${day}`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    // Convert UI schedule to DB format
    const finalBusinessHours: BusinessHoursPayload = DAYS_OF_WEEK.reduce(
      (acc, day) => ({
        ...acc,
        [day.toLowerCase()]: {
          open: customSchedule[day].open,
          close: customSchedule[day].close,
          isOpen: !!customSchedule[day].isOpen
        }
      }),
      {} as BusinessHoursPayload
    );

    try {
      const res = await createShop({
        shop_name: formData.shop_name,
        shop_subdomain: formData.shop_subdomain,
        shop_description: formData.shop_description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        business_hours: finalBusinessHours,
        cover_img: coverUpload.uploadState.uploadedFile?.url || "",
        logo_img: logoUpload.uploadState.uploadedFile?.url || ""
      });

      if (res.error) throw new Error(res.error);

      toast.success(res.message || "Shop created successfully!");
      await completeOnboarding("barber");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong during shop creation.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen pb-28 font-manrope selection:bg-[hsl(var(--primary))] selection:text-black" onClick={() => setShowSuggestions(false)}>

      {/* A. HEADER */}
      <header className="px-6 py-6 text-center bg-[hsl(var(--background))]/80 backdrop-blur-md sticky top-0 z-40 border-b border-[hsl(var(--border))]">
        <h1 className="text-3xl text-shimmer font-dm-sans font-bold text-[hsl(var(--foreground))] tracking-tight">
          Setup Your Shop
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

            {/* NEW FIELD: SHOP URL */}
            <div>
              <Label required>Shop URL</Label>
              <div className="relative">
               
                <Input
                  name="shop_subdomain"
                  placeholder="your-shop-name"
                  value={formData.shop_subdomain}
                  onChange={handleSubdomainChange}
                  error={errors.shop_subdomain}
                  className="pl-12 pr-40" // Corrected padding for alignment
                  autoComplete="off"
                />
                <div className="absolute right-4 top-1 text-sm font-medium text-[hsl(var(--muted-foreground))] pointer-events-none flex items-center h-full">
                  <span className="pb-0.5">.barberbro.shop</span>
                </div>
              </div>
              <div className="mt-2 min-h-[20px]">
                {subdomainStatus === 'checking' && (
                  <span className="text-xs text-[hsl(var(--primary))] flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                  </span>
                )}
                {subdomainStatus === 'available' && formData.shop_subdomain.length > 2 && (
                  <span className="text-xs text-green-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1">
                    <Check className="w-3.5 h-3.5" /> URL is available!
                  </span>
                )}
                {subdomainStatus === 'taken' && (
                  <span className="text-xs text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Taken. Try another.
                  </span>
                )}
              </div>
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
        {/* <Card>
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
        </Card> */}

        {/* D. BUSINESS HOURS */}
        <Card>
          <CardHeader>
            <Clock className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-dm-sans font-bold tracking-wide text-[hsl(var(--foreground))]">Business Hours</h2>
          </CardHeader>
          <div className="p-5 space-y-4">

            {/* Set Weekly Schedule (single flow: per day) */}
            <div className="mt-4 pt-2 border-t border-[hsl(var(--border))] animate-in fade-in">
              <div className="flex justify-between items-center mb-3">
                <Label>Set Weekly Schedule</Label>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Set open/close and toggle Open/Closed</div>
              </div>
            </div>

            {/* Weekly schedule (always shown) */}
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-4 animate-in fade-in slide-in-from-top-2 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[hsl(var(--foreground))]">Set Weekly Schedule</span>
              </div>

              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="bg-[hsl(var(--secondary))] p-3 rounded-lg border border-[hsl(var(--border))]">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <span className="text-sm font-bold text-[hsl(var(--foreground))] flex-shrink-0 min-w-[72px]">{day}</span>
                    <button
                      type="button"
                      onClick={() => handleScheduleToggle(day)}
                      className={`text-xs px-2 py-1 font-semibold rounded-md transition-colors ${customSchedule[day].isOpen
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'}`}
                    >
                      {customSchedule[day].isOpen ? 'Open' : 'Closed'}
                    </button>
                  </div>

                  {customSchedule[day].isOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          className="h-10 text-xs py-1 w-full min-w-[96px]"
                          value={customSchedule[day].open}
                          onChange={(e) => handleScheduleTime(day, 'open', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          className="h-10 text-xs py-1 w-full min-w-[96px]"
                          value={customSchedule[day].close}
                          onChange={(e) => handleScheduleTime(day, 'close', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                {coverUpload.uploadState.isUploading ? (
                  // STATE 1: Uploading
                  <div className="flex flex-col items-center justify-center p-4">
                    <span className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-2"></span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Uploading...</span>
                  </div>

                ) : coverUpload.uploadState.uploadedFile ? (
                  // STATE 2: Uploaded Image
                  <>
                    <Image
                      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                      src={coverUpload.uploadState.uploadedFile.filePath}
                      alt={coverUpload.uploadState.uploadedFile.name}
                      className="w-full h-full object-cover opacity-80"
                      fill
                    />

                    {/* Hover overlay for "Click to change" */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-medium">Click to change</p>
                    </div>
                  </>

                ) : (
                  // STATE 3: Idle (upload prompt)
                  <div className="flex flex-col items-center p-4">
                    <Upload className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors" />
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                      Tap to upload cover
                    </span>
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
                  {logoUpload.uploadState.isUploading ? (

                    <div className="flex items-center justify-center w-full h-full">
                      <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></span>
                    </div>

                  ) : logoUpload.uploadState.uploadedFile ? (

                    <Image
                      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                      src={logoUpload.uploadState.uploadedFile.filePath}
                      alt={logoUpload.uploadState.uploadedFile.name}
                      className="w-full h-full object-cover"
                      fill
                    />

                  ) : (

                    <Upload
                      className="w-6 h-6 text-[hsl(var(--muted-foreground))]
    group-hover:text-[hsl(var(--primary))]"
                    />

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
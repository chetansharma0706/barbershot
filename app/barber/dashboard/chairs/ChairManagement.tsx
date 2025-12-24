"use client";

import { Suspense, use, useEffect, useState } from "react";
import {
  Plus,
  User,
  Camera,
} from "lucide-react";
import { MdChair } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ResponsiveOverlay } from "@/components/OverlayModal";
import { useImageKit } from "@/hooks/useImageKit";
import { toast } from "sonner";
import { useDashboard } from "../dashboardContext";
import { createClient } from "@/utils/supabase/client";
import { InputProps } from "@/types";


type Chair = {
  id: string;
  barberName: string;
  isAvailable: boolean;
  image?: string;
};

type ValidationErrors = {
  [key: string]: string;
};


function ChairsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-16 w-16 rounded-full bg-muted" />
            <div className="h-5 w-16 rounded bg-muted" />
          </div>
          <div className="mt-4 h-4 w-24 rounded bg-muted" />
        </Card>
      ))}
    </div>
  )
}


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

export default function ChairsPage({ chairsPromise }: { chairsPromise: Promise<Chair[]> }) {
  const fetchedchairs = use(chairsPromise);
  const [chairs, setChairs] = useState<Chair[]>(fetchedchairs);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Chair | null>(null);
  const barberImgUpload = useImageKit();
  const { shop, profile } = useDashboard();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const supabase = createClient();

  const [form, setForm] = useState({
    barberName: "",
    isAvailable: true,
    image: "",
  });

  console.log("form Data: ", form);
  console.log("Chairs Data: ", chairs);




  useEffect(() => {
    if (editing) {
      setForm({
        barberName: editing.barberName,
        isAvailable: editing.isAvailable,
        image: editing.image || "",
      });
    } else {
      setForm({ barberName: "", isAvailable: true, image: "" });
    }
    setErrors({}); // Clear errors when modal opens/closes or editing changes
  }, [editing, open]);


  // add chair
  const addChair = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("stations")
        .insert({
          shop_id: shop.id,
          name: form.barberName,
          is_active: form.isAvailable,
          station_image_url: form.image,
        })
        .select()
        .single();

      if (error || !data) {
        throw error || new Error("Failed to add chair");
      }

      setChairs((prev) => [
        ...prev,
        {
          id: data.id,
          barberName: data.name,
          isAvailable: data.is_active,
          image: data.station_image_url,
        },
      ]);

      toast.success("Chair added successfully");
      setOpen(false);
    } catch (error) {
      console.error("Add chair error:", error);
      toast.error("Failed to add chair");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.barberName.trim()) {
      newErrors.barberName = "Barber name is required";
    }
    if (!editing && !form.image) {
      newErrors.image = "Please upload barber photo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateChair = async () => {
    if (!editing) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("stations")
        .update({
          name: form.barberName,
          is_active: form.isAvailable,
          station_image_url: form.image,
        })
        .eq("id", editing.id);

      if (error) {
        throw error;
      }

      // Update local state ONLY after DB success
      setChairs((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
              ...c,
              barberName: form.barberName,
              isAvailable: form.isAvailable,
              image: form.image,
            }
            : c
        )
      );

      toast.success("Chair updated successfully");
      setEditing(null);
      setOpen(false);
    } catch (error) {
      console.error("Update chair error:", error);
      toast.error("Failed to update chair");
    } finally {
      setLoading(false);
    }
  };

  const saveChair = async () => {
    // Use the validate function
    if (!validate()) {
      return;
    }

    if (editing) {
      await updateChair();
    } else {
      await addChair();
    }
  };

  const uploadBarberImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Delete old image if exists
      if (barberImgUpload.uploadState.uploadedFile) {
        await barberImgUpload.deleteFile(
          barberImgUpload.uploadState.uploadedFile.fileId
        );
      }

      const result = await barberImgUpload.uploadFile(file, {
        folder: `/barberbro/${profile.id}/shop-assets`,
      });

      if (!result?.url) {
        throw new Error("Upload failed");
      }

      // ✅ SINGLE SOURCE OF TRUTH
      setForm((prev) => ({
        ...prev,
        image: result.url,
      }));

      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed. Please try again.");
    }
  }


  return (
    <div className="min-h-screen bg-background pb-24 p-4">
      {/* Header */}
      {/* Content */}
      <main className="mx-auto max-w-5xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chairs</h1>
            <p className="text-sm text-muted-foreground">
              Manage barber stations
            </p>
          </div>
        </div>
        <Suspense fallback={<ChairsSkeleton />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {chairs.map((chair) => (


              <Card
                key={chair.id}
                onClick={() => {
                  setEditing(chair);
                  setOpen(true);
                }}
                className="
    relative
    cursor-pointer
    p-4
    overflow-hidden
    transition-all
    bg-gold/5
    hover:scale-[1.02]
    hover:border-primary/40
  "
              >
                {/* Background Chair Icon */}
                <MdChair
                  className="
      absolute
      -right-6
      -bottom-6
      h-24
      w-24
      text-gold/40
      pointer-events-none
    "
                />

                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted overflow-hidden ring-1 ring-border">
                    {chair.image ? (
                      <img
                        src={chair.image}
                        alt={chair.barberName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${chair.isAvailable
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-500"
                      }`}
                  >
                    {chair.isAvailable ? "Available" : "Busy"}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold tracking-wide">
                  {chair.barberName}
                </h3>
              </Card>

            ))}

            <button
              onClick={() => {
                setEditing(null);
                setOpen(true)}}
              className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed text-muted-foreground"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Chair
            </button>
          </div>
        </Suspense>
      </main>

      {/* Modal / Bottom Sheet */}
      <ResponsiveOverlay
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={editing ? "Edit Chair" : "Add Chair"}
      >
        <div className="space-y-5">
          {/* Image */}
          <div className="space-y-2">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed overflow-hidden relative">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={form.barberName}
                    className="w-full h-full aspect-square object-cover"
                  />
                ) : barberImgUpload.uploadState.isUploading ? (
                  <div className="animate-spin rounded-full border-4 border-b-transparent border-primary h-7 w-7"></div>
                ) : (
                  <Camera className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={uploadBarberImage}
              />
              {form.image ? (
                <span className="text-xs text-muted-foreground">
                  Change barber photo
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Add barber photo
                </span>
              )}
            </label>
            {errors.image && (
              <span className="text-[10px] text-red-400 mt-1 font-medium block text-center">
                {errors.image}
              </span>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Barber Name</Label>
            <Input
              value={form.barberName}
              onChange={(e) => {
                setForm({ ...form, barberName: e.target.value });
                setErrors((prev) => ({ ...prev, barberName: "" })); // Clear error on change
              }}
              placeholder="e.g. Rahul"
              error={errors.barberName}
            />
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm">Available for customers</span>
            <Switch
              checked={form.isAvailable}
              onCheckedChange={(v) => setForm({ ...form, isAvailable: v })}
            />
          </div>

          <Button className="w-full" onClick={saveChair} disabled={loading}>
            {editing ? "Save" : "Add"}
            {loading && (
              <div className="ml-2 animate-spin rounded-full border-2 border-b-transparent border-white h-4 w-4"></div>
            )}
          </Button>
         
        </div>
      </ResponsiveOverlay>
    </div>
  );
}
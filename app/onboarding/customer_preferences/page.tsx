"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";



type ContactMethod = "email" | "sms" | "phone";

type Preferences = {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    preferredContact: ContactMethod;
};

export default function CustomerPreferencesPage() {
    const router = useRouter();

    const [prefs, setPrefs] = useState<Preferences>({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: false,
        marketingEmails: false,
        preferredContact: "email",
    });

    const handleToggle = (key: keyof Omit<Preferences, "preferredContact">) => {
        setPrefs((p) => ({ ...p, [key]: !p[key] }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPrefs((p) => ({ ...p, preferredContact: e.target.value as ContactMethod }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Placeholder: replace with real API call
        try {
            // Example: await fetch("/api/preferences", { method: "POST", body: JSON.stringify(prefs) })
            console.log("Saving preferences:", prefs);

            // Navigate to next onboarding step
            router.push("/onboarding/summary");
        } catch (err) {
            console.error("Failed to save preferences", err);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
            <h1 style={{ marginBottom: "0.25rem" }}>Customer Preferences</h1>
            <p style={{ color: "#555", marginTop: 0 }}>Tell us how you'd like to receive updates and offers.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: "1.25rem", display: "grid", gap: "0.75rem" }}>
                <fieldset style={{ border: "1px solid #e6e6e6", padding: "1rem", borderRadius: 8 }}>
                    <legend style={{ fontWeight: 600 }}>Notifications</legend>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <input
                            type="checkbox"
                            checked={prefs.emailNotifications}
                            onChange={() => handleToggle("emailNotifications")}
                        />
                        Email notifications
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <input
                            type="checkbox"
                            checked={prefs.smsNotifications}
                            onChange={() => handleToggle("smsNotifications")}
                        />
                        SMS notifications
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <input
                            type="checkbox"
                            checked={prefs.pushNotifications}
                            onChange={() => handleToggle("pushNotifications")}
                        />
                        Push notifications
                    </label>
                </fieldset>

                <fieldset style={{ border: "1px solid #e6e6e6", padding: "1rem", borderRadius: 8 }}>
                    <legend style={{ fontWeight: 600 }}>Marketing</legend>

                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                            type="checkbox"
                            checked={prefs.marketingEmails}
                            onChange={() => handleToggle("marketingEmails")}
                        />
                        Receive marketing emails and offers
                    </label>
                </fieldset>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label>
                        Preferred contact method
                        <select value={prefs.preferredContact} onChange={handleContactChange} style={{ display: "block", marginTop: 8 }}>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="phone">Phone call</option>
                        </select>
                    </label>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button type="button" onClick={handleBack} style={{ padding: "0.5rem 0.75rem" }}>
                        Back
                    </button>
                    <button type="submit" style={{ padding: "0.5rem 0.75rem" }}>
                        Save & Continue
                    </button>
                </div>
            </form>
        </main>
    );
}
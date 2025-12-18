// app/(dashboard)/barber/page.tsx
import {
  TrendingUp,
  // Calendar,
  // Users,
  ChevronRight,
} from "lucide-react";

export default function BarberDashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto pb-28 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">

        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Welcome</h1>
            <p className="text-muted-foreground mt-1">
              Here is how your shop is doing today
            </p>
          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat label="Today Revenue" value="₹4,200" icon={TrendingUp} />
          {/* <Stat label="Appointments" value="8" icon={Calendar} />
          <Stat label="New Clients" value="3" icon={Users} /> */}
        </div>

        {/* Schedule */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today’s Schedule</h2>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View Calendar <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <Appointment
              name="Mike Ross"
              time="10:00 AM"
              service="Fade & Beard Trim"
            />
            <Appointment
              name="Harvey Specter"
              time="11:30 AM"
              service="Classic Cut"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: any) {
  return (
    <div className="
      bg-card
      text-card-foreground
      border border-border
      rounded-[var(--radius)]
      p-5
      shadow-[var(--shadow-subtle)]
    ">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-3xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function Appointment({ name, time, service }: any) {
  return (
    <div className="
      bg-card
      border border-border
      rounded-xl
      p-4
      flex items-center justify-between
      hover:bg-muted
      transition-[var(--transition-smooth)]
    ">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{service}</p>
      </div>
      <span className="text-sm font-medium">{time}</span>
    </div>
  );
}

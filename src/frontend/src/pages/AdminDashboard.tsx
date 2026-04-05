import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  LogOut,
  MoreVertical,
  RefreshCw,
  Settings,
  ShieldCheck,
  Stethoscope,
  Timer,
  Trash2,
  UserX,
  Users,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Appointment, backendInterface } from "../backend.d";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11)
    return `91${digits.slice(1)}`;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function waLink(phone: string, message: string): string {
  return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function apptDateTime(appt: Appointment): Date {
  const [y, m, d] = appt.date.split("-").map(Number);
  const [h, min] = appt.time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDateDisplay(dateStr: string): string {
  const today = todayStr();
  if (dateStr === today) return "Today";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── Unified Status Logic ────────────────────────────────────────────────────

type DisplayStatus =
  | "Booked"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "No-show"
  | "Rescheduled";

function getDisplayStatus(appt: Appointment): DisplayStatus {
  if (appt.status === "Cancelled") return "Cancelled";
  if (appt.status === "Rescheduled") return "Rescheduled";
  if (appt.status === "No-show") return "No-show";
  if (appt.status === "Confirmed") {
    if (appt.treatmentDone === true) return "Completed";
    if (appt.treatmentDone === false) return "In Progress";
    return "Confirmed";
  }
  // Pending → Booked
  return "Booked";
}

const STATUS_STYLES: Record<
  DisplayStatus,
  { bg: string; text: string; dot: string }
> = {
  Booked: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  Confirmed: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  "In Progress": {
    bg: "bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500",
  },
  Completed: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  Cancelled: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
  "No-show": { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-400" },
  Rescheduled: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    dot: "bg-purple-500",
  },
};

function StatusBadge({ status }: { status: DisplayStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Time Grouping ────────────────────────────────────────────────────────────

type TimeGroup =
  | "Ongoing"
  | "Upcoming"
  | "Later Today"
  | "Past Today"
  | "Future";

function getTimeGroup(appt: Appointment): TimeGroup {
  const today = todayStr();
  const now = new Date();
  const dt = apptDateTime(appt);
  const diffMin = (dt.getTime() - now.getTime()) / 60000;
  const displayStatus = getDisplayStatus(appt);

  if (appt.date > today) return "Future";
  if (appt.date < today) return "Past Today";

  // Same day
  if (displayStatus === "In Progress" && diffMin >= -30) return "Ongoing";
  if (
    (displayStatus === "Booked" || displayStatus === "Confirmed") &&
    diffMin > 0 &&
    diffMin <= 180
  )
    return "Upcoming";
  if (diffMin > 180) return "Later Today";
  return "Past Today";
}

const GROUP_ORDER: TimeGroup[] = [
  "Ongoing",
  "Upcoming",
  "Later Today",
  "Future",
  "Past Today",
];

const GROUP_STYLES: Record<
  TimeGroup,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  Ongoing: {
    label: "Ongoing",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: <Timer className="w-4 h-4" />,
  },
  Upcoming: {
    label: "Upcoming",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Clock className="w-4 h-4" />,
  },
  "Later Today": {
    label: "Later Today",
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: <Calendar className="w-4 h-4" />,
  },
  Future: {
    label: "Future Dates",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: <ChevronRight className="w-4 h-4" />,
  },
  "Past Today": {
    label: "Past",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
};

// ─── Actor hook for admin dashboard ─────────────────────────────────────────
// Creates actor directly without relying on identity/useActor chain
function useAdminActor() {
  const actorRef = useRef<backendInterface | null>(null);

  const actorQuery = useQuery<backendInterface>({
    queryKey: ["admin-actor"],
    queryFn: async () => {
      if (actorRef.current) return actorRef.current;
      const actor = await createActorWithConfig();
      // Try to initialize with admin token but don't fail if it errors
      try {
        const adminToken = getSecretParameter("caffeineAdminToken") || "";
        await actor._initializeAccessControlWithSecret(adminToken);
      } catch {
        // Silently ignore - actor still works for public calls
      }
      actorRef.current = actor;
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  return actorQuery.data ?? null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const actor = useAdminActor();
  const [filter, setFilter] = useState("All");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(
    null,
  );
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState("IN");
  const [showStripeKey, setShowStripeKey] = useState(false);

  const { data: stripeConfigured, refetch: refetchStripe } = useQuery<boolean>({
    queryKey: ["stripe-configured-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isStripeConfigured();
    },
    enabled: !!actor,
    staleTime: 30000,
  });

  const saveStripeConfig = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const countries = stripeCountries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      await (actor as any).setStripeConfiguration({
        secretKey: stripeKey,
        allowedCountries: countries,
      });
    },
    onSuccess: () => {
      toast.success("Stripe payment gateway configured successfully!");
      setStripeModalOpen(false);
      setStripeKey("");
      refetchStripe();
    },
    onError: () => {
      toast.error("Failed to save Stripe configuration. Please try again.");
    },
  });

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getAppointments();
      return result;
    },
    enabled: !!actor,
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 2000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      actor!.updateAppointmentStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const markTreatment = useMutation({
    mutationFn: ({ id, done }: { id: bigint; done: boolean }) =>
      actor!.markTreatmentDone(id, done),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const reschedule = useMutation({
    mutationFn: ({
      id,
      date,
      time,
    }: { id: bigint; date: string; time: string }) =>
      actor!.rescheduleAppointment(id, date, time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setRescheduleOpen(false);
      setRescheduleAppt(null);
    },
  });

  const deleteAppt = useMutation({
    mutationFn: (id: bigint) => actor!.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setDeleteConfirmId(null);
    },
  });

  function handleLogout() {
    localStorage.removeItem("mediverse_admin");
    navigate({ to: "/admin/login" });
  }

  async function handleConfirm(appt: Appointment) {
    window.open(
      waLink(
        appt.phone,
        `Your appointment at Mediverse Dental Clinic on ${appt.date} at ${appt.time} for ${appt.treatment} has been confirmed! We look forward to seeing you. 😊`,
      ),
      "_blank",
    );
    await updateStatus.mutateAsync({ id: appt.id, status: "Confirmed" });
    toast.success(`Confirmed appointment for ${appt.name}`);
  }

  async function handleCancel(appt: Appointment) {
    window.open(
      waLink(
        appt.phone,
        "Sorry, your appointment at Mediverse Dental Clinic has been cancelled. Please contact us to reschedule. 📞 +91 9142345153",
      ),
      "_blank",
    );
    await updateStatus.mutateAsync({ id: appt.id, status: "Cancelled" });
    toast.error(`Cancelled appointment for ${appt.name}`);
  }

  async function handleNoShow(appt: Appointment) {
    await updateStatus.mutateAsync({ id: appt.id, status: "No-show" });
    toast.warning(`Marked no-show for ${appt.name}`);
  }

  function openReschedule(appt: Appointment) {
    setRescheduleAppt(appt);
    setNewDate(appt.date);
    setNewTime(appt.time);
    setRescheduleOpen(true);
  }

  async function handleReschedule() {
    if (!rescheduleAppt || !newDate || !newTime) return;
    window.open(
      waLink(
        rescheduleAppt.phone,
        `Your appointment at Mediverse Dental Clinic has been rescheduled to ${newDate} at ${newTime}. See you then! 😊`,
      ),
      "_blank",
    );
    await reschedule.mutateAsync({
      id: rescheduleAppt.id,
      date: newDate,
      time: newTime,
    });
    await updateStatus.mutateAsync({
      id: rescheduleAppt.id,
      status: "Rescheduled",
    });
    toast.success(`Rescheduled appointment for ${rescheduleAppt.name}`);
  }

  async function handleDelete(id: bigint) {
    await deleteAppt.mutateAsync(id);
    toast.success("Appointment deleted");
  }

  async function handleStart(appt: Appointment) {
    await markTreatment.mutateAsync({ id: appt.id, done: false });
    toast.success(`Started treatment for ${appt.name}`);
  }

  async function handleComplete(appt: Appointment) {
    const patientName = appt.name || "Patient";
    window.open(
      waLink(
        appt.phone,
        `Hello ${patientName}, thank you for visiting Mediverse Dental Clinic. Your treatment has been successfully completed. We hope you are feeling better. For any follow-up, feel free to contact us.`,
      ),
      "_blank",
    );
    await markTreatment.mutateAsync({ id: appt.id, done: true });
    toast.success(`Completed treatment for ${appt.name}`);
  }

  // ─── Filter ────────────────────────────────────────────────────────────────
  const today = todayStr();
  const now = new Date();

  const filteredAppointments = appointments.filter((appt) => {
    const ds = getDisplayStatus(appt);
    if (filter === "All") return true;
    if (filter === "Today") return appt.date === today;
    if (filter === "Upcoming") {
      const dt = apptDateTime(appt);
      const diff = (dt.getTime() - now.getTime()) / 60000;
      return appt.date === today && diff > 0 && diff <= 180;
    }
    if (filter === "Completed") return ds === "Completed";
    if (filter === "Cancelled") return ds === "Cancelled" || ds === "No-show";
    return true;
  });

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const counts = {
    total: appointments.length,
    confirmed: appointments.filter((a) => getDisplayStatus(a) === "Confirmed")
      .length,
    inProgress: appointments.filter(
      (a) => getDisplayStatus(a) === "In Progress",
    ).length,
    completed: appointments.filter((a) => getDisplayStatus(a) === "Completed")
      .length,
    cancelled: appointments.filter((a) =>
      ["Cancelled", "No-show"].includes(getDisplayStatus(a)),
    ).length,
  };

  // ─── Next Appointment ───────────────────────────────────────────────────────
  const nextAppt =
    appointments
      .filter((a) => {
        const ds = getDisplayStatus(a);
        const dt = apptDateTime(a);
        return (ds === "Confirmed" || ds === "Booked") && dt > now;
      })
      .sort(
        (a, b) => apptDateTime(a).getTime() - apptDateTime(b).getTime(),
      )[0] ?? null;

  // ─── Grouped Cards ──────────────────────────────────────────────────────────
  const groupMap: Record<TimeGroup, Appointment[]> = {
    Ongoing: [],
    Upcoming: [],
    "Later Today": [],
    Future: [],
    "Past Today": [],
  };

  for (const appt of filteredAppointments) {
    groupMap[getTimeGroup(appt)].push(appt);
  }

  for (const key of GROUP_ORDER) {
    groupMap[key].sort(
      (a, b) => apptDateTime(a).getTime() - apptDateTime(b).getTime(),
    );
  }

  const activeGroups = GROUP_ORDER.filter((g) => groupMap[g].length > 0);

  // ─── Card Render ────────────────────────────────────────────────────────────
  function AppointmentCard({
    appt,
    index,
  }: { appt: Appointment; index: number }) {
    const displayStatus = getDisplayStatus(appt);
    const showDate = appt.date !== today;

    return (
      <div
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
        data-ocid={`admin.item.${index + 1}`}
      >
        {/* Top row: time + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
              {formatTime12(appt.time)}
            </p>
            {showDate && (
              <p className="text-xs text-slate-400 mt-1">
                {formatDateDisplay(appt.date)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={displayStatus} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  data-ocid="admin.dropdown_menu"
                >
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {displayStatus === "Booked" && (
                  <DropdownMenuItem
                    onClick={() => handleConfirm(appt)}
                    data-ocid="admin.confirm_button"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-500" />
                    Confirm
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => openReschedule(appt)}
                  data-ocid="admin.edit_button"
                >
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCancel(appt)}
                  data-ocid="admin.cancel_button"
                >
                  <Ban className="w-4 h-4 mr-2 text-red-500" />
                  Cancel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNoShow(appt)}
                  data-ocid="admin.secondary_button"
                >
                  <UserX className="w-4 h-4 mr-2 text-red-400" />
                  Mark No-show
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteConfirmId(appt.id)}
                  data-ocid="admin.delete_button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Patient info */}
        <div>
          <p className="text-lg font-semibold text-slate-800 leading-tight">
            {appt.name}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{appt.treatment}</p>
        </div>

        {/* Primary action */}
        {displayStatus === "Confirmed" && (
          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            onClick={() => handleStart(appt)}
            disabled={markTreatment.isPending}
            data-ocid="admin.primary_button"
          >
            <Zap className="w-4 h-4 mr-1.5" />
            Start Treatment
          </Button>
        )}
        {displayStatus === "In Progress" && (
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
            onClick={() => handleComplete(appt)}
            disabled={markTreatment.isPending}
            data-ocid="admin.primary_button"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Mark Complete
          </Button>
        )}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F1F5F9" }}>
      {/* Header */}
      <header className="bg-white border-b shadow-xs sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-clinic-blue-light flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-clinic-blue" />
            </div>
            <div>
              <h1 className="font-bold text-clinic-navy text-sm leading-tight">
                Mediverse Dental Clinic
              </h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-ocid="admin.secondary_button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              label: "Total",
              value: counts.total,
              icon: Users,
              bg: "bg-slate-100",
              text: "text-slate-700",
            },
            {
              label: "Confirmed",
              value: counts.confirmed,
              icon: CheckCircle2,
              bg: "bg-blue-100",
              text: "text-blue-700",
            },
            {
              label: "In Progress",
              value: counts.inProgress,
              icon: Timer,
              bg: "bg-orange-100",
              text: "text-orange-700",
            },
            {
              label: "Completed",
              value: counts.completed,
              icon: CheckCircle2,
              bg: "bg-green-100",
              text: "text-green-700",
            },
            {
              label: "Cancelled",
              value: counts.cancelled,
              icon: Ban,
              bg: "bg-red-100",
              text: "text-red-700",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}
              >
                <stat.icon className={`w-5 h-5 ${stat.text}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-slate-900 leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stripe Configuration Banner */}
        {stripeConfigured === false && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4"
            data-ocid="admin.stripe.panel"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Stripe payment gateway is not configured
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Set it up to accept online payments from the Plans page.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStripeModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "#0A1F44" }}
              data-ocid="admin.stripe.open_modal_button"
            >
              <Settings className="w-3.5 h-3.5" />
              Configure Stripe
            </button>
          </div>
        )}

        {stripeConfigured === true && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4"
            data-ocid="admin.stripe.panel"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  Stripe Connected
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Payment gateway is active. Customers can pay online.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStripeModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 hover:bg-green-100"
              style={{ borderColor: "#16a34a", color: "#16a34a" }}
              data-ocid="admin.stripe.open_modal_button"
            >
              <Settings className="w-3.5 h-3.5" />
              Reconfigure
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="h-9 bg-slate-100 rounded-xl p-1">
              {["All", "Today", "Upcoming", "Completed", "Cancelled"].map(
                (f) => (
                  <TabsTrigger
                    key={f}
                    value={f}
                    className="text-xs px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    data-ocid="admin.tab"
                  >
                    {f}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </Tabs>
        </div>

        {/* Loading / Error */}
        {(isLoading || !actor) && (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="admin.loading_state"
          >
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-3 text-slate-500">Loading appointments...</span>
          </div>
        )}

        {isError && actor && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="admin.error_state"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <span className="text-red-600">Failed to load appointments</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !isError && actor && (
          <>
            {/* Next Appointment Banner */}
            {nextAppt ? (
              <div
                className="rounded-2xl p-5 text-white relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)",
                }}
                data-ocid="admin.card"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Next Appointment
                      </p>
                      <p className="text-4xl font-bold leading-none">
                        {formatTime12(nextAppt.time)}
                      </p>
                      <p className="text-lg font-semibold mt-1 text-white/90">
                        {nextAppt.name}
                      </p>
                      <p className="text-sm text-blue-200 mt-0.5">
                        {nextAppt.treatment}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl shadow-md px-6"
                    onClick={() => handleStart(nextAppt)}
                    disabled={markTreatment.isPending}
                    data-ocid="admin.primary_button"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Start Now
                  </Button>
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 right-16 w-24 h-24 rounded-full bg-white/5" />
              </div>
            ) : (
              <div
                className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm flex items-center gap-3 text-slate-400"
                data-ocid="admin.card"
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm">
                  No upcoming appointments scheduled
                </span>
              </div>
            )}

            {/* Empty state */}
            {filteredAppointments.length === 0 && (
              <div
                className="text-center py-20 text-slate-400"
                data-ocid="admin.empty_state"
              >
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-slate-600">
                  No appointments found
                </p>
                <p className="text-sm mt-1">
                  {filter === "All"
                    ? "No bookings yet"
                    : `No ${filter.toLowerCase()} appointments`}
                </p>
              </div>
            )}

            {/* Time-grouped card sections */}
            {activeGroups.map((groupKey) => {
              const appts = groupMap[groupKey];
              const style = GROUP_STYLES[groupKey];
              return (
                <section key={groupKey}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`flex items-center gap-2 ${style.color}`}>
                      {style.icon}
                      <span className="text-sm font-bold uppercase tracking-wider">
                        {style.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.bg} ${style.color} border ${style.border}`}
                    >
                      {appts.length}
                    </span>
                    <div className={`flex-1 h-px ${style.border} border-t`} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {appts.map((appt, idx) => (
                      <AppointmentCard
                        key={appt.id.toString()}
                        appt={appt}
                        index={idx}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          {rescheduleAppt && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Rescheduling for: <strong>{rescheduleAppt.name}</strong>
              </p>
              <div className="space-y-1.5">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Time</Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  data-ocid="admin.input"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleOpen(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-clinic-blue hover:bg-clinic-blue-dark text-white"
              onClick={handleReschedule}
              disabled={reschedule.isPending || !newDate || !newTime}
              data-ocid="admin.confirm_button"
            >
              {reschedule.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Delete Appointment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The appointment will be permanently
            deleted.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId !== null && handleDelete(deleteConfirmId)
              }
              disabled={deleteAppt.isPending}
              data-ocid="admin.delete_button"
            >
              {deleteAppt.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stripe Configuration Modal */}
      <Dialog open={stripeModalOpen} onOpenChange={setStripeModalOpen}>
        <DialogContent data-ocid="admin.stripe.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-600" />
              Configure Stripe Payment Gateway
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <p className="text-sm text-muted-foreground">
              Enter your Stripe Secret Key to enable online payments on the
              Plans page. You can find this in your{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                Stripe Dashboard
              </a>
              .
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="stripe-key">Stripe Secret Key</Label>
              <div className="relative">
                <Input
                  id="stripe-key"
                  type={showStripeKey ? "text" : "password"}
                  placeholder="sk_live_... or sk_test_..."
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  className="pr-10"
                  data-ocid="admin.stripe.input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowStripeKey((v) => !v)}
                  data-ocid="admin.stripe.toggle"
                  aria-label={showStripeKey ? "Hide key" : "Show key"}
                >
                  {showStripeKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stripe-countries">
                Allowed Countries{" "}
                <span className="text-muted-foreground font-normal">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="stripe-countries"
                type="text"
                placeholder="IN, US, GB"
                value={stripeCountries}
                onChange={(e) => setStripeCountries(e.target.value)}
                data-ocid="admin.stripe.input"
              />
              <p className="text-xs text-muted-foreground">
                Use ISO 2-letter country codes, e.g. IN, US, GB, CA
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStripeModalOpen(false);
                setStripeKey("");
              }}
              data-ocid="admin.stripe.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveStripeConfig.mutate()}
              disabled={saveStripeConfig.isPending || !stripeKey.trim()}
              className="bg-clinic-blue hover:bg-clinic-blue-dark text-white"
              data-ocid="admin.stripe.save_button"
            >
              {saveStripeConfig.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              {saveStripeConfig.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

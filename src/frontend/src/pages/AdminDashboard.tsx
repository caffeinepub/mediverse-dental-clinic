import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  LogOut,
  RefreshCw,
  Stethoscope,
  Trash2,
  Users,
  XCircle,
  XSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Appointment } from "../backend.d";
import { useActor } from "../hooks/useActor";

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

function isAfter5Min(appt: Appointment): boolean {
  if (!appt.date || !appt.time) return false;
  try {
    const [year, month, day] = appt.date.split("-").map(Number);
    const [hour, minute] = appt.time.split(":").map(Number);
    const apptDate = new Date(year, month - 1, day, hour, minute);
    const cutoff = new Date(apptDate.getTime() + 5 * 60 * 1000);
    return new Date() >= cutoff;
  } catch {
    return false;
  }
}

function getDateLabel(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  if (dateStr === fmt(today)) return "Today";
  if (dateStr === fmt(yesterday)) return "Yesterday";
  return dateStr;
}

function groupByDate(
  appts: Appointment[],
): { label: string; appts: Appointment[] }[] {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const todayStr = fmt(today);
  const yesterdayStr = fmt(yesterday);

  const groups: Record<string, Appointment[]> = {};
  for (const appt of appts) {
    const key = appt.date || "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(appt);
  }

  // Sort dates: today first, yesterday second, then others descending
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === todayStr) return -1;
    if (b === todayStr) return 1;
    if (a === yesterdayStr) return -1;
    if (b === yesterdayStr) return 1;
    return b.localeCompare(a);
  });

  return sortedKeys.map((key) => ({
    label: getDateLabel(key),
    appts: groups[key],
  }));
}

const dayHeaderColors: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  Today: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  Yesterday: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
};

function getDayHeaderStyle(label: string) {
  return (
    dayHeaderColors[label] ?? {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-400",
    }
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Confirmed: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Rescheduled: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        variants[status] ?? "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function TreatmentBadge({ done }: { done: boolean | null }) {
  if (done === null || done === undefined) return null;
  return done ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-800 border-emerald-200">
      <CheckCircle className="w-3 h-3" /> Done
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-orange-100 text-orange-800 border-orange-200">
      <XCircle className="w-3 h-3" /> Not Done
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();
  const [filter, setFilter] = useState("All");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(
    null,
  );
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);

  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAppointments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
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

  function handleTreatmentDone(appt: Appointment, done: boolean) {
    const patientName = appt.name || "Patient";
    const message = done
      ? `Hello ${patientName}, thank you for visiting Mediverse Dental Clinic. Your treatment has been successfully completed. We hope you are feeling better. For any follow-up, feel free to contact us.`
      : `Hello ${patientName}, your treatment at Mediverse Dental Clinic was not completed. Please contact us to continue or reschedule your treatment.`;
    const phone = "+91 9142345153";
    window.open(waLink(phone, message), "_blank");
    markTreatment.mutate(
      { id: appt.id, done },
      {
        onSuccess: () =>
          toast.success(
            `Treatment marked as ${done ? "Done" : "Not Done"} for ${appt.name}`,
          ),
      },
    );
  }

  const filtered =
    filter === "All"
      ? appointments
      : filter === "Treatment Done"
        ? appointments.filter((a) => a.treatmentDone === true)
        : filter === "Treatment Not Done"
          ? appointments.filter((a) => a.treatmentDone === false)
          : appointments.filter((a) => a.status === filter);

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length,
    treatmentDone: appointments.filter((a) => a.treatmentDone === true).length,
    treatmentNotDone: appointments.filter((a) => a.treatmentDone === false)
      .length,
  };

  const groupedAppointments = groupByDate(filtered);

  function renderAppointmentRow(appt: Appointment, idx: number) {
    const after5 = isAfter5Min(appt);
    return (
      <TableRow key={appt.id.toString()} data-ocid={`admin.item.${idx + 1}`}>
        <TableCell className="text-muted-foreground text-sm">
          {idx + 1}
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium text-sm">{appt.name}</p>
            <p className="text-xs text-muted-foreground">{appt.email}</p>
          </div>
        </TableCell>
        <TableCell className="text-sm">{appt.phone}</TableCell>
        <TableCell className="text-sm">{appt.date}</TableCell>
        <TableCell className="text-sm">{appt.time}</TableCell>
        <TableCell className="text-sm">{appt.treatment}</TableCell>
        <TableCell>
          <StatusBadge status={appt.status} />
        </TableCell>
        <TableCell>
          {after5 ? (
            <TreatmentBadge done={appt.treatmentDone ?? null} />
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Pending appointment
            </span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs text-green-700 border-green-200 hover:bg-green-50"
              onClick={() => handleConfirm(appt)}
              disabled={appt.status === "Confirmed" || updateStatus.isPending}
              data-ocid="admin.confirm_button"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => handleCancel(appt)}
              disabled={appt.status === "Cancelled" || updateStatus.isPending}
              data-ocid="admin.cancel_button"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
              onClick={() => openReschedule(appt)}
              data-ocid="admin.edit_button"
            >
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Reschedule
            </Button>
            {after5 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => handleTreatmentDone(appt, true)}
                  disabled={
                    appt.treatmentDone === true || markTreatment.isPending
                  }
                  data-ocid="admin.treatment_done_button"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1" />
                  Done
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs text-orange-700 border-orange-200 hover:bg-orange-50"
                  onClick={() => handleTreatmentDone(appt, false)}
                  disabled={
                    appt.treatmentDone === false || markTreatment.isPending
                  }
                  data-ocid="admin.treatment_not_done_button"
                >
                  <XSquare className="w-3.5 h-3.5 mr-1" />
                  Not Done
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
              onClick={() => setDeleteConfirmId(appt.id)}
              data-ocid="admin.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Total",
              value: counts.total,
              icon: Users,
              color: "text-clinic-blue",
              bg: "bg-blue-50",
            },
            {
              label: "Pending",
              value: counts.pending,
              icon: Clock,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Confirmed",
              value: counts.confirmed,
              icon: CheckCircle,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Cancelled",
              value: counts.cancelled,
              icon: XCircle,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "Treated",
              value: counts.treatmentDone,
              icon: CheckSquare,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Not Treated",
              value: counts.treatmentNotDone,
              icon: XSquare,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-xs border"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-clinic-navy">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl border shadow-xs overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-clinic-navy">Appointments</h2>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="h-8 flex-wrap">
                {[
                  "All",
                  "Pending",
                  "Confirmed",
                  "Cancelled",
                  "Rescheduled",
                  "Treatment Done",
                  "Treatment Not Done",
                ].map((f) => (
                  <TabsTrigger
                    key={f}
                    value={f}
                    className="text-xs h-7 px-3"
                    data-ocid="admin.tab"
                  >
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {isLoading && (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="admin.loading_state"
            >
              <RefreshCw className="w-6 h-6 animate-spin text-clinic-blue" />
              <span className="ml-2 text-muted-foreground">
                Loading appointments...
              </span>
            </div>
          )}

          {isError && (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="admin.error_state"
            >
              <AlertCircle className="w-6 h-6 text-destructive" />
              <span className="ml-2 text-destructive">
                Failed to load appointments
              </span>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="admin.empty_state"
            >
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No appointments found</p>
              <p className="text-sm">
                {filter === "All"
                  ? "No bookings yet"
                  : `No ${filter.toLowerCase()} appointments`}
              </p>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="overflow-x-auto">
              {groupedAppointments.map((group) => {
                const style = getDayHeaderStyle(group.label);
                return (
                  <div key={group.label}>
                    {/* Day separator header */}
                    <div
                      className={`flex items-center gap-2 px-4 py-2 ${style.bg} border-b ${style.border}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
                      >
                        {group.label}
                      </span>
                      <span className={`text-xs ${style.text} opacity-70 ml-1`}>
                        ({group.appts.length} appointment
                        {group.appts.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <Table data-ocid="admin.table">
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-10">#</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Treatment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Treatment Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.appts.map((appt, idx) =>
                          renderAppointmentRow(appt, idx),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
    </div>
  );
}

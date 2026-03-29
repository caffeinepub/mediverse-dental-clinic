import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Appointment {
    id: bigint;
    status: string;
    date: string;
    name: string;
    time: string;
    treatment: string;
    email: string;
    notes: string;
    timestamp: bigint;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAppointment(id: bigint): Promise<void>;
    getAppointments(): Promise<Array<Appointment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rescheduleAppointment(id: bigint, newDate: string, newTime: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAppointment(name: string, phone: string, email: string, date: string, time: string, treatment: string, notes: string): Promise<bigint>;
    updateAppointmentStatus(id: bigint, status: string): Promise<void>;
}

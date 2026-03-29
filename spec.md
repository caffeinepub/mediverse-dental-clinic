# Mediverse Dental Clinic

## Current State
New project with empty Motoko backend and no frontend.

## Requested Changes (Diff)

### Add
- Full dental clinic marketing website (React)
- Appointment booking form with 7 fields
- Admin dashboard at /admin/login with login credentials (admin@mediverse.com / admin123)
- Motoko backend storing all appointments with status management
- WhatsApp pre-fill automation via wa.me links after booking
- Admin actions: Confirm, Cancel, Reschedule, Delete
- WhatsApp notification links triggered from admin dashboard actions
- Status filters in admin: Pending / Confirmed / Cancelled / All

### Modify
N/A (new project)

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- Appointment record: id, name, phone, email, date, time, treatment, notes, status, timestamp
- Functions: submitAppointment, getAppointments, updateAppointmentStatus, rescheduleAppointment, deleteAppointment, adminLogin
- Admin auth: hardcoded credentials checked server-side, returns session token
- Status enum: Pending | Confirmed | Cancelled | Rescheduled

### Frontend
- React Router with routes: / (clinic site) and /admin/login + /admin/dashboard
- Clinic site sections: Navbar, Hero, About, Services, Testimonials, Booking Form, Contact, Footer
- Floating WhatsApp button
- After form submit: save appointment then open wa.me with pre-filled message
- Admin dashboard: login form, appointments table with filters, action buttons
- Admin confirm/cancel/reschedule opens wa.me link to notify patient (phone number used)
- Reschedule shows modal to pick new date/time
- All state managed via backend actor calls

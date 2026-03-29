import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Appointment {
    public func compareByTimestamp(a : Appointment, b : Appointment) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  public type Appointment = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    date : Text;
    time : Text;
    treatment : Text;
    notes : Text;
    status : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  let appointmentsMap = Map.empty<Nat, Appointment>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextId = 1;

  // User Profile Management (required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public appointment submission (no auth required - guests can book)
  public shared ({ caller }) func submitAppointment(name : Text, phone : Text, email : Text, date : Text, time : Text, treatment : Text, notes : Text) : async Nat {
    let id = nextId;
    nextId += 1;

    let appointment : Appointment = {
      id;
      name;
      phone;
      email;
      date;
      time;
      treatment;
      notes;
      status = "Pending";
      timestamp = Time.now();
    };

    appointmentsMap.add(id, appointment);
    id;
  };

  // Admin-only: View all appointments
  public query ({ caller }) func getAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all appointments");
    };
    appointmentsMap.values().toArray().sort(Appointment.compareByTimestamp);
  };

  // Admin-only: Update appointment status
  public shared ({ caller }) func updateAppointmentStatus(id : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update appointment status");
    };
    switch (appointmentsMap.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updated = { appointment with status };
        appointmentsMap.add(id, updated);
      };
    };
  };

  // Admin-only: Reschedule appointment
  public shared ({ caller }) func rescheduleAppointment(id : Nat, newDate : Text, newTime : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reschedule appointments");
    };
    switch (appointmentsMap.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updated = {
          appointment with
          date = newDate;
          time = newTime;
          status = "Rescheduled";
        };
        appointmentsMap.add(id, updated);
      };
    };
  };

  // Admin-only: Delete appointment
  public shared ({ caller }) func deleteAppointment(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete appointments");
    };
    if (not appointmentsMap.containsKey(id)) { Runtime.trap("Appointment not found") };
    appointmentsMap.remove(id);
  };
};

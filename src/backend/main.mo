import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // V1 type (old) — used only for stable migration
  type AppointmentV1 = {
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

  // Current type
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
    treatmentDone : ?Bool;
  };

  module Appointment {
    public func compareByTimestamp(a : Appointment, b : Appointment) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  // Stripe config
  stable var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Keep old stable var with old type so Motoko can load existing on-chain data
  stable let appointmentsMap : Map.Map<Nat, AppointmentV1> = Map.empty();
  // New stable var with updated type
  stable let appointmentsMapV2 : Map.Map<Nat, Appointment> = Map.empty();
  let userProfiles = Map.empty<Principal, UserProfile>();
  // Stable nextId so it survives upgrades and redeploys
  stable var nextId = 1;

  // Migration: copy V1 records into V2 with treatmentDone = null
  system func postupgrade() {
    for ((id, appt) in appointmentsMap.entries()) {
      if (not appointmentsMapV2.containsKey(id)) {
        let migrated : Appointment = {
          id = appt.id;
          name = appt.name;
          phone = appt.phone;
          email = appt.email;
          date = appt.date;
          time = appt.time;
          treatment = appt.treatment;
          notes = appt.notes;
          status = appt.status;
          timestamp = appt.timestamp;
          treatmentDone = null;
        };
        appointmentsMapV2.add(id, migrated);
        if (appt.id + 1 > nextId) { nextId := appt.id + 1 };
      };
    };
    // Also sync nextId from V2 map in case of prior data
    for ((id, _) in appointmentsMapV2.entries()) {
      if (id + 1 > nextId) { nextId := id + 1 };
    };
  };

  // HTTP transform for outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ── Stripe ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    switch (stripeConfig) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  // ── User Profile Management ──────────────────────────────────────────────

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

  // ── Appointment Management ───────────────────────────────────────────────

  public shared func submitAppointment(name : Text, phone : Text, email : Text, date : Text, time : Text, treatment : Text, notes : Text) : async Nat {
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
      treatmentDone = null;
    };

    appointmentsMapV2.add(id, appointment);
    id;
  };

  public query func getAppointments() : async [Appointment] {
    appointmentsMapV2.values().toArray().sort(Appointment.compareByTimestamp);
  };

  public shared func updateAppointmentStatus(id : Nat, status : Text) : async () {
    switch (appointmentsMapV2.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updated = { appointment with status };
        appointmentsMapV2.add(id, updated);
      };
    };
  };

  public shared func markTreatmentDone(id : Nat, done : Bool) : async () {
    switch (appointmentsMapV2.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updated = { appointment with treatmentDone = ?done };
        appointmentsMapV2.add(id, updated);
      };
    };
  };

  public shared func rescheduleAppointment(id : Nat, newDate : Text, newTime : Text) : async () {
    switch (appointmentsMapV2.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updated = {
          appointment with
          date = newDate;
          time = newTime;
          status = "Rescheduled";
        };
        appointmentsMapV2.add(id, updated);
      };
    };
  };

  public shared func deleteAppointment(id : Nat) : async () {
    if (not appointmentsMapV2.containsKey(id)) { Runtime.trap("Appointment not found") };
    appointmentsMapV2.remove(id);
  };
};

/**
 * Types for the Data Validator Cloud Function.
 *
 * Handles Pub/Sub messages from Twenty CRM webhooks
 * for Indian-format field validation.
 */

/** Supported CRM object types */
export type CrmObjectName = "person" | "landlord" | "property" | "room";

/** Event types published by Twenty webhooks */
export type CrmEventType =
  | `${CrmObjectName}.created`
  | `${CrmObjectName}.updated`;

/** Metadata about the CRM object that triggered the event */
export interface ObjectMetadata {
  nameSingular: CrmObjectName;
}

/** Base record fields common to all objects */
interface BaseRecord {
  id: string;
  _validation_errors?: string;
  [key: string]: unknown;
}

/** Person record fields */
export interface PersonRecord extends BaseRecord {
  phone?: string | null;
  aadharNumber?: string | null;
  panCard?: string | null;
  email?: string | null;
}

/** Landlord record fields */
export interface LandlordRecord extends BaseRecord {
  panCard?: string | null;
  ifscCode?: string | null;
}

/** Property record fields */
export interface PropertyRecord extends BaseRecord {
  pid?: string | null;
}

/** Room record fields */
export interface RoomRecord extends BaseRecord {
  roomId?: string | null;
}

/** Union of all possible record shapes */
export type CrmRecord = PersonRecord | LandlordRecord | PropertyRecord | RoomRecord;

/** The Pub/Sub message payload from Twenty webhooks */
export interface CrmEvent {
  eventType: CrmEventType;
  objectMetadata: ObjectMetadata;
  record: CrmRecord;
}

/** A single field validation error */
export interface ValidationError {
  field: string;
  message: string;
  value: unknown;
}

/** Result of validating an entire record */
export interface ValidationResult {
  objectType: CrmObjectName;
  recordId: string;
  errors: ValidationError[];
  valid: boolean;
}

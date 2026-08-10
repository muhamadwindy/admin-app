// App-level enums. SQLite has no native Prisma enum support, so the schema
// stores these as plain strings — these union types + the zod schemas in
// lib/validation.ts are what actually enforce the closed value sets.

export type PortalRole = "NONE" | "SUPER_ADMIN" | "ADMIN" | "APPROVER" | "AUDITOR";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "RESIGNED";
export type EmploymentType = "PERMANENT" | "CONTRACT" | "INTERN";
export type RequestType = "CREATE" | "UPDATE" | "DEACTIVATE" | "DELETE";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

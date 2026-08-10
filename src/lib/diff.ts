export type FieldDiff = { field: string; before: unknown; after: unknown };

/** Shallow field-by-field diff between two plain objects, skipping keys that didn't change. */
export function diffObjects(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown>
): FieldDiff[] {
  const changes: FieldDiff[] = [];
  const keys = new Set([...(before ? Object.keys(before) : []), ...Object.keys(after)]);
  for (const key of keys) {
    const b = before?.[key];
    const a = after[key];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changes.push({ field: key, before: b ?? null, after: a ?? null });
    }
  }
  return changes;
}

export const FIELD_LABEL: Record<string, string> = {
  fullName: "Nama Lengkap",
  email: "Email",
  phone: "No. Telepon",
  gender: "Jenis Kelamin",
  dateOfBirth: "Tanggal Lahir",
  idCardNumber: "No. KTP",
  address: "Alamat",
  department: "Departemen",
  branch: "Cabang",
  position: "Jabatan",
  employmentType: "Status Kepegawaian",
  joinDate: "Tanggal Bergabung",
  portalRole: "Peran Akses Sistem",
  accountStatus: "Status Akun",
  nip: "NIP",
};

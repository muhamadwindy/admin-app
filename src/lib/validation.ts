import { z } from "zod";
import { BRANCHES, DEPARTMENTS } from "@/lib/constants";

export const loginSchema = z.object({
  nip: z.string().min(1, "NIP wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const otpSchema = z.object({
  code: z.string().length(6, "Kode OTP harus 6 digit").regex(/^\d+$/, "Kode OTP hanya berisi angka"),
});

const passwordPolicy = z
  .string()
  .min(10, "Minimal 10 karakter")
  .regex(/[a-z]/, "Harus mengandung huruf kecil")
  .regex(/[A-Z]/, "Harus mengandung huruf besar")
  .regex(/[0-9]/, "Harus mengandung angka");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    newPassword: passwordPolicy,
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

export const employeeFormSchema = z.object({
  nip: z
    .string()
    .min(6, "NIP wajib diisi")
    .regex(/^BSK-\d{4}-\d{4,6}$/, "Format NIP: BSK-YYYY-XXXX"),
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter").max(120),
  email: z.string().email("Format email tidak valid"),
  phone: z
    .string()
    .min(9, "Nomor telepon tidak valid")
    .regex(/^(\+62|0)[0-9]{8,13}$/, "Gunakan format 08xx atau +62xx"),
  gender: z.enum(["Laki-laki", "Perempuan"], { errorMap: () => ({ message: "Pilih jenis kelamin" }) }),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
  idCardNumber: z.string().length(16, "No. KTP harus 16 digit").regex(/^\d+$/, "No. KTP hanya angka"),
  address: z.string().min(10, "Alamat minimal 10 karakter").max(300),
  department: z.enum(DEPARTMENTS, { errorMap: () => ({ message: "Pilih departemen" }) }),
  branch: z.enum(BRANCHES, { errorMap: () => ({ message: "Pilih cabang" }) }),
  position: z.string().min(2, "Jabatan wajib diisi"),
  employmentType: z.enum(["PERMANENT", "CONTRACT", "INTERN"]),
  joinDate: z.string().min(1, "Tanggal bergabung wajib diisi"),
  portalRole: z.enum(["NONE", "SUPER_ADMIN", "ADMIN", "APPROVER", "AUDITOR"]),
  reason: z.string().min(15, "Jelaskan alasan pengajuan minimal 15 karakter").max(500),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const decisionSchema = z.object({
  note: z.string().max(500).optional(),
});

export const rejectSchema = z.object({
  note: z.string().min(10, "Alasan penolakan minimal 10 karakter").max(500),
});

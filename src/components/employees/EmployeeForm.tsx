"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button, Panel } from "@/components/ui";
import { Input, Select, Textarea } from "@/components/ui/form";
import { Field } from "@/components/ui";
import { employeeFormSchema, type EmployeeFormValues } from "@/lib/validation";
import { BRANCHES, DEPARTMENTS, POSITIONS } from "@/lib/constants";
import { ROLE_LABEL } from "@/lib/rbac";
import { useToast } from "@/components/ui/toast";

const PORTAL_ROLES = ["NONE", "SUPER_ADMIN", "ADMIN", "APPROVER", "AUDITOR"] as const;

export function EmployeeForm({
  mode,
  targetId,
  defaultValues,
}: {
  mode: "create" | "edit";
  targetId?: string;
  defaultValues?: Partial<EmployeeFormValues>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employmentType: "PERMANENT",
      portalRole: "NONE",
      ...defaultValues,
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    setServerError(null);
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/employees" : `/api/employees/${targetId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "create" ? { ...values } : { type: "UPDATE", ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Gagal mengirim pengajuan.");
        return;
      }
      toast.success(
        "Pengajuan terkirim",
        "Perubahan akan berlaku setelah disetujui oleh Approver terkait."
      );
      router.push(mode === "create" ? "/my-requests" : `/employees/${targetId}`);
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="flex items-start gap-2 rounded-md border border-bad-700/20 bg-bad-100 px-3 py-2.5 text-[13px] text-bad-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <Panel className="p-5">
        <p className="label-caps mb-4">Data Pribadi</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="NIP" htmlFor="nip" required error={errors.nip?.message} hint="Format: BCN-YYYY-XXXX">
            <Input id="nip" placeholder="BCN-2026-0001" disabled={mode === "edit"} aria-invalid={!!errors.nip} {...register("nip")} />
          </Field>
          <Field label="Nama Lengkap" htmlFor="fullName" required error={errors.fullName?.message}>
            <Input id="fullName" aria-invalid={!!errors.fullName} {...register("fullName")} />
          </Field>
          <Field label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          </Field>
          <Field label="No. Telepon" htmlFor="phone" required error={errors.phone?.message} hint="Contoh: 081234567890">
            <Input id="phone" aria-invalid={!!errors.phone} {...register("phone")} />
          </Field>
          <Field label="Jenis Kelamin" htmlFor="gender" required error={errors.gender?.message}>
            <Select id="gender" aria-invalid={!!errors.gender} {...register("gender")}>
              <option value="">Pilih...</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </Select>
          </Field>
          <Field label="Tanggal Lahir" htmlFor="dateOfBirth" required error={errors.dateOfBirth?.message}>
            <Input id="dateOfBirth" type="date" aria-invalid={!!errors.dateOfBirth} {...register("dateOfBirth")} />
          </Field>
          <Field label="No. KTP" htmlFor="idCardNumber" required error={errors.idCardNumber?.message} hint="16 digit">
            <Input id="idCardNumber" maxLength={16} aria-invalid={!!errors.idCardNumber} {...register("idCardNumber")} />
          </Field>
          <Field label="Alamat" htmlFor="address" required error={errors.address?.message}>
            <Textarea id="address" rows={2} aria-invalid={!!errors.address} {...register("address")} />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="label-caps mb-4">Data Kepegawaian</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Departemen" htmlFor="department" required error={errors.department?.message}>
            <Select id="department" aria-invalid={!!errors.department} {...register("department")}>
              <option value="">Pilih...</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Cabang" htmlFor="branch" required error={errors.branch?.message}>
            <Select id="branch" aria-invalid={!!errors.branch} {...register("branch")}>
              <option value="">Pilih...</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </Field>
          <Field label="Jabatan" htmlFor="position" required error={errors.position?.message}>
            <Select id="position" aria-invalid={!!errors.position} {...register("position")}>
              <option value="">Pilih...</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status Kepegawaian" htmlFor="employmentType" required error={errors.employmentType?.message}>
            <Select id="employmentType" aria-invalid={!!errors.employmentType} {...register("employmentType")}>
              <option value="PERMANENT">Tetap</option>
              <option value="CONTRACT">Kontrak</option>
              <option value="INTERN">Magang</option>
            </Select>
          </Field>
          <Field label="Tanggal Bergabung" htmlFor="joinDate" required error={errors.joinDate?.message}>
            <Input id="joinDate" type="date" aria-invalid={!!errors.joinDate} {...register("joinDate")} />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <p className="label-caps mb-1">Akses Sistem CoreAccess</p>
        <p className="mb-4 text-[12.5px] text-ink-400">
          Menentukan apakah pegawai ini memiliki akses login ke portal CoreAccess, dan sebagai peran apa.
        </p>
        <Field label="Peran Akses Portal" htmlFor="portalRole" required error={errors.portalRole?.message}>
          <Select id="portalRole" aria-invalid={!!errors.portalRole} {...register("portalRole")}>
            {PORTAL_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </Select>
        </Field>
      </Panel>

      <Panel className="p-5">
        <p className="label-caps mb-4">Alasan Pengajuan</p>
        <Field
          label="Jelaskan alasan penambahan/perubahan data ini"
          htmlFor="reason"
          required
          error={errors.reason?.message}
          hint="Wajib diisi untuk keperluan peninjauan oleh Approver, minimal 15 karakter."
        >
          <Textarea id="reason" rows={3} placeholder="Contoh: Pegawai baru bergabung di Cabang Bandung menggantikan posisi yang kosong sejak Januari 2026." aria-invalid={!!errors.reason} {...register("reason")} />
        </Field>
      </Panel>

      <div className="flex items-center justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Mengirim..." : "Ajukan untuk Persetujuan"}
        </Button>
      </div>
    </form>
  );
}

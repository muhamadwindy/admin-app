import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hash(plain: string) {
  return bcrypt.hashSync(plain, 10);
}

const BRANCHES = [
  "Kantor Pusat - Jakarta",
  "Cabang Jakarta Selatan",
  "Cabang Surabaya",
  "Cabang Bandung",
  "Cabang Medan",
  "Cabang Makassar",
];

const DEPARTMENTS = [
  "Teknologi Informasi",
  "Operasional",
  "Kredit & Pembiayaan",
  "Kepatuhan & Manajemen Risiko",
  "Sumber Daya Manusia",
  "Layanan Nasabah",
  "Keuangan & Akuntansi",
  "Audit Internal",
];

type SeedEmployee = {
  nip: string;
  fullName: string;
  gender: "Laki-laki" | "Perempuan";
  department: string;
  branch: string;
  position: string;
  employmentType: "PERMANENT" | "CONTRACT" | "INTERN";
  accountStatus: "ACTIVE" | "SUSPENDED" | "RESIGNED";
  portalRole: "NONE" | "SUPER_ADMIN" | "ADMIN" | "APPROVER" | "AUDITOR";
  dob: string;
  join: string;
  password: string;
  mustChangePassword?: boolean;
};

let seq = 1;
function nip(year: string) {
  return `BCN-${year}-${String(seq++).padStart(4, "0")}`;
}

const roster: SeedEmployee[] = [
  // --- Portal users used for the live demo (documented in README) ---
  {
    nip: nip("2021"),
    fullName: "Andra Wibisono",
    gender: "Laki-laki",
    department: "Teknologi Informasi",
    branch: "Kantor Pusat - Jakarta",
    position: "Vice President",
    employmentType: "PERMANENT",
    accountStatus: "ACTIVE",
    portalRole: "SUPER_ADMIN",
    dob: "1985-03-12",
    join: "2012-02-01",
    password: "SuperAdmin123",
  },
  {
    nip: nip("2021"),
    fullName: "Siti Rahmawati",
    gender: "Perempuan",
    department: "Sumber Daya Manusia",
    branch: "Kantor Pusat - Jakarta",
    position: "Assistant Manager",
    employmentType: "PERMANENT",
    accountStatus: "ACTIVE",
    portalRole: "ADMIN",
    dob: "1990-07-22",
    join: "2015-05-10",
    password: "AdminOps123",
  },
  {
    nip: nip("2021"),
    fullName: "Bambang Kurniawan",
    gender: "Laki-laki",
    department: "Kepatuhan & Manajemen Risiko",
    branch: "Kantor Pusat - Jakarta",
    position: "Senior Manager",
    employmentType: "PERMANENT",
    accountStatus: "ACTIVE",
    portalRole: "APPROVER",
    dob: "1982-11-05",
    join: "2010-08-16",
    password: "Approver123",
  },
  {
    nip: nip("2021"),
    fullName: "Dewi Anggraini",
    gender: "Perempuan",
    department: "Audit Internal",
    branch: "Kantor Pusat - Jakarta",
    position: "Manager",
    employmentType: "PERMANENT",
    accountStatus: "ACTIVE",
    portalRole: "AUDITOR",
    dob: "1988-01-30",
    join: "2013-03-01",
    password: "Auditor123",
  },
  {
    nip: nip("2022"),
    fullName: "Ratna Puspitasari",
    gender: "Perempuan",
    department: "Kepatuhan & Manajemen Risiko",
    branch: "Cabang Surabaya",
    position: "Manager",
    employmentType: "PERMANENT",
    accountStatus: "ACTIVE",
    portalRole: "APPROVER",
    dob: "1986-09-18",
    join: "2011-06-01",
    password: "Approver123",
  },
  {
    nip: nip("2025"),
    fullName: "Fajar Ramadhan",
    gender: "Laki-laki",
    department: "Teknologi Informasi",
    branch: "Kantor Pusat - Jakarta",
    position: "Staff",
    employmentType: "PERMANENT",
    accountStatus: "ACTIVE",
    portalRole: "ADMIN",
    dob: "1999-04-14",
    join: "2025-06-01",
    password: "Welcome123",
    mustChangePassword: true,
  },
  // --- Regular employee directory records (no portal access) ---
  ...[
    ["Agus Santoso", "Laki-laki", "Operasional", "Cabang Jakarta Selatan", "Staff", "1992-02-11", "2018-01-15"],
    ["Rina Marlina", "Perempuan", "Layanan Nasabah", "Cabang Bandung", "Senior Staff", "1993-06-25", "2017-09-01"],
    ["Hendra Gunawan", "Laki-laki", "Kredit & Pembiayaan", "Cabang Surabaya", "Supervisor", "1987-12-03", "2014-04-01"],
    ["Yuni Kartika", "Perempuan", "Keuangan & Akuntansi", "Kantor Pusat - Jakarta", "Staff", "1995-08-19", "2020-02-10"],
    ["Dedi Setiawan", "Laki-laki", "Operasional", "Cabang Medan", "Senior Staff", "1991-01-27", "2016-07-01"],
    ["Maya Sari", "Perempuan", "Layanan Nasabah", "Cabang Jakarta Selatan", "Staff", "1996-03-08", "2021-03-01"],
    ["Wahyu Nugroho", "Laki-laki", "Teknologi Informasi", "Kantor Pusat - Jakarta", "Supervisor", "1989-10-14", "2013-11-01"],
    ["Lestari Handayani", "Perempuan", "Sumber Daya Manusia", "Cabang Bandung", "Staff", "1994-05-30", "2019-05-15"],
    ["Rudi Hartono", "Laki-laki", "Kredit & Pembiayaan", "Cabang Makassar", "Manager", "1983-07-09", "2009-01-10"],
    ["Nita Permatasari", "Perempuan", "Kepatuhan & Manajemen Risiko", "Kantor Pusat - Jakarta", "Senior Staff", "1992-11-22", "2017-02-01"],
    ["Eko Prasetyo", "Laki-laki", "Operasional", "Cabang Surabaya", "Staff", "1997-09-02", "2022-01-10"],
    ["Fitriani", "Perempuan", "Layanan Nasabah", "Cabang Medan", "Supervisor", "1990-04-17", "2015-08-01"],
    ["Joko Susilo", "Laki-laki", "Audit Internal", "Kantor Pusat - Jakarta", "Senior Staff", "1988-06-06", "2014-09-01"],
    ["Anita Wulandari", "Perempuan", "Keuangan & Akuntansi", "Cabang Bandung", "Staff", "1998-12-11", "2023-02-01"],
    ["Suryadi", "Laki-laki", "Kredit & Pembiayaan", "Cabang Jakarta Selatan", "Assistant Manager", "1985-02-24", "2011-05-01"],
    ["Melati Putri", "Perempuan", "Teknologi Informasi", "Kantor Pusat - Jakarta", "Staff", "1999-01-05", "2024-03-01"],
    ["Bagas Prakoso", "Laki-laki", "Operasional", "Cabang Makassar", "Staff", "1996-08-28", "2020-11-01"],
    ["Indah Cahyani", "Perempuan", "Sumber Daya Manusia", "Kantor Pusat - Jakarta", "Senior Staff", "1991-10-19", "2016-04-01"],
    ["Teguh Iman", "Laki-laki", "Kepatuhan & Manajemen Risiko", "Cabang Surabaya", "Staff", "1994-03-15", "2019-09-01"],
    ["Putri Ayu Lestari", "Perempuan", "Layanan Nasabah", "Cabang Bandung", "Staff", "2000-07-07", "2024-08-01"],
    ["Arief Budiman", "Laki-laki", "Kredit & Pembiayaan", "Kantor Pusat - Jakarta", "Senior Manager", "1980-05-13", "2007-03-01"],
    ["Sri Wahyuni", "Perempuan", "Keuangan & Akuntansi", "Cabang Medan", "Supervisor", "1989-09-23", "2013-06-01"],
    ["Herman Yulianto", "Laki-laki", "Operasional", "Cabang Jakarta Selatan", "Kepala Cabang", "1979-12-30", "2005-01-15"],
    ["Diah Permata", "Perempuan", "Audit Internal", "Kantor Pusat - Jakarta", "Staff", "1997-02-18", "2022-06-01"],
    ["Guntur Firmansyah", "Laki-laki", "Teknologi Informasi", "Cabang Surabaya", "Senior Staff", "1993-04-09", "2018-10-01"],
    ["Novi Aristasari", "Perempuan", "Kepatuhan & Manajemen Risiko", "Cabang Makassar", "Staff", "1995-11-11", "2021-01-01"],
  ].map(([fullName, gender, department, branch, position, dob, join], i) => ({
    nip: nip(join.slice(0, 4)),
    fullName,
    gender: gender as "Laki-laki" | "Perempuan",
    department,
    branch,
    position,
    employmentType: (i % 9 === 0 ? "CONTRACT" : "PERMANENT") as "PERMANENT" | "CONTRACT",
    accountStatus: (i === 5 ? "SUSPENDED" : i === 12 ? "RESIGNED" : "ACTIVE") as
      | "ACTIVE"
      | "SUSPENDED"
      | "RESIGNED",
    portalRole: "NONE" as const,
    dob,
    join,
    password: "NoPortalAccess123",
  })),
];

async function main() {
  console.log("Seeding CoreAccess demo data for Bank Cakra Nusantara...");
  await prisma.auditLog.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.session.deleteMany();
  await prisma.changeRequest.deleteMany();
  await prisma.user.deleteMany();

  const created: Record<string, string> = {};

  for (const [idx, emp] of roster.entries()) {
    const user = await prisma.user.create({
      data: {
        nip: emp.nip,
        fullName: emp.fullName,
        email: `${emp.fullName.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, ".")}@bcn.co.id`,
        phone: `08${String(100000000 + idx * 7919).padStart(9, "0")}`,
        gender: emp.gender,
        dateOfBirth: new Date(emp.dob),
        idCardNumber: String(3200000000000000n + BigInt((idx + 1) * 137)),
        address: `Jl. Contoh No. ${((idx + 1) * 3) % 90 + 1}, ${emp.branch.replace("Cabang ", "").replace("Kantor Pusat - ", "")}`,
        department: emp.department,
        branch: emp.branch,
        position: emp.position,
        employmentType: emp.employmentType,
        joinDate: new Date(emp.join),
        accountStatus: emp.accountStatus,
        portalRole: emp.portalRole,
        passwordHash: hash(emp.password),
        mustChangePassword: !!emp.mustChangePassword,
      },
    });
    created[emp.fullName] = user.id;
  }

  const superAdminId = created["Andra Wibisono"];
  const adminId = created["Siti Rahmawati"];
  const approverId = created["Bambang Kurniawan"];
  const approver2Id = created["Ratna Puspitasari"];
  const auditorId = created["Dewi Anggraini"];

  // A handful of illustrative change requests across every status.
  const targetForUpdate = created["Rina Marlina"];
  const targetForDeactivate = created["Eko Prasetyo"];
  const targetForRejected = created["Bagas Prakoso"];

  const target1 = await prisma.user.findUniqueOrThrow({ where: { id: targetForUpdate } });
  await prisma.changeRequest.create({
    data: {
      type: "UPDATE",
      status: "PENDING",
      targetId: targetForUpdate,
      requesterId: adminId,
      reason: "Pegawai dipromosikan menjadi Assistant Manager berdasarkan SK Direksi No. 045/SDM/2026.",
      previousData: JSON.stringify({
        nip: target1.nip,
        fullName: target1.fullName,
        email: target1.email,
        phone: target1.phone,
        gender: target1.gender,
        dateOfBirth: target1.dateOfBirth.toISOString().slice(0, 10),
        idCardNumber: target1.idCardNumber,
        address: target1.address,
        department: target1.department,
        branch: target1.branch,
        position: "Senior Staff",
        employmentType: target1.employmentType,
        joinDate: target1.joinDate.toISOString().slice(0, 10),
        portalRole: target1.portalRole,
        accountStatus: target1.accountStatus,
      }),
      payload: JSON.stringify({
        nip: target1.nip,
        fullName: target1.fullName,
        email: target1.email,
        phone: target1.phone,
        gender: target1.gender,
        dateOfBirth: target1.dateOfBirth.toISOString().slice(0, 10),
        idCardNumber: target1.idCardNumber,
        address: target1.address,
        department: target1.department,
        branch: target1.branch,
        position: "Assistant Manager",
        employmentType: target1.employmentType,
        joinDate: target1.joinDate.toISOString().slice(0, 10),
        portalRole: target1.portalRole,
        accountStatus: target1.accountStatus,
      }),
    },
  });

  await prisma.changeRequest.create({
    data: {
      type: "DEACTIVATE",
      status: "PENDING",
      targetId: targetForDeactivate,
      requesterId: adminId,
      reason: "Pegawai sedang menjalani proses investigasi internal oleh tim Kepatuhan, akses perlu dibekukan sementara.",
      previousData: JSON.stringify({ accountStatus: "ACTIVE" }),
      payload: JSON.stringify({ accountStatus: "SUSPENDED" }),
    },
  });

  const rejectedReq = await prisma.changeRequest.create({
    data: {
      type: "CREATE",
      status: "REJECTED",
      requesterId: adminId,
      reviewerId: approverId,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewNote: "Nomor KTP yang diajukan tidak sesuai dengan dokumen pendukung. Mohon ajukan ulang dengan lampiran yang benar.",
      reason: "Penambahan pegawai baru di Cabang Bandung sesuai kebutuhan ekspansi Q1.",
      payload: JSON.stringify({
        nip: "BCN-2026-0088",
        fullName: "Calon Pegawai Contoh",
        email: "calon.pegawai@bcn.co.id",
        phone: "081234567890",
        gender: "Laki-laki",
        dateOfBirth: "1998-01-01",
        idCardNumber: "3200000000000099",
        address: "Jl. Contoh No. 1, Bandung",
        department: "Operasional",
        branch: "Cabang Bandung",
        position: "Staff",
        employmentType: "PERMANENT",
        joinDate: "2026-02-01",
        portalRole: "NONE",
      }),
    },
  });

  const target3 = await prisma.user.findUniqueOrThrow({ where: { id: targetForRejected } });
  await prisma.changeRequest.create({
    data: {
      type: "UPDATE",
      status: "APPROVED",
      targetId: targetForRejected,
      requesterId: adminId,
      reviewerId: approver2Id,
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reviewNote: "Disetujui, sesuai dengan pembaruan data kependudukan terbaru.",
      reason: "Pemutakhiran alamat domisili sesuai KTP baru.",
      previousData: JSON.stringify({ address: "Jl. Lama No. 10, Makassar" }),
      payload: JSON.stringify({ address: target3.address }),
    },
  });

  const now = Date.now();
  const auditEntries = [
    { actorId: superAdminId, actorName: "Andra Wibisono", action: "LOGIN_SUCCESS", entityType: "Session", description: "Andra Wibisono berhasil masuk ke sistem", offsetMin: 60 * 24 * 3 },
    { actorId: adminId, actorName: "Siti Rahmawati", action: "LOGIN_SUCCESS", entityType: "Session", description: "Siti Rahmawati berhasil masuk ke sistem", offsetMin: 60 * 24 * 2 },
    { actorId: adminId, actorName: "Siti Rahmawati", action: "REQUEST_SUBMITTED", entityType: "ChangeRequest", entityId: rejectedReq.id, description: "Siti Rahmawati mengajukan Penambahan Pegawai untuk Calon Pegawai Contoh", offsetMin: 60 * 24 * 2 - 5 },
    { actorId: approverId, actorName: "Bambang Kurniawan", action: "LOGIN_SUCCESS", entityType: "Session", description: "Bambang Kurniawan berhasil masuk ke sistem", offsetMin: 60 * 24 * 2 - 20 },
    { actorId: approverId, actorName: "Bambang Kurniawan", action: "REQUEST_REJECTED", entityType: "ChangeRequest", entityId: rejectedReq.id, description: "Bambang Kurniawan menolak pengajuan Penambahan Pegawai dari Siti Rahmawati", offsetMin: 60 * 24 * 2 - 25 },
    { actorId: approver2Id, actorName: "Ratna Puspitasari", action: "REQUEST_APPROVED", entityType: "ChangeRequest", description: "Ratna Puspitasari menyetujui pengajuan Perubahan Data dari Siti Rahmawati", offsetMin: 60 * 24 * 5 },
    { actorId: auditorId, actorName: "Dewi Anggraini", action: "LOGIN_SUCCESS", entityType: "Session", description: "Dewi Anggraini berhasil masuk ke sistem", offsetMin: 60 * 10 },
    { actorId: null, actorName: "Unknown", action: "LOGIN_FAILED", entityType: "Session", description: "Percobaan masuk gagal untuk NIP BCN-2021-0002 (kata sandi salah)", offsetMin: 60 * 8 },
    { actorId: adminId, actorName: "Siti Rahmawati", action: "PASSWORD_CHANGED", entityType: "User", entityId: adminId, description: "Siti Rahmawati memperbarui kata sandi akunnya", offsetMin: 60 * 24 * 7 },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorName: entry.actorName,
        action: entry.action,
        entityType: entry.entityType,
        entityId: (entry as { entityId?: string }).entityId ?? null,
        description: entry.description,
        createdAt: new Date(now - entry.offsetMin * 60 * 1000),
      },
    });
  }

  console.log(`Seed complete: ${roster.length} employees, 4 change requests, ${auditEntries.length} audit entries.`);
  console.log("Demo portal credentials:");
  console.log("  Super Admin -> NIP BCN-2021-0001 / SuperAdmin123");
  console.log("  Admin (Maker) -> NIP BCN-2021-0002 / AdminOps123");
  console.log("  Approver (Checker) -> NIP BCN-2021-0003 / Approver123");
  console.log("  Auditor -> NIP BCN-2021-0004 / Auditor123");
  console.log("  New hire (must change password) -> NIP BCN-2025-0006 / Welcome123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

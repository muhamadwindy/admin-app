import { diffObjects, FIELD_LABEL } from "@/lib/diff";
import { ROLE_LABEL } from "@/lib/rbac";

const VALUE_LABEL: Record<string, string> = {
  PERMANENT: "Tetap",
  CONTRACT: "Kontrak",
  INTERN: "Magang",
  ACTIVE: "Aktif",
  SUSPENDED: "Dibekukan",
  RESIGNED: "Non-aktif",
  ...ROLE_LABEL,
};

function displayValue(v: unknown) {
  if (v === null || v === undefined || v === "") return "—";
  const s = String(v);
  return VALUE_LABEL[s] ?? s;
}

export function DiffTable({
  previousData,
  payload,
}: {
  previousData: string | null;
  payload: string;
}) {
  const before = previousData ? (JSON.parse(previousData) as Record<string, unknown>) : null;
  const after = JSON.parse(payload) as Record<string, unknown>;
  const changes = diffObjects(before, after);

  if (changes.length === 0) {
    return <p className="text-[12.5px] text-ink-400">Tidak ada kolom yang berubah.</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-ink-100">
      <table className="w-full text-left text-[12.5px]">
        <thead>
          <tr className="bg-ink-50 text-[10.5px] uppercase tracking-wider text-ink-400">
            <th className="px-3 py-2 font-semibold">Kolom</th>
            <th className="px-3 py-2 font-semibold">Sebelum</th>
            <th className="px-3 py-2 font-semibold">Sesudah</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr key={c.field} className="border-t border-ink-100">
              <td className="px-3 py-2 font-medium text-ink-600">{FIELD_LABEL[c.field] ?? c.field}</td>
              <td className="px-3 py-2 text-ink-400 line-through decoration-ink-300">{displayValue(c.before)}</td>
              <td className="px-3 py-2 font-medium text-good-700">{displayValue(c.after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

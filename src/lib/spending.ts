import type { Order } from "@/store/shopperSlice";
import { DEPARTMENTS, departmentOf } from "./catalog";

export type MonthSpend = {
  key: string;
  label: string;
  total: number;
  byDepartment: Record<string, number>;
};
export type DepartmentSpend = { department: string; label: string; total: number };

const round = (n: number) => Math.round(n * 100) / 100;

/** Spend per calendar month for the last `months` months, split by department. */
export function monthlySpend(orders: Order[], now: Date, months = 6): MonthSpend[] {
  const buckets: MonthSpend[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-GB", { month: "short" }),
      total: 0,
      byDepartment: Object.fromEntries(DEPARTMENTS.map((dep) => [dep.id, 0])),
    });
  }
  for (const order of orders) {
    const d = new Date(order.createdAt);
    const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (!bucket) continue;
    for (const line of order.lines) {
      const dept = departmentOf(line.category)?.id ?? DEPARTMENTS[0].id;
      const amount = line.unitPrice * line.qty;
      bucket.byDepartment[dept] = round(bucket.byDepartment[dept] + amount);
      bucket.total = round(bucket.total + amount);
    }
  }
  return buckets;
}

export function departmentSpend(orders: Order[]): DepartmentSpend[] {
  const totals = new Map<string, number>();
  for (const order of orders)
    for (const line of order.lines) {
      const dept = departmentOf(line.category)?.id ?? DEPARTMENTS[0].id;
      totals.set(dept, (totals.get(dept) ?? 0) + line.unitPrice * line.qty);
    }
  return DEPARTMENTS.filter((d) => totals.has(d.id))
    .map((d) => ({ department: d.id, label: d.label, total: round(totals.get(d.id)!) }))
    .sort((a, b) => b.total - a.total);
}

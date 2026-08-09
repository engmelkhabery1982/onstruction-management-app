import { BOQHeader, BOQItem, Project } from '../types';

/**
 * Central lookup/calculation layer.
 *
 * Every screen that needs "type a code, get the rest auto-filled" (WIR,
 * Schedule, Cost Control, the new Costs ledger...) calls these same
 * functions instead of re-implementing the same search-and-calculate logic
 * six times. Keeping this in one file means:
 *   - one place to fix a bug or change a formula
 *   - each function is pure (no Supabase calls, no React) so it's trivial
 *     to reason about and test in isolation
 *   - none of this touches any existing screen until a screen explicitly
 *     imports and calls it
 */

/** Find a project by its human-entered code (case-insensitive, trimmed). */
export function findProjectByCode(projects: Project[], projectCode: string): Project | undefined {
  const code = projectCode.trim().toLowerCase();
  if (!code) return undefined;
  return projects.find((p) => p.project_code.trim().toLowerCase() === code);
}

/** Find a BOQ header by its code, optionally scoped to a project. */
export function findBOQHeader(headers: BOQHeader[], boqCode: string, projectId?: string): BOQHeader | undefined {
  const code = boqCode.trim().toLowerCase();
  if (!code) return undefined;
  return headers.find((h) =>
    h.boq_code.trim().toLowerCase() === code && (!projectId || h.project_id === projectId));
}

/** Find a specific BOQ line item by its BOQ code + item code. */
export function findBOQItem(items: BOQItem[], boqCode: string, itemCode: string): BOQItem | undefined {
  const bCode = boqCode.trim().toLowerCase();
  const iCode = itemCode.trim().toLowerCase();
  if (!bCode || !iCode) return undefined;
  return items.find((i) =>
    i.boq_code.trim().toLowerCase() === bCode && i.item_code.trim().toLowerCase() === iCode);
}

/** Total value of one BOQ line item: quantity × unit rate. */
export function calcItemTotal(item: Pick<BOQItem, 'quantity' | 'unit_rate'>): number {
  return (item.quantity || 0) * (item.unit_rate || 0);
}

/** Sum of all line-item totals under one BOQ code — this is the BOQ's total value. */
export function sumBOQValue(items: BOQItem[], boqCode: string): number {
  const code = boqCode.trim().toLowerCase();
  return items
    .filter((i) => i.boq_code.trim().toLowerCase() === code)
    .reduce((sum, i) => sum + calcItemTotal(i), 0);
}

/** Sum of every BOQ's value for a given project — feeds "Total Project Value". */
export function sumProjectBOQValue(headers: BOQHeader[], items: BOQItem[], projectId: string): number {
  const boqCodes = headers.filter((h) => h.project_id === projectId).map((h) => h.boq_code);
  return boqCodes.reduce((sum, code) => sum + sumBOQValue(items, code), 0);
}

/**
 * WIR completion %: executed quantity × unit rate, divided by the BOQ
 * item's total quantity × unit rate. Returns 0–100, or 0 if the item
 * can't be resolved / has no value.
 */
export function calcWIRCompletionPercent(executedQuantity: number, boqItem: BOQItem | undefined): number {
  if (!boqItem) return 0;
  const totalValue = calcItemTotal(boqItem);
  if (totalValue <= 0) return 0;
  const executedValue = (executedQuantity || 0) * (boqItem.unit_rate || 0);
  return Math.min(100, Math.max(0, (executedValue / totalValue) * 100));
}

/** Convenience bundle returned when a BOQ item is resolved, ready to spread into a row. */
export interface BOQItemLookupResult {
  item_name: string;
  description: string;
  unit: string;
  quantity: number;
  unit_rate: number;
  amount: number;
}

export function resolveBOQItemFields(item: BOQItem | undefined): BOQItemLookupResult | undefined {
  if (!item) return undefined;
  return {
    item_name: item.item_name,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    unit_rate: item.unit_rate,
    amount: calcItemTotal(item),
  };
}

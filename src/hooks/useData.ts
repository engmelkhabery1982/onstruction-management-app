import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Project, Task, Cost, Procurement, Safety, ProgressEntry,
  Schedule, Contract, BOQItem, CashFlowEntry, SubcontractorInvoice,
  ClientInvoice, Variation, DocumentEntry, WIREntry,
} from '@/types';

export function useData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [procurement, setProcurement] = useState<Procurement[]>([]);
  const [safety, setSafety] = useState<Safety[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [subInvoices, setSubInvoices] = useState<SubcontractorInvoice[]>([]);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [wirEntries, setWirEntries] = useState<WIREntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [
      p, t, c, pr, s, pg, sc, ct, bq, cf, si, ci, va, dc, wr,
    ] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('costs').select('*').order('created_at', { ascending: false }),
      supabase.from('procurement').select('*').order('created_at', { ascending: false }),
      supabase.from('safety').select('*').order('created_at', { ascending: false }),
      supabase.from('progress_entries').select('*').order('created_at', { ascending: false }),
      supabase.from('schedules').select('*').order('created_at', { ascending: false }),
      supabase.from('contracts').select('*').order('created_at', { ascending: false }),
      supabase.from('boq_items').select('*').order('created_at', { ascending: false }),
      supabase.from('cash_flow').select('*').order('created_at', { ascending: false }),
      supabase.from('subcontractor_invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('client_invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('variations').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
      supabase.from('wir_entries').select('*').order('created_at', { ascending: false }),
    ]);

    setProjects(p.data || []);
    setTasks(t.data || []);
    setCosts(c.data || []);
    setProcurement(pr.data || []);
    setSafety(s.data || []);
    setProgress(pg.data || []);
    setSchedules(sc.data || []);
    setContracts(ct.data || []);
    setBoqItems(bq.data || []);
    setCashFlow(cf.data || []);
    setSubInvoices(si.data || []);
    setClientInvoices(ci.data || []);
    setVariations(va.data || []);
    setDocuments(dc.data || []);
    setWirEntries(wr.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  return {
    projects, tasks, costs, procurement, safety, progress, schedules,
    contracts, boqItems, cashFlow, subInvoices, clientInvoices, variations,
    documents, wirEntries, loading, reload: loadAll,
  };
}

#!/usr/bin/env bash
set -e
echo "== 1) تأكيد إننا في جذر الريبو الصح =="
if [ ! -d ".git" ]; then echo "ERROR: شغّل السكريبت من جذر الريبو (فيه .git)"; exit 1; fi

echo "== 2) شيل .env من تتبع git (الملف المحلي هيفضل عندك) =="
git rm --cached .env 2>/dev/null || echo ".env مش متتبع أصلاً، تخطينا الخطوة"

echo "== 3) شيل نسخة project-bolt-sb1-ub4r8edu المكررة =="
git rm -r --cached project-bolt-sb1-ub4r8edu 2>/dev/null || true
rm -rf project-bolt-sb1-ub4r8edu

echo "== 4) شيل الملفات المكررة في الجذر (النسخة الحقيقية والوحيدة في project/) =="
ROOT_DUPES=(
  App.tsx BOQView.tsx CashFlowView.tsx ClientInvoicesView.tsx ContractsView.tsx
  CostsView.tsx Dashboard.tsx DocumentsView.tsx ProcurementView.tsx ProgressView.tsx
  ProjectsView.tsx SafetyView.tsx ScheduleView.tsx Sidebar.tsx SpreadsheetGrid.tsx
  SubInvoicesView.tsx TasksView.tsx VariationsView.tsx WIRView.tsx
  excel.ts index.css index.html main.tsx supabaseClient.ts types.ts
  vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json
  package.json package-lock.json config.json prompt
  20260807071805_create_projects_and_tasks.sql
  20260807072734_alter_projects_tasks_add_columns.sql
  20260807072748_create_costs_procurement_safety_progress_tables.sql
  20260808052403_create_schedule_contracts_boq_wir_cashflow_invoices_variations_documents.sql
)
for f in "${ROOT_DUPES[@]}"; do
  if [ -f "$f" ]; then
    git rm --cached "$f" 2>/dev/null || true
    rm -f "$f"
  fi
done

echo "== 5) تأكيد الحالة =="
git status
echo ""
echo "لو الملفات اللي فوق ظاهرة تحت 'Changes to be committed' كـ deleted → تمام، كمّل للخطوة الجاية."

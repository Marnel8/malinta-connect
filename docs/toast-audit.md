# Toast Audit — 17 Nov 2025

This inventory captures every `toast()` usage in the project to guide the consistency work.

| Area | File | Cases | Notes |
| --- | --- | --- | --- |
| Auth | `app/(auth)/forgot-password/page.tsx` | 2 | Success/error messages share same copy across flows. |
| Auth | `app/(auth)/register/page.tsx` | 8 | Multiple validation failures surface raw `error.message`. |
| Admin | `app/admin/page.tsx` | 14 | Dashboard fetch + cards use generic “Error”/“Success” strings, no variants. |
| Admin | `app/admin/settings/page.tsx` | 16 | Extensive CRUD toasts, some empty descriptions, some Firebase error leakage. |
| Admin | `app/admin/blotter/page.tsx` | 15 | Mixed success/error text, inconsistent capitalization. |
| Admin | `app/admin/appointments/page.tsx` | 10 | Uses default variant for all cases. |
| Admin | `app/admin/archives/page.tsx` | 6 | Uses default variant. |
| Admin | `components/admin/certificate-generator-modal.tsx` | 5 | Surfaces raw storage error details. |
| Admin | `components/admin/resident-verification-modal.tsx` | 2 | Lacks descriptive text. |
| Admin | `components/admin/admin-sidebar.tsx` | 2 | Triggered on logout/failure, default styling. |
| Sites | `app/(sites)/appointments/page.tsx` | 12 | Shows Firebase error text for booking failures. |
| Sites | `app/(sites)/blotter/page.tsx` | 9 | Only default styling. |
| Sites | `app/(sites)/events/page.tsx` | 4 | Missing success variant. |
| Admin/Sites Shared | `app/(sites)/appointments/page.tsx`, `app/admin/appointments/page.tsx` | — | Both read from shared server actions that forward Firebase messages. |

All remaining toast imports in the repo map back to the files listed above.


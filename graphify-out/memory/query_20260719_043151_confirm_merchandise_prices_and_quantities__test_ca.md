---
type: "query"
date: "2026-07-19T04:31:51.384718+00:00"
question: "Confirm merchandise prices and quantities, test Carlin order flow, admin quantity updates, server-side security, database ping, email, and Vercel deployment behavior"
contributor: "graphify"
outcome: "useful"
source_nodes: ["merchandiseReservationStore.ts", "AdminSiteContentPage.tsx", "MerchandiseStorePage.tsx", "orders.ts", "inventory.ts", "merchandiseInventory.ts"]
---

# Q: Confirm merchandise prices and quantities, test Carlin order flow, admin quantity updates, server-side security, database ping, email, and Vercel deployment behavior

## Answer

Expanded from original query via vocab: [merchandise, reservation, inventory, admin, orders, receipt, supabase, quantity]. Traversed merchandiseReservationStore.ts, MerchandiseStorePage.tsx, AdminSiteContentPage.tsx, api merchandise/admin routes, and SQL seed. Found server-side pricing via normalized order payload and Supabase RPC unit_price_usd, added pingMerchandiseDatabase health path, added authenticated admin inventory quantity PATCH, and verified local spoofed zero-price order still totals 40 for MERCH-020. Live Supabase/Vercel verification was blocked by non-resolving configured Supabase host and missing local SMTP credentials/project linkage.

## Outcome

- Signal: useful

## Source Nodes

- merchandiseReservationStore.ts
- AdminSiteContentPage.tsx
- MerchandiseStorePage.tsx
- orders.ts
- inventory.ts
- merchandiseInventory.ts
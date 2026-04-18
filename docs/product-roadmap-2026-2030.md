# Widing Self Storage — Product Roadmap 2026–2030

> **Platform:** Back-office SaaS for multi-branch self-storage operations in Thailand  
> **Tech Stack:** Next.js 15 (App Router) · Supabase (PostgreSQL) · Vercel  
> **Business Model:** Owned + Partner + Franchise branches across Bangkok  
> **Document date:** April 2026 · Version 1.0

---

## Executive Summary

Widing is evolving from an internal operations tool into a full-stack self-storage platform serving staff, franchise partners, and customers directly. Over five years, the roadmap moves through four distinct phases:

| Phase | Years | Theme |
|-------|-------|-------|
| **I — Stabilise** | 2026 | Complete migration, unify legacy + new systems, ship customer portal |
| **II — Scale** | 2027 | Digital customer journey, franchise tools, smart automation |
| **III — Intelligent** | 2028 | AI pricing, demand forecasting, predictive renewals |
| **IV — Platform** | 2029–2030 | API marketplace, IoT, multi-country expansion |

---

## Baseline — Current State (April 2026)

### Infrastructure
- **Next.js 15** App Router deployed on Vercel (auto-deploy on push to `main`)
- **Supabase** PostgreSQL backend with 9 tables, Row Level Security, indexed queries
- **4 active branches**: Sukhumvit, Nawamin, Bangna, Ratchada (~2,800 m² total)
- **Branch types supported**: Owned · Partner · Franchise

### Legacy Modules (Operational)
| Module | Status |
|--------|--------|
| Booking Management (Kanban + List) | ✅ Live |
| Flexible Space Allocations | ✅ Live |
| Client CRM | ✅ Live |
| Financial Transactions | ✅ Live |
| Delivery Planning | ✅ Live |
| Branch Management | ✅ Live |
| Booking Calendar | ✅ Live |
| Legacy Spaces Inventory | ✅ Live |
| Recent Activity (Audit Log) | ✅ Live |
| Dashboard | ✅ Live |

### New Modules (Rolling Out Q1–Q2 2026)
| Module | Status |
|--------|--------|
| Unit Inventory (DocumentBox + StorageSpace) | 🔄 Rolling out |
| Floor Plan 2D Viewer | 🔄 Rolling out |
| Unit Detail & Status Management | 🔄 Rolling out |
| Unit Creation Form | 🔄 Rolling out |
| Unified Order Management | 🔄 Rolling out |
| API `GET/POST /api/units` | ✅ Live |
| API `PATCH /api/units/[id]` | ✅ Live |
| Supabase DB layer (all entities) | ✅ Live |

### Data Model (as of April 2026)
```
branches       → 4 locations, capacity & commission tracking
clients        → 6+ active, Thai/English names, social contacts, address
units          → 12+ (DocumentBox ฿150/mo · StorageSpace ฿3,200–฿12,800/mo)
orders         → 6+ (Storage & Delivery, 7-status workflow)
bookings       → Legacy pick-up/return workflow (29 fields)
allocated_spaces → Bulk sqm rentals with billing cycles
transactions   → FullAmount, Subscription, Refund, ExtensionFee, DeliveryOnly
delivery_options → Provider selection, vehicle assignments
platform_activities → Full audit trail
```

---

## Phase I — Stabilise (2026)

*Theme: Complete the legacy-to-new migration, ship customer-facing surfaces, harden the data layer.*

### Q1 2026 — Migration Completion
**Priority:** Critical

| Feature | Description | Module |
|---------|-------------|--------|
| ✅ Supabase DB layer | All 9 tables wired, `@/lib/db` replaces `@/lib/data` mock layer | Infrastructure |
| ✅ Unit Inventory page | DocumentBox + StorageSpace list with 6 stats cards | Units |
| ✅ Floor Plan 2D | Per-branch interactive grid, 5-status color coding, clickable cells | Units |
| ✅ Unit Detail page | Inline status editor, billing cycle, client card, PATCH API | Units |
| ✅ Unit Creation form | Type selector, auto-sqm, price suggestion, form validation | Units |
| ✅ Order List page | Unified Storage + Delivery table, 7 statuses, 5 stats cards | Orders |
| Migrate Bookings → Orders | Map legacy `Booking` records to new `Order` entity; run backfill SQL | Data |
| Migrate Spaces → Units | Copy legacy `Space` records into `units` table; deprecate `/spaces` | Data |

### Q2 2026 — Order Workflow & e-Contract
**Priority:** High

| Feature | Description | Module |
|---------|-------------|--------|
| Order Create — Step 1 | Service type selector (Storage / Delivery) with sub-type cards | Orders |
| Order Create — Step 2 | Client lookup + address form + unit assignment | Orders |
| Order Create — Step 3 | Payment cycle (Monthly/Annual), summary, staff notes, submit | Orders |
| Order Detail page | Full order view — client, unit, items, billing, status history | Orders |
| Order Status transitions | UI buttons: Confirm, Activate, Mark Complete, Cancel | Orders |
| **e-Contract generation** | PDF contract from order data — client name, unit ID, rate, dates | Orders |
| e-Contract send via email/LINE | Send generated PDF to client email or LINE OA | Orders |
| e-Contract signed status | Staff marks as Signed after receiving confirmation | Orders |
| Assign Unit to Order | Unit picker inside Order form; locks unit to Occupied status | Orders/Units |

### Q3 2026 — Client Portal (v1) & Payments
**Priority:** High

| Feature | Description | Module |
|---------|-------------|--------|
| **Customer-facing portal** `/customer` | Separate route, no back-office nav, branded Widing theme | Portal |
| Customer login (Supabase Auth) | Magic link / LINE OAuth so clients can log in | Auth |
| Customer dashboard | Active orders, upcoming due dates, payment history | Portal |
| Online payment — PromptPay QR | Generate QR from order amount, staff confirms receipt | Payments |
| Online payment — Credit Card | Integrate 2C2P or Omise for card-based checkout | Payments |
| Payment receipt automation | Auto-generate PDF receipt on confirmed payment | Payments |
| Renewal reminder flow | 30/14/7-day email + LINE push before billing cycle end | Notifications |
| Customer order history | All past orders + status per customer | Portal |
| **Client Profile v2** | nameEn, nickname, lineId, facebook, instagram, originLocationType, floor, hasElevator, preferredPaymentCycle | Clients |

### Q4 2026 — Reporting & Partner Commission
**Priority:** Medium

| Feature | Description | Module |
|---------|-------------|--------|
| Revenue dashboard | Monthly revenue chart, by branch/type breakdown, MoM comparison | Dashboard |
| Occupancy rate dashboard | Unit fill rate per branch, available-vs-occupied trend | Dashboard |
| Partner payout report | Auto-calculate commission (commissionRatePercent × revenue) per partner branch | Branches |
| Partner payout PDF | Exportable monthly payout statement for franchise/partner owners | Branches |
| Transaction export (CSV) | Date-range filter → CSV download for accounting | Transactions |
| Booking analytics | Avg lead time, cancel rate, peak days heatmap | Dashboard |
| Branch capacity alerts | Notify staff when branch > 90% occupied | Notifications |

---

## Phase II — Scale (2027)

*Theme: Digital customer acquisition funnel, franchise owner tools, operational automation.*

### Q1 2027 — LINE OA Integration & CRM Upgrade
| Feature | Description |
|---------|-------------|
| **LINE Official Account bot** | Auto-reply to storage inquiries, send QR codes, renewal reminders via LINE Messaging API |
| LINE login for customer portal | One-tap login with LINE OAuth |
| Client 360 view | Combined view: orders + allocations + transactions + activity timeline per client |
| CRM pipeline (Leads) | Add `Prospect` workflow — web form → staff review → convert to client |
| Client communication log | Track all LINE/email/phone contacts per client |
| Bulk SMS / LINE broadcast | Target clients by status (AwaitingRenewal, Churned last 90 days) |
| Customer NPS survey | Auto-send 30 days after order activation, store score in DB |
| Client tags & custom fields | Staff can tag clients (VIP, Corporate, Student, etc.) |

### Q2 2027 — Franchise & Multi-Branch Tools
| Feature | Description |
|---------|-------------|
| **Franchise owner dashboard** | Separate login role, sees only own branch data (RLS scoped by branch_id) |
| Franchise revenue report | Monthly summary: occupancy %, revenue collected, commission owed to Widing |
| Franchise KPI scorecard | Occupancy rate, avg renewal rate, customer satisfaction score |
| Branch inventory sync | Staff at one branch can transfer unit between branches (status workflow) |
| Multi-branch staff assignment | `staff_id` field on orders + bookings, per-branch access control |
| Branch document upload | Upload lease agreements, permits, floor plan images per branch |
| Inter-branch transfer order | Client moves storage from Branch A → Branch B with automatic unit reassignment |

### Q3 2027 — Smart Pricing Engine
| Feature | Description |
|---------|-------------|
| **Dynamic pricing rules** | Set price rules: base rate + modifier by zone, floor, size, duration |
| Seasonal pricing | Admin sets % markup for high-demand periods (e.g. Songkran move season) |
| Annual discount automation | Auto-apply discount (e.g. 10% off) for Annual payment cycle |
| Volume discount for DocumentBoxes | Price tiers: 1–5 boxes = ฿150, 6–20 = ฿130, 21+ = ฿110 |
| Price history per unit | Audit trail of every rate change with date and staff who changed it |
| Rate comparison view | Staff sees competitor rates from nearby areas (manual input table) |
| Quote generator | Staff enters client requirements → system outputs pricing options with breakdown |

### Q4 2027 — Delivery & Logistics Upgrade
| Feature | Description |
|---------|-------------|
| **Driver app (mobile web)** | Simplified mobile UI for delivery drivers: job list, route, item checklist |
| Delivery photo capture | Driver takes before/after photos; attached to order via Supabase Storage |
| Real-time delivery status | Driver updates status via mobile → auto-pushes to customer portal |
| Route optimization | Input multiple stops → suggest optimized route (Google Maps Directions API) |
| Third-party logistics API | Integrate Flash Express or Kerry API for automated shipping quotes |
| Delivery calendar | View all deliveries per day across branches, drag-drop rescheduling |
| Item barcode scanning | Scan box labels with phone camera; reconcile against order item list |

---

## Phase III — Intelligent (2028)

*Theme: AI-powered predictions, automated workflows, data-driven operations.*

### Q1 2028 — Predictive Analytics & AI Pricing
| Feature | Description |
|---------|-------------|
| **Demand forecasting** | ML model trained on occupancy history → predict unit availability 60 days ahead |
| Churn prediction | Score each client on renewal probability; alert staff for at-risk accounts |
| Optimal pricing suggestion | AI recommends monthly rate per unit based on demand forecast + competitor pricing |
| Revenue projection dashboard | Forecast next 3/6/12 months based on active orders + historical renewal rates |
| Occupancy heatmap (time-series) | Visualize occupancy% over time, by branch, per unit type |
| What-if analysis | Simulate revenue impact of pricing change or new branch opening |

### Q2 2028 — Automated Workflows & Smart Notifications
| Feature | Description |
|---------|-------------|
| **Workflow automation engine** | Rules-based automation: "When order status = AwaitingReturn AND 3 days elapsed → send reminder" |
| Auto-renew orders | Client pre-authorizes renewal; system auto-charges + extends on billing date |
| Dunning management | Overdue payment escalation: Day 1 reminder → Day 7 second notice → Day 14 staff action |
| Smart renewal suggestions | Before cycle end, system suggests renew vs. upgrade (bigger unit) based on usage |
| Maintenance scheduler | Schedule unit maintenance windows; auto-set status to Maintenance + notify affected clients |
| Automated invoice generation | Invoice auto-created 5 days before billing date; PDF sent to client |
| Auto-release trigger | If payment not received after 30-day grace period, initiate release workflow |

### Q3 2028 — Document Intelligence
| Feature | Description |
|---------|-------------|
| **Document box catalogue** | Clients tag document boxes with metadata (category, year, description) via customer portal |
| Document retrieval request | Client requests specific box retrieval → creates delivery order automatically |
| OCR label scanning | Staff scans printed box labels; auto-populates item fields in order |
| Document storage analytics | Track retention periods, flag boxes approaching legal destruction deadline |
| Digital archive index | Searchable index of stored documents per client (no file upload — just metadata) |
| Chain of custody log | Every box movement recorded: who accessed, when, what purpose |

### Q4 2028 — API Platform & Integrations
| Feature | Description |
|---------|-------------|
| **Public API v1** | RESTful API with API keys for franchise partners to query their own data |
| Webhook system | Fire events (order.created, payment.received, unit.status_changed) to partner endpoints |
| Accounting integration | Export to QuickBooks / Xero / FlowAccount via API or CSV |
| Real estate portal integration | Embed unit availability widget on external property / moving websites |
| e-Signature integration | DocuSign or DotSign for digital contract signing without printing |
| LINE LIFF mini-app | Customer portal embedded inside LINE as a LIFF app (no separate browser needed) |

---

## Phase IV — Platform (2029–2030)

*Theme: Market leadership, enterprise features, Southeast Asia expansion.*

### 2029 — IoT & Physical Layer

| Feature | Description |
|---------|-------------|
| **Smart lock integration** | NFC/PIN-code locks per unit; customer uses app to unlock — no key needed |
| Access log from locks | Every unit open/close recorded; visible in platform activity log |
| Climate sensors | Temperature & humidity sensors per floor/zone; alert if outside safe range |
| Security camera integration | CCTV metadata (motion events) linked to unit access records |
| Power/outlet monitoring | Track electricity usage for heated or air-conditioned units (premium pricing) |
| Smart entrance gate | Customer QR code at facility gate; integration with existing CCTV/intercom systems |
| Asset tracker for boxes | QR/RFID labels on boxes; scan to verify correct unit placement |
| Maintenance IoT alerts | Door sensor detects broken lock or unit inaccessible → auto-creates maintenance order |

### 2029 — Enterprise & White-label

| Feature | Description |
|---------|-------------|
| **White-label tenant system** | Full white-label version: custom domain, custom branding, own Supabase project per franchise group |
| Role-based access control (RBAC) | Roles: Super Admin · Branch Manager · Staff · Delivery Driver · Finance · Franchise Owner · Customer |
| SSO / SAML integration | Enterprise clients with corporate identity providers can SSO into customer portal |
| Multi-currency support | USD/SGD/MYR for future international branches alongside THB |
| Tax & withholding management | Auto-calculate VAT (7%), withholding tax for partner payouts, generate ภ.พ.30 summaries |
| SLA monitoring | Track response times, resolution rates for maintenance requests |
| Data export & PDPA compliance tools | One-click data export per client (PDPA Article 63 right to data portability) |
| Audit log export | 7-year immutable audit trail export for regulatory compliance |

### 2030 — Southeast Asia Expansion

| Feature | Description |
|---------|-------------|
| **Multi-country backend** | Separate Supabase schemas per country with shared platform codebase |
| Localization framework | i18n: Thai 🇹🇭 · English 🇬🇧 · Vietnamese 🇻🇳 · Malay 🇲🇾 (start with TH + EN) |
| Country-specific tax rules | Pluggable tax engine per country (GST, VAT, SST) |
| Cross-border logistics | International moving service order type (document customs info, insurance) |
| Franchise marketplace | Operators can discover + onboard Widing-certified franchise locations via in-app map |
| Storage insurance marketplace | Embedded insurance quotes (Allianz, AXA) per order based on declared item value |
| Customer mobile app (iOS/Android) | Native app via React Native / Expo with camera, push notifications, smart lock control |
| **Widing Partner Network** | B2B marketplace — moving companies, cleaning services, packaging suppliers list & receive referrals via platform |

---

## Feature Priority Matrix

| Feature | Year | Impact | Effort | Priority |
|---------|------|--------|--------|---------|
| e-Contract generation | 2026 Q2 | ⬆⬆⬆ | Medium | 🔴 Critical |
| Customer portal + LINE login | 2026 Q3 | ⬆⬆⬆ | High | 🔴 Critical |
| Online payment (PromptPay + Card) | 2026 Q3 | ⬆⬆⬆ | High | 🔴 Critical |
| Renewal reminder automation | 2026 Q3 | ⬆⬆⬆ | Low | 🔴 Critical |
| Partner payout report | 2026 Q4 | ⬆⬆ | Low | 🟠 High |
| LINE OA bot integration | 2027 Q1 | ⬆⬆⬆ | Medium | 🟠 High |
| Dynamic pricing rules | 2027 Q3 | ⬆⬆ | Medium | 🟠 High |
| Franchise owner dashboard | 2027 Q2 | ⬆⬆⬆ | Medium | 🟠 High |
| Driver mobile app | 2027 Q4 | ⬆⬆ | High | 🟡 Medium |
| Churn prediction AI | 2028 Q1 | ⬆⬆ | High | 🟡 Medium |
| Auto-renew orders | 2028 Q2 | ⬆⬆⬆ | Medium | 🟠 High |
| Smart lock IoT | 2029 | ⬆⬆ | Very High | 🟢 Long-term |
| Multi-country expansion | 2030 | ⬆⬆⬆ | Very High | 🟢 Long-term |

---

## Unit Economics Reference

> *Pricing tiers as of 2026 — inform roadmap feature decisions*

### DocumentBox
| SKU | Rate | Use case |
|-----|------|----------|
| 1 box | ฿150/mo | Individual / household |
| 6–20 boxes | ฿130/mo each | Small business |
| 21+ boxes | ฿110/mo each | Corporate archive |

### StorageSpace
| Size | Rate | Use case |
|------|------|----------|
| ≤ 4 m² | ฿3,200/mo | Condo overflow, small items |
| ≤ 9 m² | ฿7,200/mo | Full room contents |
| ≤ 16 m² | ฿12,800/mo | SME inventory or furniture |
| > 16 m² | Custom quote | Enterprise / bulk |

### Delivery Services
| Type | Use case |
|------|----------|
| PickupAndStore | Move items from client location into storage |
| ReturnDelivery | Deliver stored items back to client |
| MovingService | Full relocation (origin → destination, no storage) |

---

## Technical Roadmap

### 2026 — Foundation
- [ ] Migrate all pages from `@/lib/data` (mock) to `@/lib/db` (Supabase)
- [ ] Add Supabase Auth (magic link + LINE OAuth)
- [ ] Supabase Storage for document/photo uploads
- [ ] Row-Level Security policies scoped by user role and branch_id
- [ ] Edge Function for PDF generation (e-contracts, invoices, receipts)
- [ ] Vercel Edge Config for feature flags (roll features per branch)

### 2027 — Growth
- [ ] LINE Messaging API webhook (Supabase Edge Function)
- [ ] 2C2P or Omise payment gateway SDK
- [ ] Google Maps Directions API for route optimization
- [ ] Push notifications via Supabase Realtime + web push
- [ ] Role-based access: franchise owner vs. staff vs. admin
- [ ] Supabase cron jobs for automated billing reminders

### 2028 — Intelligence
- [ ] Analytics database (read replica or separate analytics schema)
- [ ] Python ML service (FastAPI on Railway/Render) for churn + demand models
- [ ] Webhook event bus for integrations (Zapier / Make compatible)
- [ ] Public API v1 with API key authentication (Supabase `apikey` header)
- [ ] FlowAccount / Xero accounting export

### 2029–2030 — Platform
- [ ] React Native / Expo mobile app (share core logic with Next.js)
- [ ] Multi-tenant architecture (separate schemas or separate Supabase projects per franchise group)
- [ ] i18n with `next-intl` (TH + EN as MVP)
- [ ] IoT bridge service (MQTT → Supabase Realtime for smart locks)
- [ ] PDPA-compliant data deletion workflows
- [ ] SOC 2 compliance documentation

---

## Risks & Dependencies

| Risk | Mitigation |
|------|-----------|
| Legacy booking data not migrating cleanly to new `orders` schema | Write reversible SQL migration scripts; keep legacy `bookings` table permanently for historical records |
| Thai tax API changes (e-Tax invoice mandate 2027) | Monitor Revenue Department announcements; build pluggable tax engine from day one |
| LINE API rate limits for broadcast | Use Message Segments wisely; implement queuing via Supabase Edge Functions |
| Franchise owner data isolation | Enforce RLS from day one; audit quarterly; franchise owners must never see competitor branch data |
| IoT hardware standardisation | Pilot one smart lock brand (e.g. igloohome) before committing to full fleet |
| Payment gateway PCI compliance | Use hosted payment pages (2C2P / Omise) — never store raw card data on Widing servers |

---

## KPIs by Phase

### Phase I (2026)
- 100% pages migrated from mock → Supabase live data
- Customer portal launched with ≥1 active client self-serving
- Online payment enabled across all branches
- Zero manual PDF contract printing

### Phase II (2027)
- LINE bot handles ≥30% of new storage inquiries without staff intervention
- Franchise owners log in independently for their monthly payout reports
- Average renewal rate ≥ 85% (up from estimated 70% with no reminder system)

### Phase III (2028)
- Churn prediction model accuracy ≥ 75% (30-day window)
- Automated billing covers ≥60% of monthly renewals (auto-renew enrolled clients)
- Revenue per available unit (RevPAU) up ≥15% from dynamic pricing

### Phase IV (2029–2030)
- ≥3 cities / ≥10 franchise partners live on the platform
- Customer mobile app DAU ≥ 50% of active client base
- Platform revenue from API / white-label ≥ 20% of total company revenue

---

*Last updated: April 2026 · Maintained by Widing Product Team*

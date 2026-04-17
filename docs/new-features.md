# ฟีเจอร์ใหม่ (New Features) — Widing Platform v2

> เอกสารนี้สรุปฟีเจอร์ใหม่ที่เพิ่มเข้ามาในระบบ Widing Platform ช่วง Q1–Q2 2026
> ฟีเจอร์ทั้งหมดนี้เป็นส่วนเพิ่มเติมจาก Legacy Back Office และเน้นที่การจัดการ Order, Unit Inventory และ Floor Plan
> ภาษาที่ใช้ในเอกสาร: ภาษาไทย

---

## สารบัญ

1. [Order Management — จัดการคำสั่งงาน](#1-order-management--จัดการคำสั่งงาน)
2. [Unit Inventory — คลังยูนิต](#2-unit-inventory--คลังยูนิต)
3. [Floor Plan 2D — แผนผังสาขา](#3-floor-plan-2d--แผนผังสาขา)
4. [Unit Detail — ข้อมูลยูนิต](#4-unit-detail--ข้อมูลยูนิต)
5. [Client Profile v2 — โปรไฟล์ลูกค้าปรับปรุง](#5-client-profile-v2--โปรไฟล์ลูกค้าปรับปรุง)
6. [API — Units Endpoint](#6-api--units-endpoint)

---

## 1. Order Management — จัดการคำสั่งงาน

### ภาพรวม
ระบบ Order Management ใหม่แทนที่ Booking เดิม รองรับทั้ง Storage และ Delivery order ในระบบเดียว มีโครงสร้างข้อมูลที่ชัดเจนและ flow ที่สมบูรณ์กว่าเดิม

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| OM01 | หน้ารายการ Orders | ตารางแสดง order ทั้งหมด กรองตาม serviceType (Storage/Delivery) |
| OM02 | สร้าง Order ใหม่ | ฟอร์มสร้าง order: เลือกประเภทบริการ, subtype, ข้อมูลลูกค้า, รายละเอียดสินค้า |
| OM03 | Service Type — Storage | Order ประเภทฝากเก็บ: รองรับ DocumentBox หรือ StorageSpace |
| OM04 | Service Type — Delivery | Order ประเภทขนส่ง: PickupAndStore, ReturnDelivery, MovingService |
| OM05 | Payment Cycle | เลือกรอบชำระ: รายเดือน (Monthly) หรือ รายปี (Annual) |
| OM06 | Order Status Flow | 7 สถานะ: Draft → Pending → Confirmed → Active → AwaitingReturn → Completed / Cancelled |
| OM07 | เชื่อม Unit กับ Order | ระบุ branchId, unitId, unitIdentifier เมื่อ assign unit ให้ order |
| OM08 | ข้อมูลลูกค้าครบครัน | บันทึก: ชื่อ, เบอร์, อีเมล, LINE ID, Facebook, ที่อยู่บริการ, ชั้น, มีลิฟต์ |
| OM09 | ข้อมูลสินค้า | ระบุ: คำอธิบายสินค้า, หมวดหมู่, ปริมาณ (กล่อง/ตร.ม./ชิ้น) |
| OM10 | ระยะเวลาฝาก | ระบุ storageDuration, storageEndDate |
| OM11 | ราคาและค่าบริการ | บันทึก monthlyRate, firstMonthTotal, commissionRate สำหรับ agent/staff |
| OM12 | e-Contract Status | ติดตามสถานะสัญญาอิเล็กทรอนิกส์: Draft, Sent, Signed |
| OM13 | Staff Assignment | ระบุ saleStaffId/Name ที่รับผิดชอบ order |

### เกณฑ์การยอมรับ

- **OM02:** ฟอร์มบังคับ: serviceType, clientName, clientPhone, serviceAddress, itemsDescription, serviceDate
- **OM03:** ถ้า storageSubType = DocumentBox ต้องระบุจำนวน quantity (กล่อง)
- **OM03:** ถ้า storageSubType = StorageSpace ต้องระบุขนาดหรือ desiredWidthSqm × desiredLengthSqm
- **OM05:** ถ้าเลือก Annual ต้อง auto-calculate firstMonthTotal = monthlyRate × 12
- **OM06:** การเปลี่ยนสถานะต้องเป็นไปตาม flow (ไม่ข้ามขั้นตอน)
- **OM07:** เมื่อ assign unit → Unit.status ต้องเปลี่ยนเป็น Occupied หรือ Reserved
- **OM12:** เมื่อ e-Contract Signed → Order status ต้องเปลี่ยนเป็น Confirmed อัตโนมัติ

---

## 2. Unit Inventory — คลังยูนิต

### ภาพรวม
ระบบจัดการ inventory ยูนิตในคลัง แยกประเภทชัดเจนระหว่าง กล่องเอกสาร (DocumentBox) และ พื้นที่จัดเก็บ (StorageSpace) พร้อมข้อมูลครบถ้วนต่อ unit

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| UI01 | รายการยูนิตทั้งหมด | ตารางแสดงยูนิตทุกอัน ทุกสาขา พร้อม: identifier, ประเภท, ขนาด, zone, ชั้น, สถานะ, ลูกค้า, ราคา |
| UI02 | สถิติ Unit Summary | Summary Cards: ยูนิตทั้งหมด, ว่าง, มีผู้เช่า, สำรอง, ซ่อมบำรุง, รายได้/เดือน |
| UI03 | แยกประเภท DocBox vs Space | Summary Cards แยก DocumentBox กับ StorageSpace พร้อมจำนวนและราคาเฉลี่ย |
| UI04 | Branch Floor Plan Links | ลิงก์ด่วนไปยัง Floor Plan 2D ของแต่ละสาขา |
| UI05 | 5 สถานะยูนิต | Available (ว่าง), Occupied (มีผู้เช่า), Reserved (สำรอง), Maintenance (ซ่อมบำรุง), AwaitingRenewal (รอต่อสัญญา) |
| UI06 | เพิ่มยูนิตใหม่ | ปุ่ม "+ เพิ่มยูนิต" ลิงก์ไปยังหน้าสร้างยูนิต |
| UI07 | จัดการยูนิตรายชิ้น | ปุ่ม "จัดการ" ต่อ row ลิงก์ไปยังหน้า Unit Detail |
| UI08 | วันครบกำหนด Billing | แสดง billingCycleEndDate แต่ละยูนิต (format: DD MMM) |
| UI09 | รายได้รายเดือนรวม | คำนวณ revenue = sum ของ monthlyRate ที่ status = Occupied |
| UI10 | Unit Identifier Format | รูปแบบ identifier ชัดเจน: BOX-{Zone}-{Number} / SPC-{Zone}-{Number} |

### เกณฑ์การยอมรับ

- **UI01:** ต้องแสดง unit ทุกอันจากทุกสาขา (getUnits() ไม่ระบุ branchId)
- **UI02:** ตัวเลขทุก card ต้อง derive มาจาก unit array จริง ไม่ใช่ hardcode
- **UI05:** AwaitingRenewal ต้องแสดงด้วย badge สีเหลือง เพื่อให้เห็นเด่นจาก Available
- **UI08:** ถ้า billingCycleEndDate = null ต้องแสดง "—" ไม่ใช่ undefined/null
- **UI09:** revenue ต้องคำนวณเฉพาะ unit ที่ status = "Occupied"

---

## 3. Floor Plan 2D — แผนผังสาขา

### ภาพรวม
มุมมองแผนผัง 2D ของสาขา แสดงยูนิตทุกอันในรูปแบบ grid ตามชั้นและ zone พร้อม color-coding ตามสถานะ สามารถคลิกเข้าดูรายละเอียดยูนิตได้ทันที

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| FP01 | Floor Plan 2D per Branch | แผนผังแยกตาม branchId — URL: `/units/floor-plan/[branchId]` |
| FP02 | แสดงตามชั้นและ Zone | จัดกลุ่มยูนิตตาม floor → zone → unitType |
| FP03 | Cell แบบ Dynamic Size | ขนาด cell แปรตาม totalSqm: ≥9 m² = ใหญ่, ≥4 m² = กลาง, <4 m² = เล็ก |
| FP04 | Color Coding 5 สถานะ | Available=เขียว, Occupied=เข้ม, Reserved=น้ำเงิน, Maintenance=แดง, AwaitingRenewal=เหลือง |
| FP05 | Clickable Cells | คลิก cell → ไปหน้า `/units/[unitId]` |
| FP06 | แสดงข้อมูลในเซลล์ | Unit identifier, ขนาด m², ชื่อลูกค้า (ถ้ามี), dot indicator สถานะ |
| FP07 | Legend + สถิติ | ตัวอธิบายสี + จำนวนยูนิตแต่ละสถานะ |
| FP08 | Branch Switcher | ปุ่มสลับระหว่างสาขาทันทีใน URL /floor-plan/[branchId] |
| FP09 | Empty State | ถ้าสาขาไม่มียูนิต → แสดงข้อความและปุ่ม "+ เพิ่มยูนิตแรก" |
| FP10 | Corridor Divider | แสดง separator "— ทางเดิน / CORRIDOR —" ระหว่าง zone |

### เกณฑ์การยอมรับ

- **FP01:** แต่ละสาขาต้องเป็น URL แยก `/units/floor-plan/branch-bkk-sukhumvit` เป็นต้น
- **FP02:** ถ้าสาขามีหลายชั้น ต้องแสดง Card แยกต่อชั้น
- **FP03:** cell ต้องไม่มีขนาดเท่ากันทุกอัน — สะท้อนขนาดจริงของยูนิต
- **FP04:** สีต้องตรงกับ STATUS_COLOR map ใน page.tsx
- **FP05:** ทุก cell ต้องคลิกได้และนำไปยัง `/units/[unit.id]` ที่ถูกต้อง
- **FP07:** legend ต้องนับจำนวนจริงของแต่ละสถานะในสาขานั้น
- **FP08:** ปุ่ม active branch ต้อง highlight (variant="default") ปุ่มสาขาอื่น = variant="outline"
- **FP09:** empty state ต้องแสดงเมื่อ allUnits.length === 0 เท่านั้น

---

## 4. Unit Detail — ข้อมูลยูนิต

### ภาพรวม
หน้าจัดการยูนิตรายชิ้น แสดงข้อมูลครบ, เปลี่ยนสถานะได้ inline, ดูลูกค้าปัจจุบัน และ quick actions

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| UD01 | Unit Header | แสดง identifier, badge สถานะ, ประเภท, zone, ชั้น, สาขา |
| UD02 | ข้อมูลยูนิตครบ | ขนาด (กว้าง × ยาว), พื้นที่รวม (m²), ความจุกล่อง, ค่าบริการ/เดือน, วันที่สร้าง |
| UD03 | เปลี่ยนสถานะ Inline | ปุ่ม "เปลี่ยนสถานะ" เปิด panel เลือกสถานะใหม่ได้ทันทีโดยไม่ต้องออกจากหน้า |
| UD04 | แสดงลูกค้าปัจจุบัน | Card แสดงชื่อลูกค้า, วันครบกำหนด, ลิงก์ไปโปรไฟล์ลูกค้า |
| UD05 | Empty Unit State | ถ้าไม่มีลูกค้า → Card "ยูนิตว่าง" พร้อมปุ่ม "สร้าง Order ใหม่" |
| UD06 | Branch Info Sidebar | แสดงชื่อสาขา, ที่อยู่, เวลาทำการ, ลิงก์ไปหน้าสาขา |
| UD07 | Floor Plan Position | แสดงพิกัด X/Y/W/H บน floor plan (ถ้ามี) |
| UD08 | Revenue Card | คำนวณรายได้ต่อเดือนและต่อปี (ประมาณ ×12) |
| UD09 | Quick Actions | ลิงก์ด่วน: ดูแผนผัง, เปลี่ยนสถานะ, เพิ่มยูนิตใหม่, ย้อนกลับ |
| UD10 | Not Found State | ถ้า unitId ไม่มีในระบบ → แสดง error state พร้อมลิงก์กลับ |

### เกณฑ์การยอมรับ

- **UD01:** badge สีต้องตรงกับ status color system (ใช้ STATUS_STYLE เดียวกับ list page)
- **UD02:** ถ้า unitType = StorageSpace → แสดง widthM × lengthM และ totalSqm; ถ้า DocumentBox → แสดง boxCapacity
- **UD03:** ปุ่มสถานะปัจจุบัน disable (cursor-not-allowed) และ badge "ปัจจุบัน"
- **UD03:** หลังกดเปลี่ยนสถานะ → updateUnitStatus() ต้องถูกเรียก และ UI ต้องอัปเดตทันที
- **UD04:** ถ้ามี currentClientId → แสดงปุ่ม "ดูโปรไฟล์ลูกค้า" ลิงก์ไป `/clients/[clientId]`
- **UD10:** แสดง Alert icon + ข้อความ "ไม่พบยูนิต" + ปุ่มกลับ ไม่ใช่ 404 blank

---

## 5. Unit Creation — สร้างยูนิตใหม่

### ภาพรวม
ฟอร์มสร้างยูนิตใหม่ในระบบ รองรับทั้ง DocumentBox และ StorageSpace มีการ suggest ราคาอัตโนมัติ และ validation ครบถ้วน

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| UC01 | เลือกประเภทยูนิต | Card selector เลือก DocumentBox หรือ StorageSpace — เมื่อเลือก DocumentBox จะ auto-set ราคา ฿150 |
| UC02 | ข้อมูลพื้นฐาน | เลือกสาขา (4 สาขา), กรอก identifier, zone (A-Z), ชั้น, สถานะเริ่มต้น |
| UC03 | ข้อมูล StorageSpace | กว้าง (m) × ยาว (m) → auto-calc พื้นที่ (m²), ปุ่มแนะนำราคาตามขนาด |
| UC04 | ราคาแนะนำอัตโนมัติ | ≤4 m² = ฿3,200/เดือน, ≤9 m² = ฿7,200/เดือน, ≤16 m² = ฿12,800/เดือน |
| UC05 | ข้อมูล DocumentBox | กรอก boxCapacity (จำนวนกล่องสูงสุด) |
| UC06 | Floor Plan Coordinates | กรอก X, Y, W, H สำหรับตำแหน่งบน floor plan (optional) |
| UC07 | หมายเหตุ | textarea สำหรับ notes (optional) |
| UC08 | Validation ก่อน Submit | disabled ถ้า: ไม่มี unitType, branchId, identifier, zone, floor, monthlyRate, หรือ ถ้าเป็น StorageSpace ไม่มี widthM/lengthM |
| UC09 | Success State | หลัง submit สำเร็จ → แสดง checkmark, ชื่อยูนิต, ปุ่ม "ดูยูนิต" และ "สร้างยูนิตถัดไป" |
| UC10 | Format Hint | แสดงตัวอย่าง identifier ที่แนะนำตามประเภทที่เลือก (BOX-A-001 / SPC-B-002) |

### เกณฑ์การยอมรับ

- **UC01:** เมื่อเลือก DocumentBox → monthlyRate auto-fill เป็น 150; เมื่อเลือก StorageSpace → monthlyRate ว่างรอกรอก
- **UC03:** ทุกครั้งที่ widthM หรือ lengthM เปลี่ยน → totalSqm = widthM × lengthM ต้อง update ทันที
- **UC04:** ปุ่ม "แนะนำราคา" ต้องแสดงเฉพาะเมื่อ totalSqm > 0
- **UC08:** ปุ่ม Submit ต้อง disabled (opacity-50) เมื่อ canSubmit = false
- **UC09:** success state ต้องแสดงบน same page ไม่ redirect ออก (ยกเว้นกดปุ่ม "ดูยูนิต")
- **UC10:** format hint ต้องเปลี่ยนตาม unitType ที่เลือก

---

## 6. Client Profile v2 — โปรไฟล์ลูกค้าปรับปรุง

### ภาพรวม
ปรับปรุงข้อมูลลูกค้าให้สมบูรณ์ขึ้น รองรับข้อมูลที่จำเป็นสำหรับการให้บริการ Storage และ Delivery

### ฟิลด์ใหม่ที่เพิ่มมา

| ฟิลด์ | ประเภท | คำอธิบาย |
|------|--------|----------|
| `nameEn` | string? | ชื่อ-นามสกุล ภาษาอังกฤษ |
| `nickname` | string? | ชื่อเล่น |
| `phoneAlt` | string? | เบอร์สำรอง |
| `lineId` | string? | LINE ID |
| `facebook` | string? | Facebook URL/username |
| `instagram` | string? | Instagram handle |
| `otherSocial` | string? | ช่องทาง social อื่น ๆ |
| `originLocationType` | 'Home' \| 'Condo' | ประเภทที่พัก: บ้าน หรือ คอนโด |
| `originFloor` | string? | ชั้น (กรณีคอนโด) |
| `hasElevator` | boolean? | มีลิฟต์มั้ย |
| `preferredPaymentCycle` | 'Monthly' \| 'Annual' | รูปแบบชำระที่ต้องการ |

### เกณฑ์การยอมรับ

- ฟิลด์ `originLocationType` ต้องบังคับกรอก
- ถ้า `originLocationType = 'Condo'` → `originFloor` และ `hasElevator` ต้องแสดงให้กรอก
- `preferredPaymentCycle` ต้องถูกส่งต่อไปยัง Order ที่สร้างใหม่สำหรับลูกค้ารายนั้นโดยอัตโนมัติ

---

## 7. API — Units Endpoint

### ภาพรวม
REST API endpoint สำหรับ Unit Management รองรับ GET (list) และ POST (create)

### รายการ Endpoint

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/api/units` | ดึงรายการยูนิตทั้งหมด (optional: `?branchId=xxx`) |
| POST | `/api/units` | สร้างยูนิตใหม่ |

### POST Request Body

```json
{
  "unitType": "StorageSpace",
  "branchId": "branch-bkk-sukhumvit",
  "branchName": "สุขุมวิท (กรุงเทพ)",
  "unitIdentifier": "SPC-A-005",
  "zone": "A",
  "floor": 1,
  "status": "Available",
  "monthlyRate": 7200,
  "widthM": 3,
  "lengthM": 3,
  "totalSqm": 9,
  "notes": "ยูนิตใกล้ประตูหน้า"
}
```

### Validation Rules

| ฟิลด์ | Required | กฎ |
|------|----------|-----|
| unitType | ✅ | "DocumentBox" หรือ "StorageSpace" เท่านั้น |
| branchId | ✅ | ต้องมีอยู่ใน mockBranches |
| branchName | ✅ | ชื่อสาขา |
| unitIdentifier | ✅ | ห้ามซ้ำในสาขาเดียวกัน |
| zone | ✅ | ตัวอักษร A-Z |
| floor | ✅ | ตัวเลขจำนวนเต็ม ≥1 |
| monthlyRate | ✅ | ตัวเลข > 0 |
| widthM + lengthM | ✅ ถ้า StorageSpace | ตัวเลข > 0 |

### Response

| Status | Body | ความหมาย |
|--------|------|----------|
| 201 | `{ "unit": { ...unitObject } }` | สร้างสำเร็จ |
| 400 | `{ "error": "Missing required field: xxx" }` | ข้อมูลไม่ครบ |
| 400 | `{ "error": "StorageSpace requires widthM and lengthM" }` | StorageSpace ขาดขนาด |

### เกณฑ์การยอมรับ

- **GET `/api/units`:** ถ้าไม่ระบุ branchId ต้องคืน unit ทั้งหมด; ถ้าระบุต้องกรองตาม branchId
- **POST `/api/units`:** field ที่ require ทุกตัวต้องผ่าน validation ก่อน addUnit()
- **POST:** response ต้องมี `status: 201` และ body มี `unit` object ที่มี `id` และ `createdAt`
- **Error responses:** ต้องมี HTTP status 400 และ body `{ error: string }`

---

## สรุป Module Dependencies

```
Order Management
  └─ เชื่อม Unit → Unit Inventory
  └─ เชื่อม Client → Client Profile v2
  └─ สร้าง Order → อัปเดต Unit.status

Unit Inventory
  └─ List View → Unit Detail
  └─ Floor Plan 2D → Unit Detail
  └─ Unit Creation → POST /api/units

Floor Plan 2D
  └─ Cell click → Unit Detail
  └─ Branch switcher → แสดง branch อื่น

Unit Detail
  └─ Status change → updateUnitStatus()
  └─ Client link → Client Profile
  └─ Order link → Order Management
```

---

*อัปเดตล่าสุด: เมษายน 2026 | ผู้จัดทำ: Naruebet (Best) — Product Manager*

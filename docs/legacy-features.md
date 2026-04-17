# ฟีเจอร์เดิม (Legacy Features) — Widing Back Office

> เอกสารนี้สรุปฟีเจอร์ทั้งหมดที่มีอยู่ในระบบ Back Office ปัจจุบัน (ณ เดือนเมษายน 2026)
> URL: https://oldd-many-acre.vercel.app
> ภาษาที่ใช้ในเอกสาร: ภาษาไทย

---

## สารบัญ

1. [Booking Management — จัดการการจอง](#1-booking-management--จัดการการจอง)
2. [Branch Management — จัดการสาขา](#2-branch-management--จัดการสาขา)
3. [Client Management — จัดการลูกค้า](#3-client-management--จัดการลูกค้า)
4. [Flexible Allocations — จัดการพื้นที่จัดเก็บ](#4-flexible-allocations--จัดการพื้นที่จัดเก็บ)
5. [Financial Transactions — จัดการธุรกรรม](#5-financial-transactions--จัดการธุรกรรม)
6. [Delivery Planning — วางแผนการขนส่ง](#6-delivery-planning--วางแผนการขนส่ง)
7. [Calendar — ปฏิทินงาน](#7-calendar--ปฏิทินงาน)
8. [Spaces — พื้นที่คลัง (Legacy)](#8-spaces--พื้นที่คลัง-legacy)
9. [Dashboard — หน้าหลัก](#9-dashboard--หน้าหลัก)
10. [Recent Activity — ประวัติกิจกรรม](#10-recent-activity--ประวัติกิจกรรม)

---

## 1. Booking Management — จัดการการจอง

### ภาพรวม
ระบบจัดการการจองรับ-คืนสินค้า แสดงผลแบบ Kanban Board แยกตามสถานะ พร้อมกับ List View เสริม

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| B01 | Kanban Board — Upcoming | แสดงการจองในอนาคตแบบกระดาน แบ่งเป็น 3 คอลัมน์: Pending, Processing, Pre-confirmed |
| B02 | Kanban Board — Today | แสดงการจองของวันนี้ แบ่งเป็น: Confirmed, InTransit, AwaitingAllocation |
| B03 | Booking List — Completed | ตารางแสดงการจองที่เสร็จสมบูรณ์ |
| B04 | Booking List — Cancelled/Idle | ตารางแสดงการจองที่ยกเลิก หรือ Pending นานกว่า 7 วัน |
| B05 | สร้างการจองใหม่ | ฟอร์มสร้าง Booking ใหม่: เลือกประเภท (Pick-up / Return), ข้อมูลลูกค้า, วันเวลา, สาขา, สินค้า |
| B06 | แนบรูปสินค้า | อัปโหลดรูปภาพสินค้าที่จะจัดเก็บในขั้นตอนสร้าง Booking |
| B07 | ระบุรายการสินค้า | ระบุประเภทและจำนวนสินค้า (กล่อง, เฟอร์นิเจอร์, อุปกรณ์อิเล็กทรอนิกส์ ฯลฯ) |
| B08 | ข้อมูลโลจิสติกส์ | ระบุข้อมูลเสริมสำหรับการขนส่ง: มีลิฟต์มั้ย, ค่าจอดรถ, เฟอร์นิเจอร์ชิ้นใหญ่, ต้องแกะหรือไม่ |
| B09 | ลูกค้าส่งของเอง | ตัวเลือกว่าลูกค้านำของมาฝากเองที่คลัง ไม่ต้องใช้รถขนส่ง |
| B10 | เชื่อม Allocation | เลือก Allocation ที่มีอยู่แล้วเพื่อเพิ่มของลงในพื้นที่เดิม |
| B11 | แก้ไขสถานะ Booking | เปลี่ยนสถานะผ่าน Kanban: ลากการ์ดหรือกดปุ่ม |
| B12 | ดู Booking Detail | หน้าละเอียดแสดงข้อมูลครบ: ลูกค้า, สินค้า, โลจิสติกส์, delivery options |

### เกณฑ์การยอมรับ (Acceptance Criteria)

- **B01/B02:** การจองทุกรายการต้องแสดงในคอลัมน์ที่ถูกต้องตามสถานะ
- **B05:** ฟอร์มต้องบังคับกรอก: ประเภทการจอง, วันเวลา, สาขา, ชื่อลูกค้า, เบอร์ติดต่อ
- **B08:** ถ้าเฟอร์นิเจอร์ชิ้นใหญ่ = ใช่ ต้องกรอกขนาดกว้าง-สูงสูงสุด
- **B10:** เมื่อเลือก Allocation ที่มีอยู่ ต้องแสดงข้อมูล allocation เดิมให้เห็น
- **B11:** การเปลี่ยนสถานะทุกครั้งต้องบันทึก log ใน Recent Activity

---

## 2. Branch Management — จัดการสาขา

### ภาพรวม
ระบบจัดการสาขาคลังสินค้า ทั้ง Owned / Partner / Franchise พร้อมข้อมูล capacity และ commission

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| BR01 | รายการสาขาทั้งหมด | ตารางแสดงสาขาทั้งหมดพร้อม capacity, ประเภท, utilization |
| BR02 | สถิติ Capacity รวม | Summary Cards: จำนวนสาขา, พื้นที่รวม, พื้นที่ที่ใช้งาน, % utilization รวม |
| BR03 | เพิ่มสาขาใหม่ | ฟอร์มเพิ่มสาขา: ชื่อ, ที่อยู่, ประเภทสาขา, ความจุ, เวลาทำการ, Google Maps link |
| BR04 | แก้ไขข้อมูลสาขา | หน้าแก้ไขสาขา: อัปเดตข้อมูลทั้งหมด รวมถึง commission rate และ payout day |
| BR05 | ข้อมูล Partner Commission | ระบุ % commission และวันจ่าย payout สำหรับสาขา Partner/Franchise |
| BR06 | Partner Payouts | หน้าจัดการการจ่าย commission ให้ partner แยกตามสาขา |
| BR07 | ลิงก์ Google Maps | ฝัง Google Maps link สำหรับแต่ละสาขา เพื่อส่งให้ลูกค้า |

### เกณฑ์การยอมรับ

- **BR03:** ฟอร์มบังคับ: ชื่อสาขา, ประเภท (Owned/Partner/Franchise), ความจุรวม
- **BR05:** ถ้า branchType = Partner หรือ Franchise ต้องกรอก commissionRatePercent ได้
- **BR06:** แสดงยอดที่ต้องจ่ายแต่ละสาขา คำนวณจาก transaction ที่ relatedBranchId ตรงกัน

---

## 3. Client Management — จัดการลูกค้า

### ภาพรวม
ระบบ CRM เบื้องต้น บันทึกข้อมูลลูกค้า ติดตามสถานะ และเชื่อมกับ Booking/Allocation

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| CL01 | รายการลูกค้าทั้งหมด | ตารางลูกค้าพร้อม status: Prospect, Active, Churned, ReturnCompleted |
| CL02 | สถิติลูกค้า | Summary Cards: จำนวนแต่ละ status |
| CL03 | เพิ่มลูกค้าใหม่ | ฟอร์มเพิ่มลูกค้า: ชื่อ, เบอร์, อีเมล, LINE ID, Facebook, ที่อยู่รับสินค้า |
| CL04 | ข้อมูลที่อยู่รับสินค้า | ระบุประเภทที่พัก (บ้าน/คอนโด), ชั้น, มีลิฟต์, จังหวัด-เขต-แขวง-รหัสไปรษณีย์ |
| CL05 | Social Media Contacts | บันทึก Line ID, Facebook, Instagram, Other Social |
| CL06 | วงจรการชำระเงิน | เลือก preferredPaymentCycle: รายเดือน หรือ รายปี |
| CL07 | ดู Client Profile | หน้าละเอียดลูกค้า: ข้อมูลส่วนตัว, bookings, allocations, transactions ที่เกี่ยวข้อง |
| CL08 | กรอง/ค้นหาลูกค้า | กรองลูกค้าตามสถานะ และค้นหาจากชื่อ/เบอร์ |

### เกณฑ์การยอมรับ

- **CL03:** ฟอร์มบังคับ: ชื่อ, เบอร์โทรศัพท์, ประเภทที่พัก
- **CL04:** ถ้า originLocationType = Condo ต้องกรอกชั้น และระบุว่ามีลิฟต์หรือไม่
- **CL07:** ต้องแสดง bookings และ allocations ที่ clientId ตรงกัน

---

## 4. Flexible Allocations — จัดการพื้นที่จัดเก็บ

### ภาพรวม
ระบบจัดการพื้นที่จัดเก็บแบบ bulk (ไม่แยก unit) — บันทึกว่าลูกค้าใช้พื้นที่เท่าไร, cycle billing, ต่ออายุ, ขยายพื้นที่

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| A01 | Current Allocations | ตารางแสดง allocation ที่ active (Occupied / Reserved) |
| A02 | Awaiting Renewal | รายการ allocation ที่ครบกำหนดและรอต่ออายุ |
| A03 | Awaiting Extension Payment | allocation ที่ขอขยายพื้นที่/เวลา รอยืนยันชำระเงิน |
| A04 | Released History | ประวัติ allocation ที่ปิดไปแล้ว |
| A05 | เพิ่ม Allocation ใหม่ | สร้าง allocation ใหม่: เลือกลูกค้า, สาขา, พื้นที่ (sqm), วันเริ่ม |
| A06 | ขอขยายพื้นที่ | ส่ง request ขยาย sqm เพิ่ม คำนวณค่าใช้จ่ายส่วนต่าง |
| A07 | ขอขยายเวลา | ส่ง request ต่อเวลา N เดือน คำนวณค่าใช้จ่าย |
| A08 | ส่ง Checkout Link | ส่ง checkout link (Gateway หรือ Manual) ให้ลูกค้าชำระค่าขยาย |
| A09 | ยืนยันการชำระเงิน | เปลี่ยนสถานะ allocation หลังยืนยันรับเงินค่าขยาย |
| A10 | ต่ออายุ Allocation | ประมวลผลการต่ออายุ: อัปเดต billingCycleEndDate ไปอีก N เดือน |
| A11 | Release Allocation | ปิด allocation เมื่อลูกค้าสิ้นสุดการใช้งาน |
| A12 | แนบรูปพื้นที่ | อัปโหลดรูปภาพพื้นที่จัดเก็บเพื่อเป็น reference |

### เกณฑ์การยอมรับ

- **A05:** ฟอร์มบังคับ: clientId, branchId, usedSpaceSqm, allocationDate
- **A06:** ต้องคำนวณ additionalFeeForExtension = (ราคา/sqm) × sqm ที่เพิ่ม
- **A08:** ส่งได้ทั้งแบบ payment gateway link หรือ manual (PromptPay)
- **A10:** currentBillingCycleEndDate ต้องอัปเดตถูกต้อง (+N เดือน)
- **A11:** สถานะเปลี่ยนเป็น Released และบันทึก releaseDate

---

## 5. Financial Transactions — จัดการธุรกรรม

### ภาพรวม
บันทึกและติดตามธุรกรรมทางการเงินทั้งหมด รองรับหลายประเภทและหลายช่องทางชำระเงิน

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| T01 | รายการธุรกรรมทั้งหมด | ตารางธุรกรรมพร้อม filter สถานะ: Pending, Completed, Failed, Cancelled |
| T02 | สถิติธุรกรรม | Summary Cards: จำนวนตาม status |
| T03 | เพิ่มธุรกรรมใหม่ | ฟอร์มสร้าง transaction: เลือกลูกค้า, ประเภท, จำนวนเงิน, ช่องทาง, วันที่ |
| T04 | ประเภทธุรกรรม | รองรับ: FullAmount, Subscription, Refund, DeliveryOnly, Other, ExtensionFee |
| T05 | ช่องทางชำระเงิน | รองรับ: Cash, CreditCard, BankTransfer, Online, Other |
| T06 | Invoice Status | ติดตามสถานะ invoice: NotYet, Created, Sent |
| T07 | Receipt Status | ติดตามสถานะใบเสร็จ: NotYet, Created, Sent |
| T08 | อัปเดตสถานะเอกสาร | กดปุ่มอัปเดต invoice/receipt status แต่ละรายการ |
| T09 | ดูรายละเอียด Transaction | หน้าละเอียด: ข้อมูลครบ, linked booking/allocation |

### เกณฑ์การยอมรับ

- **T03:** ฟอร์มบังคับ: clientId, date, type, amount, status
- **T04:** ประเภท ExtensionFee ต้องเชื่อมกับ relatedAllocationId
- **T06/T07:** เมื่อสร้าง invoice/receipt ต้องเปลี่ยนสถานะจาก NotYet → Created
- **T08:** ปุ่มอัปเดตสถานะต้องแสดงเฉพาะตัวเลือกที่ถัดไป (ไม่ย้อนกลับ)

---

## 6. Delivery Planning — วางแผนการขนส่ง

### ภาพรวม
ศูนย์กลางวางแผนและจัดการการขนส่ง: เลือก delivery option, มอบหมายรถ-คนขับ, ติดตามสถานะ

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| D01 | รายการรอวางแผน | แสดง booking ที่ status = Pending พร้อมรับการวางแผนขนส่ง |
| D02 | รายการวางแผนแล้ว | แสดง booking ที่ status = Processing (วางแผนแล้ว) |
| D03 | หน้า Delivery Summary | รายละเอียดการขนส่งแต่ละ booking: สินค้า, ที่อยู่, delivery options |
| D04 | เพิ่ม Delivery Option | สร้าง delivery option: เลือก provider, ประเภทรถ, จำนวนคนขับ-ผู้ช่วย, ราคา |
| D05 | Provider selection | รองรับ provider หลายราย: บริษัทขนส่ง, รถส่วนตัว, อื่น ๆ |
| D06 | Vehicle Assignment | ระบุจำนวนและประเภทรถต่อ delivery option |
| D07 | เลือก Delivery Option | เลือก option ที่จะใช้จริง จาก options ที่สร้างไว้ |
| D08 | ส่ง Checkout Page | ส่ง checkout link (gateway / manual) ให้ลูกค้ายืนยันและชำระเงิน |
| D09 | แนะนำ Option (Recommended) | ทำเครื่องหมาย "recommended" บน delivery option ที่เหมาะสมที่สุด |

### เกณฑ์การยอมรับ

- **D04:** ฟอร์มบังคับ: bookingId, providerName, vehicleAssignments (≥1 รายการ), estimatedCost
- **D06:** vehicle assignment ต้องระบุ vehicleType, quantity, numberOfDrivers
- **D07:** หลังเลือก option แล้ว booking.selectedAllocationId ต้องอัปเดต
- **D08:** ส่ง checkout ได้แบบ gateway (link) หรือ manual (แนบ promptpay)

---

## 7. Calendar — ปฏิทินงาน

### ภาพรวม
มุมมองปฏิทินแสดง booking ทั้งหมดตามวันที่บริการ

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| C01 | Monthly Calendar View | แสดง booking ทั้งหมดบนปฏิทินรายเดือน คลิกวันเพื่อดู booking ของวันนั้น |
| C02 | Color coding ตามสถานะ | แสดงสี booking บนปฏิทินตาม status |
| C03 | ลิงก์ไปหน้า Booking Detail | คลิก booking บนปฏิทินเพื่อไปดูรายละเอียด |

### เกณฑ์การยอมรับ

- **C01:** booking ทุกรายการที่ startTime อยู่ในเดือนนั้นต้องแสดงบนปฏิทิน
- **C02:** สีต้องสอดคล้องกับ Kanban Board (Pending = เทา, InTransit = น้ำเงิน ฯลฯ)
- **C03:** คลิก booking ต้องนำไปยัง `/bookings/[id]`

---

## 8. Spaces — พื้นที่คลัง (Legacy)

### ภาพรวม
ระบบพื้นที่คลังแบบเดิม (ก่อนจะมีระบบ Unit Management ใหม่) — ยังคงมีอยู่เป็น legacy

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| SP01 | รายการพื้นที่ทั้งหมด | ตารางแสดง Space ทุกอันของทุกสาขา พร้อมสถานะ (Available, Occupied, Reserved, Maintenance) |
| SP02 | กรองตามสาขา | กรอง Space ตาม branchId |
| SP03 | แสดงลูกค้าที่เช่า | แสดง clientName และ monthlyRate ของแต่ละ space |

### เกณฑ์การยอมรับ

- **SP01:** Space ทุกอันต้องแสดง identifier, สถานะ, ขนาด
- **SP02:** กรองสาขาแล้วต้องแสดงเฉพาะ space ของสาขานั้น

> **หมายเหตุ:** ระบบ Spaces เดิมจะถูกแทนที่ด้วย Unit Management ใหม่ (ดู new-features.md) ซึ่งรองรับทั้ง DocumentBox และ StorageSpace พร้อม Floor Plan 2D

---

## 9. Dashboard — หน้าหลัก

### ภาพรวม
หน้าหลักสรุปภาพรวมธุรกิจ: รายได้, booking สำคัญ, สถานะระบบ

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| DB01 | สรุปรายได้เดือนนี้ | แสดงรายได้รวมจาก transaction ที่ Completed ในเดือนปัจจุบัน |
| DB02 | สถิติ Booking | นับ booking ตามสถานะ (Pending, Active, Completed) |
| DB03 | สถิติ Allocation | นับ allocation ที่ active / รอต่ออายุ |
| DB04 | Quick Links | ลิงก์ด่วนไปยังหน้าสำคัญ: สร้าง Booking, สร้าง Client, จัดการ Allocation |
| DB05 | Recent Activity | แสดง activity ล่าสุด 5-10 รายการจากระบบ |

### เกณฑ์การยอมรับ

- **DB01:** ตัวเลขรายได้ต้องตรงกับ sum ของ transactions (Completed, เดือนปัจจุบัน)
- **DB02/DB03:** ตัวเลขต้องอัปเดต real-time เมื่อมีการเปลี่ยนแปลง

---

## 10. Recent Activity — ประวัติกิจกรรม

### ภาพรวม
บันทึกกิจกรรมทั้งหมดในระบบ เพื่อ audit trail และติดตามการทำงาน

### รายการฟีเจอร์

| # | ชื่อฟีเจอร์ | คำอธิบาย |
|---|------------|----------|
| RA01 | รายการ Activity ทั้งหมด | แสดง activity ทุกรายการ ล่าสุดก่อน |
| RA02 | ประเภท Activity | Booking, Client, Branch, Transaction, Allocation, User, System |
| RA03 | Action Types | Created, Updated, Deleted, StatusChanged, LoggedIn, LoggedOut |
| RA04 | ลิงก์ไปยัง Entity | แต่ละ activity มี detailsLink ไปยังหน้า entity ที่เกี่ยวข้อง |

### เกณฑ์การยอมรับ

- **RA01:** กิจกรรมต้องเรียงจากใหม่ไปเก่า (timestamp DESC)
- **RA02:** icon/badge ต้องแสดงประเภทได้ชัดเจน
- **RA04:** detailsLink ต้องนำไปยัง entity ที่ถูกต้อง

---

*อัปเดตล่าสุด: เมษายน 2026 | ผู้จัดทำ: Naruebet (Best) — Product Manager*

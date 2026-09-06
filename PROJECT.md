# หลาดริมชล — Campus Food Market

> แพลตฟอร์มสั่งอาหารสำหรับตลาดภายในมหาวิทยาลัย  
> **“เดินตลาดด้วยมือถือ สั่งง่าย รับไว ไม่ต้องรอคิว”**

---

## 1. Project Overview

**หลาดริมชล (Lad Rim Chon)** คือ Mobile Application สำหรับสั่งอาหารล่วงหน้าภายในตลาดของมหาวิทยาลัย โดยรวบรวมร้านค้าและเมนูอาหารไว้ในแพลตฟอร์มเดียว

แนวคิดหลักคือการนำประสบการณ์ของ “ตลาดไม้ริมชล” มาผสมกับความสะดวกของ Digital Ordering เพื่อให้นักศึกษาสามารถค้นหาร้านอาหาร เลือกเมนู สั่งอาหาร และติดตามสถานะออเดอร์ได้จากมือถือ

ระบบเน้นความรู้สึก **น่ารัก อบอุ่น เป็นกันเอง และทันสมัย** โดยมีเอกลักษณ์จากบรรยากาศตลาดไม้ ธรรมชาติ สายน้ำ และวิถีตลาดในมหาวิทยาลัย

---

## 2. Core Concept

### Digital Local Marketplace

ไม่ใช่เพียงแอป Delivery แต่เป็น **Digital Marketplace ของตลาดมหาวิทยาลัย**

```text
ตลาดจริง
  ↓
ร้านค้า
  ↓
เมนูอาหาร
  ↓
สั่งผ่าน Mobile App
  ↓
ร้านรับออเดอร์
  ↓
ทำอาหาร
  ↓
ลูกค้ามารับ
```

### เป้าหมาย

- ลดเวลาการรออาหาร
- ลดความแออัดบริเวณหน้าร้าน
- ช่วยให้นักศึกษาหาร้านและเมนูได้ง่าย
- ช่วยร้านค้าจัดการออเดอร์อย่างเป็นระบบ
- สร้าง Digital Platform ให้กับตลาดมหาวิทยาลัย
- สามารถต่อยอดไปยังระบบหลังบ้านและฐานข้อมูลจริงในอนาคต

---

# 3. Brand Identity

## Brand Name

**หลาดริมชล**

คำว่า “หลาด” สื่อถึงตลาดในภาษาท้องถิ่น ส่วน “ริมชล” สื่อถึงบรรยากาศริมสายน้ำและธรรมชาติ

## Brand Personality

- Cute
- Friendly
- Warm
- Local
- Playful
- Modern
- Student-friendly

## Design Direction

> **Warm & Playful Campus Marketplace**

หรือ

> **Cute Modern Local Market**

### Visual Language

- ตลาดไม้
- หลังคาไม้
- สายน้ำ
- ต้นไม้
- ไฟประดับ
- ร้านค้าเล็ก ๆ
- อาหารและเครื่องดื่ม
- Illustration แบบวาดมือ

### Mood

```text
อบอุ่น       🌿
เป็นกันเอง   🏡
น่ารัก       🍜
ทันสมัย      📱
ไม่หรูเกินไป
ไม่ Corporate
```

---

# 4. Color Direction

| Role | Color |
|---|---|
| Background | Warm Cream |
| Primary | Wood Brown |
| Secondary | Sage Green |
| Accent | Soft Peach / Market Orange |
| Text | Dark Brown |
| Surface | Warm White |

ตัวอย่าง Palette:

```text
Warm Cream   #F7F3E8
Light Beige  #E9D7B5
Wood Brown   #A67C52
Sage Green   #7DA27D
Market Orange #F4A261
Dark Brown   #3D3025
```

> สีจริงสามารถปรับได้ตาม Logo และภาพลักษณ์ของตลาด

---

# 5. Technology Stack

## Frontend

- Next.js
- TypeScript
- PWA
- Tailwind CSS
- shadcn/ui

## State Management

- Redux Toolkit

## Data Layer

- Repository Pattern
- Adapter Pattern
- LocalStorage Adapter

## Future

```text
Current MVP

Next.js
   ↓
Redux
   ↓
Repository
   ↓
LocalStorage Adapter


Future

Next.js
   ↓
Redux
   ↓
Repository
   ↓
API Adapter
   ↓
Backend
   ↓
Database
```

---

# 6. Architecture Principle

## Repository / Adapter Pattern

ระบบจะไม่ผูก Business Logic เข้ากับ LocalStorage โดยตรง

```text
UI
 ↓
Feature
 ↓
Redux
 ↓
Repository Interface
 ↓
Adapter
 ├── LocalStorage Adapter
 └── API Adapter (Future)
```

ตัวอย่าง:

```ts
interface OrderRepository {
  getOrders(): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  createOrder(order: Order): Promise<Order>
  updateOrder(order: Order): Promise<Order>
}
```

ปัจจุบัน:

```ts
LocalStorageOrderAdapter
```

อนาคต:

```ts
ApiOrderAdapter
```

UI และ Business Logic ไม่จำเป็นต้องเปลี่ยนตาม Data Source

---

# 7. Project Structure

```text
src/
├── app/
│   ├── (customer)/
│   │   ├── page.tsx
│   │   ├── shops/
│   │   ├── menu/
│   │   ├── cart/
│   │   └── orders/
│   │
│   └── (merchant)/
│       ├── dashboard/
│       ├── orders/
│       └── products/
│
├── components/
│   ├── ui/
│   ├── food/
│   ├── shop/
│   ├── order/
│   └── market/
│
├── features/
│   ├── cart/
│   ├── order/
│   ├── shop/
│   └── user/
│
├── store/
│   ├── index.ts
│   └── slices/
│
├── domain/
│   ├── shop/
│   ├── product/
│   ├── order/
│   └── user/
│
├── repositories/
│   ├── interfaces/
│   │   ├── shop.repository.ts
│   │   ├── product.repository.ts
│   │   └── order.repository.ts
│   │
│   └── adapters/
│       └── local-storage/
│           ├── shop.adapter.ts
│           ├── product.adapter.ts
│           └── order.adapter.ts
│
└── lib/
    └── repositories.ts
```

---

# 8. Customer Features

## Home

- Greeting
- Search
- Food Categories
- Recommended Shops
- Popular Menus
- Current Promotions
- Market Information

## Shop

- Shop information
- Open / Closed status
- Menu categories
- Menu items
- Estimated preparation time

## Food Detail

- Food image
- Name
- Description
- Price
- Options / Add-ons
- Quantity
- Note to shop
- Add to cart

## Cart

- Selected items
- Quantity
- Add-ons
- Order note
- Total price
- Confirm order

## Order

Order status:

```text
🟡 รับออเดอร์แล้ว
     ↓
🟠 กำลังทำอาหาร
     ↓
🟢 พร้อมรับ
     ↓
✓ รับอาหารแล้ว
```

## Pickup

แสดง:

```text
Order #A284

Pickup Code
7284

ร้าน: ร้านอาหารตัวอย่าง
จุดรับ: โซน A

พร้อมรับเวลา
12:15 - 12:30
```

---

# 9. Merchant Features

สำหรับร้านค้าในตลาด

### Dashboard

- จำนวนออเดอร์
- ออเดอร์ที่กำลังทำ
- ออเดอร์ที่รอรับ
- ยอดขาย

### Order Management

```text
New
 ↓
Accepted
 ↓
Preparing
 ↓
Ready
 ↓
Completed
```

### Product Management

- เพิ่มเมนู
- แก้ไขเมนู
- ราคา
- รูปภาพ
- เปิด / ปิดเมนู
- Stock / จำนวนที่ขายได้

---

# 10. Redux State

Redux ใช้สำหรับ Client State ที่จำเป็น

```text
store/
├── cart
│   ├── items
│   └── shopId
│
├── order
│   └── currentOrder
│
├── ui
│   ├── selectedCategory
│   └── mobileMenu
│
└── session
    └── user
```

ไม่ควรนำข้อมูลทั้งหมดของระบบมาเก็บไว้ใน Redux

ข้อมูลจาก Data Layer ควรเข้าผ่าน Repository

---

# 11. PWA

Application จะถูกออกแบบเป็น Progressive Web App เพื่อให้ผู้ใช้สามารถเปิดใช้งานผ่านมือถือได้เหมือน Native App

### เป้าหมาย

- Install บนมือถือ
- Responsive
- Fast loading
- App-like experience
- Offline-friendly ในส่วนที่เหมาะสม
- Push Notification ในอนาคต

---

# 12. UX Flow

```text
เปิด App
   ↓
Home
   ↓
เลือกร้าน
   ↓
เลือกเมนู
   ↓
เพิ่มลงตะกร้า
   ↓
ตรวจสอบ Order
   ↓
ยืนยัน
   ↓
ได้รับ Order Number
   ↓
ติดตามสถานะ
   ↓
ร้านทำอาหาร
   ↓
แจ้งเตือน “พร้อมรับแล้ว”
   ↓
เดินไปรับที่ร้าน
   ↓
ใส่ Pickup Code
   ↓
Completed
```

---

# 13. Main Navigation

```text
┌─────────────────────────┐
│                         │
│        Application      │
│                         │
├─────────────────────────┤
│                         │
│                         │
│         Content         │
│                         │
│                         │
├─────────────────────────┤
│ 🏠 Home │ 📋 Orders │ 👤 │
└─────────────────────────┘
```

Navigation หลักควรมีไม่เกิน 3–4 รายการ เพื่อให้เหมาะกับการใช้งานบนมือถือ

---

# 14. Custom UI Components

แม้จะใช้ shadcn/ui แต่ควรสร้าง Design System ของ “หลาดริมชล” ขึ้นมาครอบอีกชั้น

```text
shadcn/ui
    ↓
Market Design System
    ↓
├── MarketButton
├── MarketCard
├── FoodCard
├── ShopCard
├── CategoryCard
├── OrderStatus
├── PickupCode
├── MarketHeader
└── MarketNavigation
```

เป้าหมายคือให้ UI มีเอกลักษณ์ของแบรนด์ ไม่ใช่ดูเหมือน Default shadcn/ui

---

# 15. Logo Concept

Logo หลักควรประกอบด้วยองค์ประกอบที่สื่อถึงตลาดโดยตรง

```text
       🏡
   ─────────
  💡  💡  💡
       หลาด
       ริมชล
   ~~~~~~~~~~~
       🌿
```

### Logo Elements

- โครงหลังคาไม้ → ตลาดไม้
- ไฟประดับ → บรรยากาศตลาด
- สายน้ำ → “ริมชล”
- ใบไม้ → ธรรมชาติ
- อาหาร → Food Market
- Typography ภาษาไทย → Local Identity

Logo ต้องสามารถใช้ได้ทั้ง:

- App Icon
- Splash Screen
- Header
- Shop Sign
- Sticker
- Social Media
- Print Material

---

# 16. Future Roadmap

## Phase 1 — MVP

- [ ] Home
- [ ] Shop
- [ ] Menu
- [ ] Cart
- [ ] Order
- [ ] Order Status
- [ ] LocalStorage Adapter
- [ ] PWA
- [ ] Responsive Mobile UI

## Phase 2 — Backend

- [ ] API
- [ ] Database
- [ ] Authentication
- [ ] User Account
- [ ] Merchant Account
- [ ] Real-time Order Status

## Phase 3 — Marketplace

- [ ] Multiple Shops
- [ ] Promotions
- [ ] Reviews
- [ ] Favorite Shops
- [ ] Search
- [ ] Categories
- [ ] Market Map

## Phase 4 — Smart Platform

- [ ] Analytics
- [ ] Recommendation
- [ ] AI Assistant
- [ ] Sales Dashboard
- [ ] Demand Prediction
- [ ] Smart Inventory

---

# 17. Product Philosophy

> **“เทคโนโลยีไม่ควรเปลี่ยนความเป็นตลาด แต่ควรทำให้ตลาดใช้ง่ายขึ้น”**

หลาดริมชลจึงไม่ได้ต้องการทำให้ตลาดดูเป็นห้างหรือร้านอาหารระดับ Premium แต่ต้องการรักษาความเป็น **ตลาดไม้ที่อบอุ่น เป็นกันเอง และมีชีวิตชีวา** พร้อมนำเทคโนโลยีเข้ามาช่วยลดปัญหาการรอคิวและจัดการออเดอร์

---

# 18. One-line Description

> **หลาดริมชล — แอปสั่งอาหารสำหรับตลาดมหาวิทยาลัย ที่เปลี่ยนการเดินตลาดให้สะดวกขึ้น โดยยังคงเสน่ห์ของตลาดท้องถิ่นไว้**


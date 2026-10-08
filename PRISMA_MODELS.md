# Prisma Models Architecture Guide

This document explains the database schema architecture for the Glass POS system. It details how the tables interact, the relationships between them, and their specific purposes.

## Core Design Principles

1. **UUIDs Everywhere**: All tables use `String @db.Uuid` for their primary keys (`id`). This prevents ID guessing, improves security, and is ideal for distributed systems.
2. **Standard Audit Fields**: Almost every table includes:
   - `active` (Boolean): For soft-deletes (instead of actually deleting rows, we mark them inactive).
   - `createdAt` (DateTime): When the record was inserted.
   - `updatedAt` (DateTime): Automatically updated by Prisma whenever the record is modified.
3. **Transaction Auditing**: Master data tables (like Brands or Models) don't need to track *who* created them to keep the schema clean. However, critical transactional tables (like `StockMovement`) explicitly track `createdById` to know which staff member made the transaction.

---

## 1. Authentication & Users

### `User`
The central model for staff and administrators accessing the POS system.
- **Role**: Defined by the `Role` enum (`ADMIN` or `STAFF`).
- **Authentication**: Stores hashed passwords (`passwordHash`).
- **Tracking**: Maintains a 1-to-many relationship with `StockMovement` to track which user performed which stock adjustments.

---

## 2. The Vehicle Hierarchy

Vehicles are structured in a strict 4-level hierarchy to ensure data consistency.

### Level 1: `VehicleCategory`
The broadest grouping (e.g., "Passenger Car", "Commercial Truck", "Bus").

### Level 2: `VehicleBrand`
The manufacturer (e.g., "Toyota", "Honda", "Volvo").
- *Belongs to a `VehicleCategory`*.

### Level 3: `VehicleModel`
The specific nameplate (e.g., "Camry", "Civic", "F-150").
- *Belongs to a `VehicleBrand`*.

### Level 4: `VehicleVariant`
The exact trim or generation of the model (e.g., "Sedan 2018-2022", "Hatchback 2020+").
- *Belongs to a `VehicleModel`*.
- Includes `yearFrom` and `yearTo` to accurately map physical glass sizes which change between generations.

---

## 3. Products & Inventory

### `Product`
The actual items being sold in the store (primarily Glass, but could be sealants or tools).
- Tracks `sku`, `purchasePrice`, `sellingPrice`, and `gstRate`.
- Has a `productType` (defaults to `"GLASS"`).

### `Inventory`
Tracks the actual physical stock sitting in the warehouse.
- **Relationship**: 1-to-1 with `Product`. A product can only have one inventory record.
- **Fields**:
  - `quantity`: Actual physical stock available.
  - `reservedQuantity`: Stock that is physically there but promised to a pending sales order.
  - `minStockLevel`: The threshold that triggers a "Low Stock" alert.

### `StockMovement`
The immutable audit log for inventory changes. **You should never directly update the `quantity` in the `Inventory` table.** Instead, you insert a `StockMovement` record, which then triggers an update to the `Inventory` table.
- **`movementType`**: Enum (`PURCHASE`, `SALE`, `SALE_RETURN`, `DAMAGE`, etc.)
- **`quantity`**: Always a positive number. If it's a `SALE` or `DAMAGE`, the business logic will subtract this from the Inventory.
- **Audit**: Tracks exactly `createdBy` (which User did it).

---

## 4. The Compatibility Engine

### `VehicleGlass` (The Join Table)
This is the most powerful table in the system. It connects a `VehicleVariant` to a `Product`.
- **Purpose**: When a customer comes in with a "2019 Toyota Camry", this table tells the system exactly which glass SKU fits their car.
- **`glassPosition`**: Defines *where* the glass goes (e.g., `FRONT_WINDSHIELD`, `FRONT_DOOR_LEFT`, `REAR_WINDSHIELD`).
- **Relationship**: Many-to-Many. A specific SKU (like a generic sensor) might fit multiple variants, and a variant definitely has multiple SKUs (front glass, side glass, rear glass).

---

## Example Flow: Selling a Windshield

1. A customer arrives with a **2021 Honda Civic**.
2. The POS queries `VehicleVariant` for the 2021 Civic.
3. It looks up the `VehicleGlass` table where `variantId` matches the Civic and `glassPosition = 'FRONT_WINDSHIELD'`.
4. This points to a `Product` (e.g., SKU: `HW-CIV-21`).
5. The POS checks the `Inventory` table to ensure `quantity > 0`.
6. When the sale is complete:
   - A `StockMovement` of type `SALE` is created (logging the `userId`).
   - The `Inventory.quantity` is decremented by 1.

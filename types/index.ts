export interface User {
  id: number
  username: string
  email: string
  role: "admin" | "storekeeper" | "technician"
}

export interface GasType {
  id: number
  name: string
  price_per_liter: number
}

export interface Cylinder {
  id: number
  code: string
  size: "10L" | "40L" | "50L"
  gas_type_id: number | null
  status: "in stock" | "delivered" | "returned"
}

export interface Supply {
  id: number
  date: string
  hospital_name: string
  vehicle_plate: string
  driver_name: string
  storekeeper_name: string
  technician_name: string
  recipient_name: string
  recipient_signature?: string
  total_price: number
}

export interface SupplyDetail {
  id: number
  supply_id: number
  cylinder_code: string
  gas_type_id: number
  liters: number
  price: number
}

export interface Inventory {
  id: number
  gas_type_id: number
  total_cylinders: number
  total_liters: number
}

export interface Invoice {
  id: number
  delivery_id: number
  amount: number
  status: "paid" | "unpaid"
  date: string
}


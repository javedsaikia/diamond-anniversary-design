import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

const JWT_SECRET = "balya-bhavan-alumni-75th-anniversary-jwt-secret-2025-development-key-hardcoded-demo"

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  batch?: string
  department?: string
  phone?: string
  address?: string
  yearOfPassing?: string
  registrationDate?: string
  status?: "active" | "pending" | "suspended"
}

export interface Admin {
  id: string
  email: string
  name: string
  role: "admin"
}

const users: (User | Admin)[] = [
  {
    id: "admin-1",
    email: "admin@balyabhavan.edu",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "user-1",
    email: "rajesh.kumar@email.com",
    name: "Rajesh Kumar",
    role: "user",
    batch: "1995-2000",
    department: "Computer Science",
    phone: "+91 98765 43210",
    address: "Jorhat, Assam",
    yearOfPassing: "2000",
    registrationDate: "2025-01-15",
    status: "active",
  },
]

// Mock password storage - replace with real database
const passwords: Record<string, string> = {
  "admin@balyabhavan.edu": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // admin123
  "rajesh.kumar@email.com": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // user123
}

export const REGISTRATION_CAPACITY = 1000

export function getRegistrationStats() {
  const totalUsers = users.filter((u) => u.role === "user").length
  const activeUsers = users.filter((u) => u.role === "user" && (u as User).status === "active").length
  const pendingUsers = users.filter((u) => u.role === "user" && (u as User).status === "pending").length

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    availableSlots: REGISTRATION_CAPACITY - totalUsers,
    isCapacityFull: totalUsers >= REGISTRATION_CAPACITY,
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
  }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(jwtPayload))
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    // Check expiration
    if (payload.exp && payload.exp < now) {
      console.log("[v0] JWT expired")
      return null
    }

    return payload
  } catch (error) {
    console.log("[v0] JWT verification failed, returning null")
    return null
  }
}

export async function registerUser(userData: {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  batch?: string
  department?: string
  yearOfPassing?: string
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if registration is at capacity
    const stats = getRegistrationStats()
    if (stats.isCapacityFull) {
      return { success: false, error: "Registration capacity reached. Maximum 1000 users allowed." }
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, error: "User with this email already exists." }
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Generate unique user ID
    const userId = `ALM-${new Date().getFullYear()}-${String(stats.totalUsers + 1).padStart(3, "0")}`

    // Create new user
    const newUser: User = {
      id: userId,
      email: userData.email,
      name: userData.name,
      role: "user",
      phone: userData.phone,
      address: userData.address,
      batch: userData.batch,
      department: userData.department,
      yearOfPassing: userData.yearOfPassing,
      registrationDate: new Date().toISOString().split("T")[0],
      status: "active",
    }

    // Add to users array (in production, save to database)
    users.push(newUser)
    passwords[userData.email] = hashedPassword

    return { success: true, user: newUser }
  } catch (error) {
    return { success: false, error: "Registration failed. Please try again." }
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | Admin | null> {
  const user = users.find((u) => u.email === email)
  if (!user) return null

  const hashedPassword = passwords[email]
  if (!hashedPassword) return null

  const isValid = await verifyPassword(password, hashedPassword)
  if (!isValid) return null

  return user
}

export async function getCurrentUser(): Promise<User | Admin | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const user = users.find((u) => u.id === payload.userId)
    return user || null
  } catch (error) {
    console.log("[v0] getCurrentUser error:", error)
    return null
  }
}

export function getAllUsers(): User[] {
  return users.filter((u) => u.role === "user") as User[]
}

export function updateUserStatus(userId: string, status: "active" | "pending" | "suspended"): boolean {
  const userIndex = users.findIndex((u) => u.id === userId && u.role === "user")
  if (userIndex === -1) return false
  ;(users[userIndex] as User).status = status
  return true
}

export async function setAuthCookie(user: User | Admin): Promise<void> {
  try {
    const token = await signJWT({ userId: user.id, role: user.role })
    const cookieStore = cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: false, // Always false for demo purposes
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    console.log("[v0] Auth cookie set successfully for:", user.email)
  } catch (error) {
    console.log("[v0] Failed to set auth cookie:", error)
    throw error
  }
}

export async function clearAuthCookie(): Promise<void> {
  try {
    const cookieStore = cookies()
    cookieStore.delete("auth-token")
  } catch (error) {
    console.log("[v0] Failed to clear auth cookie:", error)
  }
}

export function isAdmin(user: User | Admin | null): user is Admin {
  return user?.role === "admin"
}

export function isUser(user: User | Admin | null): user is User {
  return user?.role === "user"
}

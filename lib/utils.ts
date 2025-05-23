import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie'
import { User } from './schema'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setUserCookie(user: User) {
  // Remove sensitive data
  const { password, ...safeUser } = user
  
  // Store in both localStorage and cookies
  localStorage.setItem('user', JSON.stringify(safeUser))
  Cookies.set('user', JSON.stringify(safeUser), { expires: 7 }) // Expires in 7 days
}

export function getUserFromCookie(): User | null {
  try {
    const userStr = Cookies.get('user')
    if (!userStr) return null
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Error parsing user cookie:', error)
    return null
  }
}

export function clearUserData() {
  localStorage.removeItem('user')
  Cookies.remove('user')
}

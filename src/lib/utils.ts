import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-AU', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit'
  })
}

export function getDaysUntil(date: string) {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getGreeting(name?: string) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${greeting}, ${name.split(' ')[0]}` : greeting
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function getPriorityColor(priority: number) {
  switch (priority) {
    case 1: return 'text-danger bg-danger/10 border-danger/20'
    case 2: return 'text-warning bg-warning/10 border-warning/20'
    case 3: return 'text-muted bg-surface border-border'
    default: return 'text-muted bg-surface border-border'
  }
}

export function getPriorityLabel(priority: number) {
  switch (priority) {
    case 1: return 'High'
    case 2: return 'Medium'
    case 3: return 'Low'
    default: return 'Medium'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'text-success bg-success/10 border-success/20'
    case 'completed': return 'text-accent bg-accent/10 border-accent/20'
    case 'at_risk': return 'text-danger bg-danger/10 border-danger/20'
    case 'paused': return 'text-warning bg-warning/10 border-warning/20'
    default: return 'text-muted bg-surface border-border'
  }
}

export function isTrialExpired(trialEndsAt: string) {
  return new Date(trialEndsAt) < new Date()
}

export function getTrialDaysLeft(trialEndsAt: string) {
  return getDaysUntil(trialEndsAt)
}

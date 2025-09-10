import DashboardLoading from '@/components/DashboardLoading'

export default function Template({ children }: { children: React.ReactNode }) {
  return children
}

// This will be shown during route transitions
export { default as loading } from './loading'

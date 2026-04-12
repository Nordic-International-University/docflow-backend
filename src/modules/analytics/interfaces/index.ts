export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface AnalyticsFilter {
  dateRange?: DateRange
  departmentId?: number
  userId?: number
}

export interface StatusCount {
  status: string
  count: number
}

export interface PriorityCount {
  priority: string
  count: number
}

export interface TimeSeriesData {
  period: string
  count: number
  metadata?: Record<string, unknown>
}

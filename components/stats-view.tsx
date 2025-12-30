"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import type { Scenario } from "@/lib/types"

interface StatsViewProps {
  scenarios: Scenario[]
}

export function StatsView({ scenarios }: StatsViewProps) {
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    scenarios.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / scenarios.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
  }, [scenarios])

  const tagFrequency = useMemo(() => {
    const tagCounts: Record<string, number> = {}
    scenarios.forEach((s) => {
      s.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }, [scenarios])

  const recentActivity = useMemo(() => {
    const byDate: Record<string, number> = {}
    scenarios.forEach((s) => {
      byDate[s.createdAt] = (byDate[s.createdAt] || 0) + 1
    })
    return Object.entries(byDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 10)
  }, [scenarios])

  const maxCount = Math.max(...categoryDistribution.map((c) => c.count), 1)

  return (
    <div className="space-y-6">
      {/* Category Distribution */}
      <div>
        <h3 className="font-semibold mb-4 text-foreground">카테고리별 분포</h3>
        <div className="space-y-3">
          {categoryDistribution.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="text-foreground">{cat.name}</span>
                <span className="text-muted-foreground">
                  {cat.count} ({cat.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(cat.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag Cloud */}
      <div>
        <h3 className="font-semibold mb-4 text-foreground">자주 사용된 태그</h3>
        <div className="flex flex-wrap gap-2">
          {tagFrequency.map(({ tag, count }) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-sm"
              style={{
                fontSize: `${Math.min(14 + count * 2, 20)}px`,
              }}
            >
              {tag} ({count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold mb-4 text-foreground">최근 추가 내역</h3>
        <div className="space-y-2">
          {recentActivity.map(([date, count]) => (
            <div key={date} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
              <span className="text-sm text-foreground">{date}</span>
              <Badge variant="outline">{count} 시나리오</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

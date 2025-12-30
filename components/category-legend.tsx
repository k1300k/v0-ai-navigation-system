"use client"

import { Card } from "@/components/ui/card"
import { Navigation, AlertCircle, MapPin, ParkingCircle, Cloud, Car, Calendar, AlertTriangle } from "lucide-react"

interface CategoryLegendProps {
  categoryStats: Record<string, number>
}

const categories = [
  {
    name: "경로안내",
    icon: Navigation,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "목적지 설정, 경로 탐색, 재탐색",
  },
  {
    name: "교통정보",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    description: "실시간 정체, 사고 정보, 도로 공사",
  },
  {
    name: "주변시설",
    icon: MapPin,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    description: "주유소, 휴게소, 편의점, 식당",
  },
  {
    name: "주차안내",
    icon: ParkingCircle,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    description: "주차장 검색, 요금, 가능 여부",
  },
  {
    name: "날씨/도로",
    icon: Cloud,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    description: "기상 정보, 노면 상태, 안전 운행",
  },
  {
    name: "차량제어",
    icon: Car,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    description: "에어컨, 히터, 오디오, 창문 제어",
  },
  {
    name: "일정관리",
    icon: Calendar,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    description: "약속 시간, 출발 알림, 도착 예정",
  },
  {
    name: "긴급상황",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-600/10",
    border: "border-red-600/20",
    description: "사고 신고, 응급실 안내, 긴급 출동",
  },
]

export function CategoryLegend({ categoryStats }: CategoryLegendProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-foreground">카테고리 (Categories)</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon
          const count = categoryStats[category.name] || 0

          return (
            <Card
              key={category.name}
              className={`p-4 border ${category.border} ${category.bg} transition-all hover:scale-105`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg ${category.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-sm ${category.color}`}>{category.name}</h3>
                    <span className={`text-xl font-bold ${category.color}`}>{count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Navigation,
  AlertCircle,
  MapPin,
  ParkingCircle,
  Cloud,
  Car,
  Calendar,
  AlertTriangle,
  Plus,
  Download,
  BarChart3,
  Search,
  ChevronDown,
  Edit,
  Trash2,
} from "lucide-react"
import { ScenarioForm } from "@/components/scenario-form"
import { StatsView } from "@/components/stats-view"
import { CategoryLegend } from "@/components/category-legend"
import type { Scenario } from "@/lib/types"

const initialScenarios: Scenario[] = [
  {
    id: "NAV_001",
    category: "경로안내",
    query: {
      raw: "회사까지 가장 빠른 길로 안내해줘",
      context: "출근 시간대, 자택 출발",
      intent: "최적 경로 탐색",
      expectation: "실시간 최단시간 경로",
      action: "경로 탐색 및 안내 시작",
    },
    response: {
      trigger: "현재 위치에서 회사까지",
      phenomenon: "주요 도로 출근 정체 중",
      impact: "예상 35분, 5분 지연",
      offer: "우회 경로로 안내 시작",
    },
    tags: ["출퇴근", "실시간교통"],
    createdAt: "2024-01-15",
  },
  {
    id: "NAV_002",
    category: "주변시설",
    query: {
      raw: "근처 주유소 찾아줘",
      context: "고속도로 주행 중, 연료 부족",
      intent: "가까운 주유소 검색",
      expectation: "거리순 주유소 목록",
      action: "POI 검색 및 경로 안내",
    },
    response: {
      trigger: "현재 위치 반경 5km 내",
      phenomenon: "3개 주유소 이용 가능",
      impact: "가장 가까운 곳 2km, 5분 소요",
      offer: "○○ 주유소로 안내할까요?",
    },
    tags: ["주유소", "POI검색"],
    createdAt: "2024-01-14",
  },
]

export default function NaviAIDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((scenario) => {
      const matchesSearch =
        scenario.query.raw.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = categoryFilter === "all" || scenario.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [scenarios, searchTerm, categoryFilter])

  const handleSaveScenario = (scenario: Scenario) => {
    if (editingScenario) {
      setScenarios((prev) => prev.map((s) => (s.id === scenario.id ? scenario : s)))
    } else {
      setScenarios((prev) => [...prev, scenario])
    }
    setIsFormOpen(false)
    setEditingScenario(null)
  }

  const handleEditScenario = (scenario: Scenario) => {
    setEditingScenario(scenario)
    setIsFormOpen(true)
  }

  const handleDeleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(scenarios, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "naviAI-scenarios.json"
    link.click()
  }

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {}
    scenarios.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1
    })
    return counts
  }, [scenarios])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1600px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">NaviAI 시나리오 관리 시스템</h1>
              <p className="text-sm text-muted-foreground mt-1">AI 에이전트 내비게이션 서비스 시나리오 데이터베이스</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsStatsOpen(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                통계 보기
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
              <Button size="sm" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />새 시나리오 추가
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">전체 시나리오</p>
                <p className="text-3xl font-semibold text-foreground">{scenarios.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">카테고리 수</p>
                <p className="text-3xl font-semibold text-foreground">{Object.keys(categoryStats).length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">최근 추가</p>
                <p className="text-3xl font-semibold text-foreground">
                  {
                    scenarios.filter((s) => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                      .length
                  }
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Category Legend */}
        <CategoryLegend categoryStats={categoryStats} />

        {/* Search and Filter */}
        <Card className="p-6 border-border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="시나리오 검색 (ID, 발화, 태그)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="경로안내">경로안내</SelectItem>
                <SelectItem value="교통정보">교통정보</SelectItem>
                <SelectItem value="주변시설">주변시설</SelectItem>
                <SelectItem value="주차안내">주차안내</SelectItem>
                <SelectItem value="날씨/도로">날씨/도로</SelectItem>
                <SelectItem value="차량제어">차량제어</SelectItem>
                <SelectItem value="일정관리">일정관리</SelectItem>
                <SelectItem value="긴급상황">긴급상황</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Scenarios Table */}
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead className="w-[140px]">카테고리</TableHead>
                <TableHead>사용자 발화</TableHead>
                <TableHead className="w-[120px]">생성일</TableHead>
                <TableHead className="w-[100px] text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScenarios.map((scenario) => (
                <>
                  <TableRow
                    key={scenario.id}
                    className="cursor-pointer border-border hover:bg-muted/50"
                    onClick={() => setExpandedRow(expandedRow === scenario.id ? null : scenario.id)}
                  >
                    <TableCell className="font-mono text-sm">{scenario.id}</TableCell>
                    <TableCell>
                      <CategoryBadge category={scenario.category} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <span className="text-sm line-clamp-2">{scenario.query.raw}</span>
                        <ChevronDown
                          className={`h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0 transition-transform ${
                            expandedRow === scenario.id ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{scenario.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => handleEditScenario(scenario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteScenario(scenario.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === scenario.id && (
                    <TableRow className="border-border">
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="py-4 px-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Query Analysis */}
                          <div>
                            <h4 className="font-semibold text-sm mb-3 text-foreground">질의 분석 (Query Analysis)</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Context:</span>{" "}
                                <span className="text-foreground">{scenario.query.context}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Intent:</span>{" "}
                                <span className="text-foreground">{scenario.query.intent}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Expectation:</span>{" "}
                                <span className="text-foreground">{scenario.query.expectation}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Action:</span>{" "}
                                <span className="text-foreground">{scenario.query.action}</span>
                              </div>
                            </div>
                          </div>

                          {/* AI Response */}
                          <div>
                            <h4 className="font-semibold text-sm mb-3 text-foreground">AI 응답 (Assistant Response)</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Trigger:</span>{" "}
                                <span className="text-foreground">{scenario.response.trigger}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Phenomenon:</span>{" "}
                                <span className="text-foreground">{scenario.response.phenomenon}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Impact:</span>{" "}
                                <span className="text-foreground">{scenario.response.impact}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Offer:</span>{" "}
                                <span className="text-foreground">{scenario.response.offer}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="md:col-span-2">
                            <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                            <div className="inline-flex gap-2 flex-wrap mt-1">
                              {scenario.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingScenario ? "시나리오 수정" : "새 시나리오 추가"}</DialogTitle>
            <DialogDescription>사용자 발화를 분석하고 AI 응답을 구조화하여 저장합니다.</DialogDescription>
          </DialogHeader>
          <ScenarioForm
            scenario={editingScenario}
            onSave={handleSaveScenario}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingScenario(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>시나리오 통계</DialogTitle>
            <DialogDescription>카테고리별 분포 및 시나리오 추이를 확인합니다.</DialogDescription>
          </DialogHeader>
          <StatsView scenarios={scenarios} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const config: Record<string, { color: string; icon: typeof Navigation; bg: string }> = {
    경로안내: {
      color: "text-blue-500",
      icon: Navigation,
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    교통정보: {
      color: "text-red-500",
      icon: AlertCircle,
      bg: "bg-red-500/10 border-red-500/20",
    },
    주변시설: {
      color: "text-green-500",
      icon: MapPin,
      bg: "bg-green-500/10 border-green-500/20",
    },
    주차안내: {
      color: "text-purple-500",
      icon: ParkingCircle,
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    "날씨/도로": {
      color: "text-gray-400",
      icon: Cloud,
      bg: "bg-gray-500/10 border-gray-500/20",
    },
    차량제어: {
      color: "text-orange-500",
      icon: Car,
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    일정관리: {
      color: "text-cyan-500",
      icon: Calendar,
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    긴급상황: {
      color: "text-red-600",
      icon: AlertTriangle,
      bg: "bg-red-600/10 border-red-600/20",
    },
  }

  const { color, icon: Icon, bg } = config[category] || config["경로안내"]

  return (
    <Badge variant="outline" className={`${bg} border`}>
      <Icon className={`h-3 w-3 mr-1 ${color}`} />
      <span className={color}>{category}</span>
    </Badge>
  )
}

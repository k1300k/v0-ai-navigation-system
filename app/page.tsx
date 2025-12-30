"use client"

import { useState, useMemo, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { ScenarioForm } from "@/components/scenario-form"
import { StatsView } from "@/components/stats-view"
import { CategoryLegend } from "@/components/category-legend"
import type { Scenario } from "@/lib/types"
import {
  getAllScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  getScenarioStats,
} from "@/lib/actions/scenarios"
import { useToast } from "@/hooks/use-toast"

export default function NaviAIDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    categoryCount: 0,
    recentCount: 0,
    categoryStats: {} as Record<string, number>,
  })
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    loadScenarios()
    loadStats()
  }, [])

  const loadScenarios = async () => {
    try {
      setIsLoading(true)
      const data = await getAllScenarios()
      setScenarios(data)
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "시나리오를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getScenarioStats()
      setStats(data)
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    }
  }

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

  const handleSaveScenario = async (scenario: Scenario) => {
    try {
      if (editingScenario) {
        await updateScenario(scenario)
        toast({
          title: "성공",
          description: "시나리오가 수정되었습니다.",
        })
      } else {
        await createScenario(scenario)
        toast({
          title: "성공",
          description: "시나리오가 추가되었습니다.",
        })
      }
      setIsFormOpen(false)
      setEditingScenario(null)
      await loadScenarios()
      await loadStats()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "시나리오 저장에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleEditScenario = (scenario: Scenario) => {
    setEditingScenario(scenario)
    setIsFormOpen(true)
  }

  const handleDeleteScenario = async (id: string) => {
    if (!confirm("정말 이 시나리오를 삭제하시겠습니까?")) {
      return
    }

    try {
      await deleteScenario(id)
      toast({
        title: "성공",
        description: "시나리오가 삭제되었습니다.",
      })
      await loadScenarios()
      await loadStats()
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "시나리오 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
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

  const categoryStats = stats.categoryStats

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">시나리오를 불러오는 중...</p>
        </div>
      </div>
    )
  }

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
        {/* Stats Cards - Use database stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">전체 시나리오</p>
                <p className="text-3xl font-semibold text-foreground">{stats.total}</p>
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
                <p className="text-3xl font-semibold text-foreground">{stats.categoryCount}</p>
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
                <p className="text-3xl font-semibold text-foreground">{stats.recentCount}</p>
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
                    <TableRow key={`${scenario.id}-expanded`} className="border-border">
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

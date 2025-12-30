"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Scenario } from "@/lib/types"
import { analyzeMultipleQueries } from "@/lib/actions/ai-analysis"
import { Loader2, Sparkles } from "lucide-react"

interface ScenarioFormProps {
  scenario: Scenario | null
  onSave: (scenario: Scenario) => void
  onCancel: () => void
  onMultipleSave?: (scenarios: Scenario[]) => void
}

export function ScenarioForm({ scenario, onSave, onCancel, onMultipleSave }: ScenarioFormProps) {
  const [formData, setFormData] = useState<Scenario>({
    id: "",
    category: "경로안내",
    query: {
      raw: "",
      context: "",
      intent: "",
      expectation: "",
      action: "",
    },
    response: {
      trigger: "",
      phenomenon: "",
      impact: "",
      offer: "",
    },
    tags: [],
    createdAt: new Date().toISOString().split("T")[0],
  })
  const [tagInput, setTagInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (scenario) {
      setFormData(scenario)
      setTagInput(scenario.tags.join(", "))
    }
  }, [scenario])

  const handleAIAnalysis = async () => {
    if (!formData.query.raw.trim()) {
      return
    }

    setIsAnalyzing(true)
    try {
      const analyzedScenarios = await analyzeMultipleQueries(formData.query.raw)

      if (analyzedScenarios.length === 1) {
        const analyzed = analyzedScenarios[0]
        setFormData(analyzed)
        setTagInput(analyzed.tags.join(", "))
      } else if (analyzedScenarios.length > 1 && onMultipleSave) {
        onMultipleSave(analyzedScenarios)
      }
    } catch (error) {
      console.error("[v0] Analysis error:", error)
      alert("질의 분석에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalData = {
      ...formData,
      id: formData.id || `NAV_${Date.now().toString().slice(-6)}`,
      tags: tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    onSave(finalData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="id">시나리오 ID</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="자동 생성"
          />
        </div>
        <div>
          <Label htmlFor="category">카테고리 *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
        <div>
          <Label htmlFor="date">생성일</Label>
          <Input
            id="date"
            type="date"
            value={formData.createdAt}
            onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
          />
        </div>
      </div>

      {/* User Utterance with AI Analysis */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="raw">사용자 발화 (Raw Utterance) *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || !formData.query.raw.trim()}
            className="gap-2 bg-transparent"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI 자동 분석
              </>
            )}
          </Button>
        </div>
        <Textarea
          id="raw"
          value={formData.query.raw}
          onChange={(e) =>
            setFormData({
              ...formData,
              query: { ...formData.query, raw: e.target.value },
            })
          }
          placeholder="예: 회사까지 가장 빠른 길로 안내해줘&#10;&#10;여러 질의를 줄바꿈으로 구분하여 입력하면 각각 분석됩니다."
          className="min-h-[100px]"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 팁: 여러 질의를 줄바꿈으로 구분하여 입력한 후 'AI 자동 분석'을 클릭하면 각각 개별 시나리오로 생성됩니다.
        </p>
      </div>

      {/* Query Analysis Section */}
      <div className="border border-border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-4 text-foreground">질의 분석 (Query Analysis)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="context">Context (상황) *</Label>
            <Textarea
              id="context"
              value={formData.query.context}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  query: { ...formData.query, context: e.target.value },
                })
              }
              placeholder="운전 상황, 환경적 맥락"
              className="min-h-[70px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="intent">Intent (의도) *</Label>
            <Textarea
              id="intent"
              value={formData.query.intent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  query: { ...formData.query, intent: e.target.value },
                })
              }
              placeholder="사용자의 핵심 목적"
              className="min-h-[70px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="expectation">Expectation (기대) *</Label>
            <Textarea
              id="expectation"
              value={formData.query.expectation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  query: { ...formData.query, expectation: e.target.value },
                })
              }
              placeholder="원하는 정보나 결과"
              className="min-h-[70px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="action">Action (행동) *</Label>
            <Textarea
              id="action"
              value={formData.query.action}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  query: { ...formData.query, action: e.target.value },
                })
              }
              placeholder="시스템이 수행할 동작"
              className="min-h-[70px]"
              required
            />
          </div>
        </div>
      </div>

      {/* AI Response Section */}
      <div className="border border-border rounded-lg p-4 bg-muted/30">
        <h3 className="font-semibold mb-4 text-foreground">AI 응답 (Assistant Response)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trigger">Trigger (위치/시점) *</Label>
            <Textarea
              id="trigger"
              value={formData.response.trigger}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  response: { ...formData.response, trigger: e.target.value },
                })
              }
              placeholder="정보 제공 기준점"
              className="min-h-[70px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="phenomenon">Phenomenon (현상/원인) *</Label>
            <Textarea
              id="phenomenon"
              value={formData.response.phenomenon}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  response: { ...formData.response, phenomenon: e.target.value },
                })
              }
              placeholder="현재 상황 설명"
              className="min-h-[70px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="impact">Impact (영향/의미) *</Label>
            <Textarea
              id="impact"
              value={formData.response.impact}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  response: { ...formData.response, impact: e.target.value },
                })
              }
              placeholder="운전자에 미치는 영향"
              className="min-h-[70px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="offer">Offer (제안/행동) *</Label>
            <Textarea
              id="offer"
              value={formData.response.offer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  response: { ...formData.response, offer: e.target.value },
                })
              }
              placeholder="구체적인 해결책"
              className="min-h-[70px]"
              required
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="출퇴근, 실시간교통, 음성명령"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">{scenario ? "수정 완료" : "저장"}</Button>
      </div>
    </form>
  )
}

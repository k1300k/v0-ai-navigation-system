"use server"

import { generateObject } from "ai"
import { z } from "zod"
import type { Scenario } from "@/lib/types"

const scenarioAnalysisSchema = z.object({
  scenarios: z.array(
    z.object({
      category: z.enum([
        "경로안내",
        "교통정보",
        "주변시설",
        "주차안내",
        "날씨/도로",
        "차량제어",
        "일정관리",
        "긴급상황",
      ]),
      query_raw: z.string(),
      query_context: z.string().describe("운전 상황, 환경적 맥락"),
      query_intent: z.string().describe("사용자의 핵심 목적"),
      query_expectation: z.string().describe("원하는 정보나 결과"),
      query_action: z.string().describe("시스템이 수행할 동작"),
      response_trigger: z.string().describe("정보 제공 기준점 (위치/시점)"),
      response_phenomenon: z.string().describe("현재 상황 설명 (현상/원인)"),
      response_impact: z.string().describe("운전자에 미치는 영향"),
      response_offer: z.string().describe("구체적인 해결책 (제안/행동)"),
      tags: z.array(z.string()).describe("관련 태그들"),
    }),
  ),
})

export async function analyzeMultipleQueries(rawText: string): Promise<Scenario[]> {
  try {
    // Split by newlines or multiple spaces to get individual queries
    const queries = rawText
      .split(/[\n]+/)
      .map((q) => q.trim())
      .filter((q) => q.length > 0)

    if (queries.length === 0) {
      throw new Error("분석할 질의가 없습니다.")
    }

    const { object } = await generateObject({
      model: "openai/gpt-5",
      schema: scenarioAnalysisSchema,
      prompt: `당신은 자동차 내비게이션 AI 시스템의 시나리오 분석 전문가입니다. 
다음 사용자 발화들을 분석하여 각각에 대해 상세한 시나리오를 생성하세요.

사용자 발화들:
${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

각 발화에 대해 다음을 분석하세요:
1. 적절한 카테고리 선택 (경로안내, 교통정보, 주변시설, 주차안내, 날씨/도로, 차량제어, 일정관리, 긴급상황)
2. 질의 분석:
   - Context: 운전 상황과 환경적 맥락
   - Intent: 사용자의 핵심 목적
   - Expectation: 원하는 정보나 결과
   - Action: 시스템이 수행할 동작
3. AI 응답 생성:
   - Trigger: 정보 제공 기준점 (위치/시점)
   - Phenomenon: 현재 상황 설명 (현상/원인)
   - Impact: 운전자에 미치는 영향
   - Offer: 구체적인 해결책
4. 관련 태그들 (2-4개)

한국 도로 상황과 내비게이션 사용 패턴에 맞게 현실적이고 구체적으로 작성하세요.`,
      maxOutputTokens: 4000,
    })

    // Convert to Scenario format
    const scenarios: Scenario[] = object.scenarios.map((s, index) => ({
      id: `NAV_${Date.now()}_${index}`,
      category: s.category,
      query: {
        raw: s.query_raw,
        context: s.query_context,
        intent: s.query_intent,
        expectation: s.query_expectation,
        action: s.query_action,
      },
      response: {
        trigger: s.response_trigger,
        phenomenon: s.response_phenomenon,
        impact: s.response_impact,
        offer: s.response_offer,
      },
      tags: s.tags,
      createdAt: new Date().toISOString().split("T")[0],
    }))

    return scenarios
  } catch (error) {
    console.error("[v0] Error analyzing queries:", error)
    throw new Error("질의 분석에 실패했습니다.")
  }
}

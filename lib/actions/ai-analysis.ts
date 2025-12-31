"use server"

import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
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

export async function analyzeMultipleQueries(
  rawText: string,
  config?: { provider: string; model: string; apiKey?: string },
): Promise<Scenario[]> {
  try {
    console.log("[v0] Starting AI analysis")
    console.log("[v0] Provider:", config?.provider || "vercel")
    console.log("[v0] Model:", config?.model || "openai/gpt-4o-mini")
    console.log("[v0] Input text length:", rawText.length)

    const queries = rawText
      .split(/[\n.]{3,}|[\n]+/)
      .map((q) => q.trim().replace(/^[\d.]+\s*/, ""))
      .filter((q) => q.length > 3 && !q.startsWith("#"))

    console.log("[v0] Parsed queries:", queries)
    console.log("[v0] Queries count:", queries.length)

    if (queries.length === 0) {
      throw new Error("분석할 질의가 없습니다.")
    }

    // Determine which model to use
    let modelString = config?.model || "openai/gpt-4o-mini"
    let modelProvider: any = undefined

    if (config?.provider === "openai" && config.apiKey) {
      // Use OpenAI directly with custom API key
      const openai = createOpenAI({
        apiKey: config.apiKey,
      })
      modelProvider = openai(config.model)
      console.log("[v0] Using OpenAI with custom API key")
    } else if (config?.provider === "google" && config.apiKey) {
      // Use Google Gemini with custom API key
      const google = createGoogleGenerativeAI({
        apiKey: config.apiKey,
      })
      modelProvider = google(config.model)
      console.log("[v0] Using Google Gemini with custom API key")
    } else {
      // Use Vercel AI Gateway (default, no API key needed)
      modelString = config?.model || "openai/gpt-4o-mini"
      console.log("[v0] Using Vercel AI Gateway:", modelString)
    }

    const result = await generateObject({
      model: modelProvider || modelString,
      schema: scenarioAnalysisSchema,
      prompt: `당신은 자동차 내비게이션 AI 시스템의 시나리오 분석 전문가입니다. 
사용자의 자연스러운 발화를 분석하여 구체적이고 현실적인 AI 시나리오를 생성하세요.

## 분석할 사용자 발화들:
${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

## 분석 가이드라인:

### 1. 카테고리 분류 기준:
- **경로안내**: 목적지, 길찾기, 경로 선택, 소요시간
- **교통정보**: 정체, 사고, 도로상황, 소요시간 변화
- **주변시설**: POI 검색 (주유소, 화장실, 카페, 주차장 등)
- **주차안내**: 주차장 위치, 주차 가능 여부, 입구 찾기
- **날씨/도로**: 날씨, 노면 상태, 시야, 환경적 위험요소
- **차량제어**: 차량 성능, 제한, 주행 가능성
- **일정관리**: 시간, 일정, 우선순위, 경유지
- **긴급상황**: 사고, 고장, 응급 상황

### 2. 질의 분석 (Query) - 사용자 의도 파악:
**Context (맥락)**: 운전 중 상황을 구체적으로
  예) "고속도로 주행 중, 연료 부족", "출근 시간대, 자택 출발"

**Intent (의도)**: 핵심 목적을 명확히
  예) "가까운 주유소 검색", "최적 경로 탐색", "도로 안전성 확인"

**Expectation (기대)**: 원하는 정보 형태
  예) "거리순 주유소 목록", "우회 경로 제안", "노면 상태 정보"

**Action (행동)**: 시스템이 해야 할 것
  예) "POI 검색 및 경로 안내", "교통정보 조회 및 대안 제시"

### 3. AI 응답 생성 (Response) - 시스템의 구체적 답변:
**Trigger (기준점)**: 언제/어디서 정보를 제공하는지
  예) "현재 위치 반경 5km 내", "현재 경로 기준"

**Phenomenon (현상)**: 지금 무슨 일이 일어나고 있는지
  예) "3개 주유소 이용 가능", "주요 도로 출근 정체 중"

**Impact (영향)**: 운전자에게 미치는 실질적 영향
  예) "가장 가까운 곳 2km, 5분 소요", "예상 35분, 5분 지연"

**Offer (제안)**: 구체적인 해결책이나 다음 행동
  예) "○○ 주유소로 안내할까요?", "우회 경로로 안내 시작"

### 4. 실제 예시:

**발화**: "지금 비 많이 와? 미끄럽지 않을까?"
- Category: 날씨/도로
- Context: 주행 중, 기상 악화 감지
- Intent: 도로 안전성 확인
- Expectation: 노면 상태 및 주행 주의사항
- Action: 날씨/노면 정보 제공 및 안전 알림
- Trigger: 현재 주행 중인 도로 구간
- Phenomenon: 강우량 시간당 20mm, 노면 젖음
- Impact: 제동거리 1.5배 증가, 미끄럼 위험
- Offer: 속도 줄이고 차간거리 확보 권장
- Tags: [날씨, 안전운전, 노면상태]

**발화**: "앞에 왜 이렇게 막혀?"
- Category: 교통정보
- Context: 주행 중, 예상치 못한 정체 발생
- Intent: 정체 원인 및 해소 시간 파악
- Expectation: 정체 원인 및 예상 소요시간
- Action: 교통정보 분석 및 대안 경로 제시
- Trigger: 현재 위치 기준 전방 2km
- Phenomenon: 3차로 추돌사고로 1차로만 통행
- Impact: 평소 대비 15분 지연 예상
- Offer: 우측 국도 경유 시 5분 단축 가능
- Tags: [교통정체, 사고, 대안경로]

**발화**: "아이들 화장실 급한데 가까운 곳 어디야?"
- Category: 주변시설
- Context: 주행 중, 긴급 화장실 필요
- Intent: 가장 가까운 화장실 찾기
- Expectation: 거리순 화장실 위치 정보
- Action: 화장실 있는 POI 검색 및 안내
- Trigger: 현재 위치 반경 3km 이내
- Phenomenon: 2개 휴게소, 1개 주유소 이용 가능
- Impact: 가장 가까운 곳 1.5km, 3분 소요
- Offer: ○○ 휴게소 화장실로 안내할까요?
- Tags: [화장실, 긴급, 휴게시설]

## 주의사항:
- 각 필드는 구체적이고 실용적으로 작성
- 한국 도로 환경과 운전 문화 반영
- 모호한 표현 지양, 수치와 거리 포함
- AI 응답은 친근하고 자연스러운 말투로
- 태그는 2-4개, 검색 가능한 키워드 중심`,
    })

    console.log("[v0] AI SDK call successful")
    console.log("[v0] Scenarios count:", result.object.scenarios.length)

    const currentDateTime = new Date().toISOString().slice(0, 16).replace("T", " ")

    // Convert to Scenario format
    const scenarios: Scenario[] = result.object.scenarios.map((s, index) => ({
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
      createdAt: currentDateTime,
    }))

    console.log("[v0] Successfully created", scenarios.length, "scenarios")
    return scenarios
  } catch (error) {
    console.error("[v0] ===== ERROR IN AI ANALYSIS =====")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Full error:", error)
    if (error instanceof Error && error.stack) {
      console.error("[v0] Stack trace:", error.stack)
    }
    console.error("[v0] ================================")
    throw new Error(`질의 분석에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
  }
}

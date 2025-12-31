"use server"

import { createClient } from "@/lib/supabase/server"
import type { Scenario } from "@/lib/types"
import { revalidatePath } from "next/cache"

// Helper to convert DB row to Scenario type
function dbRowToScenario(row: any): Scenario {
  const createdDate = new Date(row.created_at)
  const koreaTime = new Date(createdDate.getTime() + 9 * 60 * 60 * 1000) // UTC+9
  const formattedDate = koreaTime.toISOString().slice(0, 16).replace("T", " ") // YYYY-MM-DD HH:mm

  return {
    id: row.id,
    category: row.category,
    query: {
      raw: row.query_raw,
      context: row.query_context,
      intent: row.query_intent,
      expectation: row.query_expectation,
      action: row.query_action,
    },
    response: {
      trigger: row.response_trigger,
      phenomenon: row.response_phenomenon,
      impact: row.response_impact,
      offer: row.response_offer,
    },
    tags: row.tags || [],
    createdAt: formattedDate,
  }
}

// Helper to convert Scenario to DB row
function scenarioToDbRow(scenario: Scenario) {
  return {
    id: scenario.id,
    category: scenario.category,
    query_raw: scenario.query.raw,
    query_context: scenario.query.context,
    query_intent: scenario.query.intent,
    query_expectation: scenario.query.expectation,
    query_action: scenario.query.action,
    response_trigger: scenario.response.trigger,
    response_phenomenon: scenario.response.phenomenon,
    response_impact: scenario.response.impact,
    response_offer: scenario.response.offer,
    tags: scenario.tags,
  }
}

export async function getAllScenarios() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("scenarios").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching scenarios:", error)
    throw new Error("시나리오를 불러오는데 실패했습니다.")
  }

  return data.map(dbRowToScenario)
}

export async function createScenario(scenario: Scenario) {
  const supabase = await createClient()

  const { error } = await supabase.from("scenarios").insert(scenarioToDbRow(scenario))

  if (error) {
    console.error("[v0] Error creating scenario:", error)
    throw new Error("시나리오를 생성하는데 실패했습니다.")
  }

  revalidatePath("/")
  return { success: true }
}

export async function updateScenario(scenario: Scenario) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("scenarios")
    .update({
      ...scenarioToDbRow(scenario),
      updated_at: new Date().toISOString(),
    })
    .eq("id", scenario.id)

  if (error) {
    console.error("[v0] Error updating scenario:", error)
    throw new Error("시나리오를 수정하는데 실패했습니다.")
  }

  revalidatePath("/")
  return { success: true }
}

export async function deleteScenario(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("scenarios").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting scenario:", error)
    throw new Error("시나리오를 삭제하는데 실패했습니다.")
  }

  revalidatePath("/")
  return { success: true }
}

export async function getScenarioStats() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("scenarios").select("category, created_at")

  if (error) {
    console.error("[v0] Error fetching stats:", error)
    throw new Error("통계를 불러오는데 실패했습니다.")
  }

  const categoryStats: Record<string, number> = {}
  let recentCount = 0
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  data.forEach((row) => {
    categoryStats[row.category] = (categoryStats[row.category] || 0) + 1
    if (new Date(row.created_at) > weekAgo) {
      recentCount++
    }
  })

  return {
    total: data.length,
    categoryCount: Object.keys(categoryStats).length,
    recentCount,
    categoryStats,
  }
}

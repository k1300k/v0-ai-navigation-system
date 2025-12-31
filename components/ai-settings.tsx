"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Save, RotateCcw } from "lucide-react"

export interface AIConfig {
  provider: "vercel" | "openai" | "google"
  model: string
  apiKey?: string
}

const DEFAULT_CONFIG: AIConfig = {
  provider: "vercel",
  model: "openai/gpt-4o-mini",
  apiKey: "",
}

const PROVIDER_MODELS = {
  vercel: [
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (기본)" },
    { value: "openai/gpt-4o", label: "GPT-4o" },
    { value: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  ],
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  google: [
    { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
}

export function AISettings({ onSave }: { onSave?: (config: AIConfig) => void }) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved config from localStorage
    const saved = localStorage.getItem("ai-config")
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to parse saved AI config:", error)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("ai-config", JSON.stringify(config))
    onSave?.(config)
    setIsOpen(false)
    alert("AI 설정이 저장되었습니다.")
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    localStorage.removeItem("ai-config")
    alert("AI 설정이 초기화되었습니다.")
  }

  const handleProviderChange = (provider: AIConfig["provider"]) => {
    const models = PROVIDER_MODELS[provider]
    setConfig({
      provider,
      model: models[0].value,
      apiKey: config.apiKey,
    })
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Settings className="h-4 w-4 mr-2" />
        AI 설정
      </Button>
    )
  }

  return (
    <Card className="absolute top-16 right-6 z-50 w-96 p-6 shadow-lg border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI 모델 설정</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>AI 제공자</Label>
            <Select value={config.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vercel">Vercel AI Gateway (API 키 불필요)</SelectItem>
                <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                <SelectItem value="google">Google (Gemini)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {config.provider === "vercel"
                ? "별도의 API 키 없이 사용 가능합니다."
                : `${config.provider === "openai" ? "OpenAI" : "Google"} API 키가 필요합니다.`}
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>모델 선택</Label>
            <Select value={config.model} onValueChange={(model) => setConfig({ ...config, model })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_MODELS[config.provider].map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key (only for non-Vercel providers) */}
          {config.provider !== "vercel" && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder={`${config.provider === "openai" ? "sk-..." : "AI..."} API 키를 입력하세요`}
                value={config.apiKey || ""}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {config.provider === "openai" && (
                  <>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      OpenAI API 키 발급
                    </a>
                  </>
                )}
                {config.provider === "google" && (
                  <>
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Google AI Studio에서 API 키 발급
                    </a>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              초기화
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Helper function to get current AI config
export function getAIConfig(): AIConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG

  const saved = localStorage.getItem("ai-config")
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return DEFAULT_CONFIG
    }
  }
  return DEFAULT_CONFIG
}

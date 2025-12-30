export interface Scenario {
  id: string
  category: string
  query: {
    raw: string
    context: string
    intent: string
    expectation: string
    action: string
  }
  response: {
    trigger: string
    phenomenon: string
    impact: string
    offer: string
  }
  tags: string[]
  createdAt: string
}

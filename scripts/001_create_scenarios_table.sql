-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  query_raw TEXT NOT NULL,
  query_context TEXT NOT NULL,
  query_intent TEXT NOT NULL,
  query_expectation TEXT NOT NULL,
  query_action TEXT NOT NULL,
  response_trigger TEXT NOT NULL,
  response_phenomenon TEXT NOT NULL,
  response_impact TEXT NOT NULL,
  response_offer TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scenarios_category ON scenarios(category);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_at ON scenarios(created_at DESC);

-- Insert sample data
INSERT INTO scenarios (
  id, category, 
  query_raw, query_context, query_intent, query_expectation, query_action,
  response_trigger, response_phenomenon, response_impact, response_offer,
  tags
) VALUES 
(
  'NAV_001', '경로안내',
  '회사까지 가장 빠른 길로 안내해줘', '출근 시간대, 자택 출발', '최적 경로 탐색', '실시간 최단시간 경로', '경로 탐색 및 안내 시작',
  '현재 위치에서 회사까지', '주요 도로 출근 정체 중', '예상 35분, 5분 지연', '우회 경로로 안내 시작',
  ARRAY['출퇴근', '실시간교통']
),
(
  'NAV_002', '주변시설',
  '근처 주유소 찾아줘', '고속도로 주행 중, 연료 부족', '가까운 주유소 검색', '거리순 주유소 목록', 'POI 검색 및 경로 안내',
  '현재 위치 반경 5km 내', '3개 주유소 이용 가능', '가장 가까운 곳 2km, 5분 소요', '○○ 주유소로 안내할까요?',
  ARRAY['주유소', 'POI검색']
)
ON CONFLICT (id) DO NOTHING;

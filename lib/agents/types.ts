export type AgentStatus = 'idle' | 'running' | 'completed' | 'error'
export type AgentName = 'prospector' | 'sales' | 'monitor' | 'orchestrator'

export interface AgentResult {
  success: boolean
  message: string
  data?: unknown
}

export interface AgentRun {
  id: string
  agent_name: AgentName
  status: AgentStatus
  started_at: string
  completed_at?: string
  result?: unknown
  error?: string
}

export interface AgentTask {
  id: string
  run_id: string
  task_name: string
  status: AgentStatus
  data?: unknown
  created_at: string
}

export interface Lead {
  id: string
  company_name: string
  contact_name: string
  phone: string
  email: string
  website: string
  instagram: string
  city: string
  rubro: string
  score: number
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost'
  notes: string
  source: string
  outreach_sent: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

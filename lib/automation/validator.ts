export interface XyloPayload {
    customer_id: string;
    url: string;
    query: string;
    current_score: number;
    previous_score: number | null;
    score_change: number | null;
    engines: {
      chatgpt: { visible: boolean; score: number };
      gemini: { visible: boolean; score: number };
    };
    competitors_now: string[];
    ran_at: string;
  }
  
  export interface ValidationResult {
    valid: boolean;
    errors: string[];
  }
  
  export function validatePayload(payload: unknown): ValidationResult {
    const errors: string[] = [];
  
    if (!payload || typeof payload !== 'object') {
      return { valid: false, errors: ['Payload is not an object'] };
    }
  
    const p = payload as Record<string, unknown>;
  
    if (!p.customer_id || typeof p.customer_id !== 'string') errors.push('Missing customer_id');
    if (!p.url || typeof p.url !== 'string') errors.push('Missing url');
    if (!p.query || typeof p.query !== 'string') errors.push('Missing query');
    if (typeof p.current_score !== 'number') errors.push('Missing current_score');
    if (!p.engines || typeof p.engines !== 'object') {
      errors.push('Missing engines');
    } else {
      const engines = p.engines as Record<string, unknown>;
      if (!engines.chatgpt) errors.push('Missing engines.chatgpt');
      if (!engines.gemini) errors.push('Missing engines.gemini');
    }
    if (!Array.isArray(p.competitors_now)) errors.push('Missing competitors_now');
    if (!p.ran_at || typeof p.ran_at !== 'string') errors.push('Missing ran_at');
  
    return { valid: errors.length === 0, errors };
  }
// Simple rate limiter for API requests
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 250 // 250ms between requests (respects 60 req/min limit)

export async function rateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delayNeeded = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, delayNeeded))
  }
  
  lastRequestTime = Date.now()
}

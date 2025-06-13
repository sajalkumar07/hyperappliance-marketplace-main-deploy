import { redis } from './redis';

// TTL Constants (in seconds)
const CACHE_TTL = 60 * 60; // 1 hour
const SESSION_TTL = 60 * 60 * 24; // 24 hours
const DEPLOYMENT_TTL = 60 * 60 * 24 * 7; // 7 days

// Keys
const keyPrefix = {
  cache: 'cache:',
  session: 'session:',
  message: 'message:',
  deployment: 'deployment:',
  rateLimit: 'rate:',
};

// Cache related functions
export async function cacheData(key: string, data: any, ttl = CACHE_TTL): Promise<void> {
  await redis.set(`${keyPrefix.cache}${key}`, JSON.stringify(data), 'EX', ttl);
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const data = await redis.get(`${keyPrefix.cache}${key}`);
  return data ? JSON.parse(data) as T : null;
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(`${keyPrefix.cache}${key}`);
}

// Specific caching functions for marketplace entities
export async function cacheAimListing(aimId: string, data: any): Promise<void> {
  return cacheData(`aim:${aimId}`, data);
}

export async function getCachedAimListing<T>(aimId: string): Promise<T | null> {
  return getCachedData<T>(`aim:${aimId}`);
}

export async function cacheHyperboxListing(hyperboxId: string, data: any): Promise<void> {
  return cacheData(`hyperbox:${hyperboxId}`, data);
}

export async function getCachedHyperboxListing<T>(hyperboxId: string): Promise<T | null> {
  return getCachedData<T>(`hyperbox:${hyperboxId}`);
}

// Session management functions
export async function storeSession(sessionId: string, userData: any): Promise<void> {
  await redis.set(`${keyPrefix.session}${sessionId}`, JSON.stringify(userData), 'EX', SESSION_TTL);
}

export async function getSession<T>(sessionId: string): Promise<T | null> {
  const data = await redis.get(`${keyPrefix.session}${sessionId}`);
  return data ? JSON.parse(data) as T : null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`${keyPrefix.session}${sessionId}`);
}

export async function extendSession(sessionId: string): Promise<void> {
  await redis.expire(`${keyPrefix.session}${sessionId}`, SESSION_TTL);
}

// Messaging system functions
export async function storeMessage(messageId: string, message: any): Promise<void> {
  await redis.set(`${keyPrefix.message}${messageId}`, JSON.stringify(message));
}

export async function getMessage<T>(messageId: string): Promise<T | null> {
  const data = await redis.get(`${keyPrefix.message}${messageId}`);
  return data ? JSON.parse(data) as T : null;
}

export async function addMessageToConversation(conversationId: string, messageId: string): Promise<void> {
  await redis.rpush(`${keyPrefix.message}conversation:${conversationId}`, messageId);

  // also index this conversation for each participant for quick lookup
  const parts = conversationId.replace('conv_', '').split('_');
  for (const uid of parts) {
    await redis.sadd(`${keyPrefix.message}userConvs:${uid}`, conversationId);
  }
}

export async function getConversationMessages(conversationId: string, start = 0, end = -1): Promise<string[]> {
  return redis.lrange(`${keyPrefix.message}conversation:${conversationId}`, start, end);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const count = await redis.get(`${keyPrefix.message}unread:${userId}`);
  return count ? parseInt(count, 10) : 0;
}

export async function incrementUnreadCount(userId: string): Promise<void> {
  await redis.incr(`${keyPrefix.message}unread:${userId}`);
}

export async function clearUnreadCount(userId: string): Promise<void> {
  await redis.set(`${keyPrefix.message}unread:${userId}`, '0');
}

// Deployment tracking
export async function trackDeployment(deploymentId: string, data: any): Promise<void> {
  await redis.set(`${keyPrefix.deployment}${deploymentId}`, JSON.stringify(data), 'EX', DEPLOYMENT_TTL);
}

export async function getDeployment<T>(deploymentId: string): Promise<T | null> {
  const data = await redis.get(`${keyPrefix.deployment}${deploymentId}`);
  return data ? JSON.parse(data) as T : null;
}

export async function updateDeploymentStatus(deploymentId: string, status: string): Promise<void> {
  const deployment = await getDeployment(deploymentId);
  if (deployment) {
    await trackDeployment(deploymentId, { ...deployment, status, updatedAt: new Date().toISOString() });
  }
}

export async function listUserDeployments(userId: string): Promise<string[]> {
  return redis.smembers(`${keyPrefix.deployment}user:${userId}`);
}

export async function addDeploymentToUser(userId: string, deploymentId: string): Promise<void> {
  await redis.sadd(`${keyPrefix.deployment}user:${userId}`, deploymentId);
}

export async function removeDeploymentFromUser(userId: string, deploymentId: string): Promise<void> {
  await redis.srem(`${keyPrefix.deployment}user:${userId}`, deploymentId);
}

// Rate limiting 
export async function checkRateLimit(key: string, limit: number, windowSecs: number): Promise<boolean> {
  const current = await redis.incr(`${keyPrefix.rateLimit}${key}`);
  
  // Set expiry on first request
  if (current === 1) {
    await redis.expire(`${keyPrefix.rateLimit}${key}`, windowSecs);
  }
  
  return current <= limit;
}

// Conversation helpers
export async function listUserConversations(userId: string): Promise<string[]> {
  return redis.smembers(`${keyPrefix.message}userConvs:${userId}`);
}

export async function addConversationToUser(userId: string, conversationId: string): Promise<void> {
  await redis.sadd(`${keyPrefix.message}userConvs:${userId}`, conversationId);
} 
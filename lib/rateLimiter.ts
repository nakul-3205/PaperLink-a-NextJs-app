import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis= Redis.fromEnv()

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '120 s'),
  analytics: true,
})
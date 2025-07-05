import { z } from 'zod';

const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().optional(),
  SQLITE_PATH: z.string().default('./sample.db'),
  
  // Server Configuration
  PORT: z.string().transform(val => parseInt(val, 10)).default('3002'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().url().default('http://localhost:3002'),
  
  // Authentication & Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(val => parseInt(val, 10)).default('12'),
  
  // Session Configuration
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
  SECURE_COOKIES: z.string().transform(val => val === 'true').default('false'),
  
  // Database Connections
  DEFAULT_CONNECTION_ID: z.string().default('sample-db'),
  SYSTEM_DB_PATH: z.string().default('./system.db'),
  
  // Security Headers
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('./logs/app.log'),
  
  // Cloud Database Settings (Optional)
  CLOUD_POSTGRES_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  NEON_DATABASE_URL: z.string().optional(),
  RAILWAY_DATABASE_URL: z.string().optional(),
  
  // External Services (Optional)
  REDIS_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

type TEnvConfig = z.infer<typeof envSchema>;

function loadEnvironmentConfig(): TEnvConfig {
  try {
    const config = envSchema.parse(process.env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

function validateRequiredSecrets(config: TEnvConfig): void {
  const requiredSecrets = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET', 
    'SESSION_SECRET',
    'COOKIE_SECRET'
  ] as const;
  
  const missingSecrets = requiredSecrets.filter(key => {
    const value = config[key];
    return !value || value.length < 32;
  });
  
  if (missingSecrets.length > 0) {
    throw new Error(`Missing or invalid secrets: ${missingSecrets.join(', ')}`);
  }
}

function isDevelopment(config: TEnvConfig): boolean {
  return config.NODE_ENV === 'development';
}

function isProduction(config: TEnvConfig): boolean {
  return config.NODE_ENV === 'production';
}

function isTest(config: TEnvConfig): boolean {
  return config.NODE_ENV === 'test';
}

// Load and validate configuration
const env = loadEnvironmentConfig();

// Validate secrets in production
if (isProduction(env)) {
  validateRequiredSecrets(env);
}

// Export configuration and utilities
export {
  env,
  isDevelopment,
  isProduction,
  isTest,
  loadEnvironmentConfig,
  validateRequiredSecrets
};

export type { TEnvConfig };

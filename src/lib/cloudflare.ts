// Cloudflare Utilities - D1 + R2 + KV helpers

export interface CloudflareEnv {
  DB: D1Database;
  R2?: R2Bucket;
  KV?: KVNamespace;
}

/**
 * Get D1 Database from Cloudflare context
 */
export function getD1Database(env?: CloudflareEnv): D1Database {
  if (env?.DB) return env.DB;
  
  // Fallback for local development
  const globalDb = (globalThis as any).DB;
  if (globalDb) return globalDb;

  throw new Error("D1 Database binding not found");
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  env: CloudflareEnv,
  file: File | Buffer,
  key: string,
  contentType?: string
): Promise<string> {
  if (!env.R2) {
    throw new Error("R2 bucket not configured");
  }

  const arrayBuffer = file instanceof File 
    ? await file.arrayBuffer() 
    : file;

  await env.R2.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: contentType || (file instanceof File ? file.type : "application/octet-stream"),
    },
  });

  return key;
}

/**
 * Get file from R2
 */
export async function getFromR2(
  env: CloudflareEnv,
  key: string
): Promise<ArrayBuffer | null> {
  if (!env.R2) return null;
  
  const object = await env.R2.get(key);
  return object ? await object.arrayBuffer() : null;
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(env: CloudflareEnv, key: string): Promise<void> {
  if (env.R2) {
    await env.R2.delete(key);
  }
}
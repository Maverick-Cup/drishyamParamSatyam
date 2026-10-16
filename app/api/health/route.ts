import { NextResponse } from 'next/server';
import { getRepositories } from '@/adapters';
import { getCapabilityReport } from '@/config/capabilities';

export async function GET() {
  const repos = getRepositories();
  const uptimeSeconds = process.uptime();

  return NextResponse.json({
    status: 'HEALTHY',
    service: 'ParamSathya-Portal',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    storage: {
      mode: repos.isCloudMode ? 'FIRESTORE_CLOUD' : 'IN_MEMORY_FALLBACK',
      project: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'local-dev',
    },
    capabilities: getCapabilityReport(),
  });
}

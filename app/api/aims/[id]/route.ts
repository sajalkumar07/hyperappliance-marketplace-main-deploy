import { NextResponse } from 'next/server';
import { cacheAimListing, getCachedAimListing } from '@/lib/redis-utils';

// This would be replaced with your actual database query
async function fetchAimFromDatabase(id: string) {
  // Simulate database fetch
  console.log('Fetching AIM from database:', id);
  
  // In a real implementation, you would query your database here
  return {
    id,
    name: `AIM ${id}`,
    description: 'An AI module for the marketplace',
    developer_id: 'dev_123',
    required_specs: {
      gpu: 'NVIDIA A100',
      ram: '16GB'
    },
    price: '0.05',
    currency: 'ETH',
    created_at: new Date().toISOString()
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Try to get from cache first
    const cachedAim = await getCachedAimListing(id);
    
    if (cachedAim) {
      console.log('Cache hit for AIM:', id);
      return NextResponse.json({ aim: cachedAim, source: 'cache' });
    }
    
    // If not in cache, fetch from database
    console.log('Cache miss for AIM:', id);
    const aim = await fetchAimFromDatabase(id);
    
    // Store in cache for future requests
    await cacheAimListing(id, aim);
    
    return NextResponse.json({ aim, source: 'database' });
  } catch (error: any) {
    console.error('Error fetching AIM:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
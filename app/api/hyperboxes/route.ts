//app/api/hyperboxes/route.ts
import { NextResponse } from 'next/server';
import { cacheData, getCachedData } from '@/lib/redis-utils';
import prisma from '@/lib/prisma';

// Transform HyperBox DB model to API-friendly shape with specs nested
function serializeHyperBox(box: any) {
  return {
    id: box.id,
    name: box.name,
    owner: {
      id: box.owner.id,
      name: box.owner.username ?? box.owner.id.slice(0, 6),
    },
    specs: {
      gpu: box.specsGpu,
      ram: box.specsRam,
      cpu: box.specsCpu,
      location: box.location,
    },
    available: box.available,
    price: box.pricePerHour.toString(),
    currency: box.currency,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterAvailable = searchParams.get('available'); // 'true' | 'false' | null
    const filterOwner = searchParams.get('owner'); // 'me' | null
    const filterGPU = searchParams.get('gpu');
    const filterLocation = searchParams.get('location');

    // Build cache key based on filters so each variant is cached separately
    const cacheKey = `hyperboxes_list_${filterAvailable ?? 'any'}_${filterGPU ?? 'any'}_${filterLocation ?? 'any'}`;
    
    // Try to get from cache first
    const cachedHyperboxes = await getCachedData(cacheKey);
    
    if (cachedHyperboxes) {
      console.log('Cache hit for hyperboxes list');
      return NextResponse.json({ 
        hyperboxes: cachedHyperboxes, 
        source: 'cache' 
      });
    }
    
    // Cache miss, query database via Prisma
    console.log('Cache miss for hyperboxes list');

    const where: any = {};
    if (filterAvailable !== null) {
      where.available = filterAvailable === 'true';
    }
    if (filterOwner === 'me') {
      where.ownerId = 'demo_user'; // TODO replace with session.user.id
    }
    if (filterGPU) {
      where.specsGpu = { contains: filterGPU, mode: 'insensitive' };
    }
    if (filterLocation) {
      where.location = { equals: filterLocation, mode: 'insensitive' };
    }

    const dbBoxes = await prisma.hyperBox.findMany({ where, include: { owner: true } });
    const hyperboxes = dbBoxes.map(serializeHyperBox);

    // Store in cache for future requests (1 hour TTL)
    await cacheData(cacheKey, hyperboxes, 3600);
    
    return NextResponse.json({ hyperboxes, source: 'database' });
  } catch (error) {
    console.error('Error fetching hyperboxes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hyperboxes' }, 
      { status: 500 }
    );
  }
} 
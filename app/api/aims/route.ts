import { NextResponse } from 'next/server';
import { cacheData, getCachedData } from '@/lib/redis-utils';
import prisma from '@/lib/prisma';

function serializeAim(aim: any) {
  return {
    id: aim.id,
    name: aim.name,
    description: aim.description,
    image: aim.imageUrl,
    developer: {
      id: aim.creator.id,
      name: aim.creator.username ?? aim.creator.id.slice(0, 6),
    },
    price: aim.price?.toString() ?? null,
    currency: aim.currency,
    requiredSpecs: aim.requiredSpecs,
    category: aim.licenseType, // placeholder until explicit category column exists
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = `aims_list_${searchParams.toString()}`;
    
    // Try to get from cache first
    const cachedAims = await getCachedData(cacheKey);
    
    if (cachedAims) {
      console.log('Cache hit for AIMs list');
      return NextResponse.json({ 
        aims: cachedAims, 
        source: 'cache' 
      });
    }
    
    console.log('Cache miss for AIMs list');

    // Build Prisma where filters
    const where: any = {};
    if (searchParams.get('developer')) {
      where.creatorId = searchParams.get('developer');
    }
    if (searchParams.get('status')) {
      where.status = searchParams.get('status');
    }
    if (searchParams.get('chain')) {
      where.chain = { equals: searchParams.get('chain'), mode: 'insensitive' };
    }

    const dbAims = await prisma.aIM.findMany({ where, include: { creator: true } });
    const aims = dbAims.map(serializeAim);
    
    // Store in cache for future requests (1 hour TTL)
    await cacheData(cacheKey, aims, 3600);
    
    return NextResponse.json({ aims, source: 'database' });
  } catch (error) {
    console.error('Error fetching AIMs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AIMs' }, 
      { status: 500 }
    );
  }
} 
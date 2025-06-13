import { NextResponse } from 'next/server';
import { parseManifest } from '@/lib/hypercycle/manifest';
import { invalidateCache } from '@/lib/redis-utils';
import prisma from '@/lib/prisma';

// Map AIM manifest + additional params to Prisma create args
function mapToPrisma(fields: { manifest: any; dockerImage: string; creatorId: string }) {
  const { manifest, dockerImage, creatorId } = fields;
  const combinedSpecs = { ...(manifest.requiredSpecs ?? {}), dockerImage };

  return {
    name: manifest.name ?? manifest.short_name ?? 'Unnamed AIM',
    description: manifest.description ?? '',
    manifestUrl: null,
    requiredSpecs: combinedSpecs,
    licenseType: 'open',
    price: null,
    currency: null,
    tokenContract: null,
    tokenId: null,
    chain: null,
    status: 'draft',
    imageUrl: manifest.imageUrl ?? null,
    creator: { connect: { id: creatorId } },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dockerImage, manifest, creatorId } = body;
    if (!dockerImage || !manifest || !creatorId) {
      return NextResponse.json({ error: 'dockerImage, manifest, and creatorId are required' }, { status: 400 });
    }

    const parsed = parseManifest(manifest);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid manifest' }, { status: 400 });
    }

    // Insert into DB
    const created = await prisma.aIM.create({ data: mapToPrisma({ manifest: parsed, dockerImage, creatorId }) });

    await invalidateCache('aims_list');
    return NextResponse.json({ id: created.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 
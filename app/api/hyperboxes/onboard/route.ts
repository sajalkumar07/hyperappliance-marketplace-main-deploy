import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getBoxSpecs } from '@/lib/hypercycle/nodeManager';

// Simple serializer matching existing /api/hyperboxes route
function serialize(box: any) {
  return {
    id: box.id,
    name: box.name,
    owner: { id: box.ownerId || 'me', name: box.owner?.username || 'Me' },
    specs: {
      gpu: box.specsGpu,
      ram: box.specsRam,
      cpu: box.specsCpu,
      location: box.location,
    },
    available: box.available,
    price: box.pricePerHour?.toString() || '0',
    currency: box.currency || 'HYPC',
    nodeUrl: box.nodeUrl,
  };
}

export async function POST(req: Request) {
  try {
    const { nodeUrl, boxName } = await req.json();
    if (!nodeUrl || !boxName) {
      return NextResponse.json({ error: 'nodeUrl and boxName required' }, { status: 400 });
    }

    // ping node and extract specs
    const specs = await getBoxSpecs(nodeUrl);

    // Ensure placeholder user exists (replace with session user in production)
    await prisma.user.upsert({
      where: { id: 'demo_user' },
      update: {},
      create: { id: 'demo_user', username: 'Demo User' },
    });

    // Prisma upsert requires unique field; HyperBox lacks nodeUrl field.
    // We'll treat ipAddress as storage for nodeUrl and manually upsert.

    const existing = await prisma.hyperBox.findFirst({ where: { ipAddress: nodeUrl } });
    let box;
    if (existing) {
      box = await prisma.hyperBox.update({
        where: { id: existing.id },
        data: {
          name: boxName,
          specsCpu: specs.cpu,
          specsGpu: specs.gpu,
          specsRam: specs.ram,
          specsStorage: 'Unknown',
          bandwidth: 'Unknown',
          available: true,
          ipAddress: nodeUrl,
        },
      });
    } else {
      box = await prisma.hyperBox.create({
        data: {
          name: boxName,
          location: 'LAN-private',
          specsCpu: specs.cpu,
          specsGpu: specs.gpu,
          specsRam: specs.ram,
          specsStorage: 'Unknown',
          bandwidth: 'Unknown',
          ownerId: 'demo_user', // TODO: session user id
          available: true,
          pricePerHour: 0,
          currency: 'HYPC',
          ipAddress: nodeUrl,
        },
      });
    }

    return NextResponse.json({ hyperbox: serialize(box) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 
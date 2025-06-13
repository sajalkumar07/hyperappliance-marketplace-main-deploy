import fetch from 'node-fetch';
import { parseManifest } from '../lib/hypercycle/manifest';
import prisma from '../lib/prisma';

const GITHUB_RAW = 'https://raw.githubusercontent.com/hypercycle-development/aim-examples/tutorial';

// list of example folders to pull – in real usage you may fetch dynamically via GitHub API
const examples = [
  '01-basic_example',
  '02-queue_example',
  '03-subscription_example',
];

async function main() {
  for (const folder of examples) {
    const url = `${GITHUB_RAW}/${folder}/manifest.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed ${url}`);
      const manifest = await res.json();
      const parsed = parseManifest(manifest);
      if (!parsed) throw new Error('manifest invalid');

      const existing = await prisma.aIM.findFirst({ where: { name: parsed.name } });
      if (existing) continue;

      await prisma.aIM.create({
        data: {
          name: parsed.name,
          description: parsed.manifest?.description ?? parsed.name,
          requiredSpecs: parsed.requiredSpecs ?? {},
          licenseType: 'open',
          status: 'catalog',
          imageUrl: parsed.imageUrl ?? null,
          repoUrl: `https://github.com/hypercycle-development/aim-examples/tree/tutorial/${folder}`,
          creator: { connectOrCreate: { where: { id: 'catalog_import' }, create: { id: 'catalog_import', username: 'Catalog' } } },
        },
      });
      console.log('Imported', parsed.name);
    } catch (err) {
      console.error('Skip', folder, err);
    }
  }
  await prisma.$disconnect();
}

main(); 
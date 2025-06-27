// SPDX-License-Identifier: (EUPL-1.2)
import initArchive, { Archive } from 'libarchive-wasm';

export type VFile = { data: Uint8Array; mode: number };
export type VFS = Map<string, VFile>;

export async function extractLayers(layers: AsyncIterable<Uint8Array>[]) {
  await initArchive();
  const vfs: VFS = new Map();

  for (const layer of layers) {
    const buf = await streamToArrayBuffer(layer);
    const ar = Archive.open(buf);
    let entry: any;
    while ((entry = ar.next()) !== null) {
      const name = entry.pathname as string;
      if (name.startsWith('.wh.')) {
        vfs.delete(name.slice(4));
        continue;
      }
      if (entry.filetype === 'directory') continue;
      vfs.set(name, { data: ar.readData(), mode: entry.mode });
    }
    ar.close();
  }
  return vfs;
}

async function streamToArrayBuffer(iter: AsyncIterable<Uint8Array>) {
  const chunks: Uint8Array[] = [];
  for await (const c of iter) chunks.push(c);
  const len = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out.buffer;
}

// SPDX-License-Identifier: (EUPL-1.2)
import JSZip from 'jszip';
import type { VFS } from './untar-merge';

export async function vfsToZip(vfs: VFS): Promise<Blob> {
  const zip = new JSZip();
  for (const [path, { data, mode }] of vfs) {
    zip.file(path, data, { unixPermissions: mode });
  }
  const u8 = await zip.generateAsync({ type: 'uint8array', streamFiles: true });
  return new Blob([u8], { type: 'application/zip' });
}

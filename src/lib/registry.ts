// SPDX-License-Identifier: (EUPL-1.2)
/** Parse a docker image reference of the form
 *  `registry/namespace/repository[:tag]`.
 *  This is minimal and only supports the format used in examples.
 */
function parseImageRef(ref: string) {
  const [registry, namespace, repoTag] = ref.split('/');
  if (!registry || !namespace || !repoTag) {
    throw new Error('invalid image reference');
  }
  const [repository, tag] = repoTag.split(':');
  return { registry, namespace, repository, tag } as const;
}

export async function fetchManifest(imageRef: string) {
  const { registry, namespace, repository, tag = 'latest' } = parseImageRef(imageRef);
  const base = `https://${registry}/v2/${namespace}/${repository}`;
  const mRes = await fetch(`${base}/manifests/${tag}`, {
    headers: {
      Accept: 'application/vnd.docker.distribution.manifest.v2+json',
    },
  });
  if (!mRes.ok) throw new Error(`manifest fetch failed ${mRes.status}`);
  const manifest = (await mRes.json()) as {
    layers: { mediaType: string; digest: string; size: number }[];
  };
  return { base, layers: manifest.layers };
}

export async function* fetchLayer(base: string, digest: string) {
  const res = await fetch(`${base}/blobs/${digest}`);
  if (!res.ok) throw new Error(`layer fetch failed ${res.status}`);
  const ds = new DecompressionStream('gzip');
  const stream = res.body!.pipeThrough(ds);
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    yield value as Uint8Array;
  }
}

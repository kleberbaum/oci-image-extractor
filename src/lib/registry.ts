// SPDX-License-Identifier: (EUPL-1.2)
/**
 * Parse a Docker image reference. Only a small subset of the reference
 * grammar is supported but this avoids the need for the `docker-url-parser`
 * package. The implementation accepts references such as:
 *
 * ``registry/namespace/repo[:tag]``
 * ``registry/repo[:tag]``
 * ``repo[:tag]``
 *
 * If no registry is given, `registry-1.docker.io` is assumed. When a single
 * segment repository is provided, the `library` namespace is used by
 * default. The returned object contains the resolved registry, namespace,
 * repository name and optional tag.
 */
function parseImageRef(ref: string) {
  let registry = 'registry-1.docker.io';
  let remainder = ref;

  const firstSlash = ref.indexOf('/');
  if (firstSlash !== -1) {
    const candidate = ref.slice(0, firstSlash);
    if (candidate.includes('.') || candidate.includes(':') || candidate === 'localhost') {
      registry = candidate;
      remainder = ref.slice(firstSlash + 1);
    }
  }

  let tag: string | undefined;
  if (remainder.includes('@')) {
    throw new Error(`Digests are not supported in image references: '${ref}'`);
  }
  if (remainder.includes(':')) {
    [remainder, tag] = remainder.split(':', 2);
  }

  const parts = remainder.split('/');
  let namespace = 'library';
  let repository = remainder;
  if (parts.length > 1) {
    namespace = parts.slice(0, -1).join('/');
    repository = parts[parts.length - 1];
  }

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

  if (!mRes.ok) throw new Error(`manifest fetch failed for image '${imageRef}' at URL '${base}/manifests/${tag}' with status ${mRes.status}`);

  const manifest = (await mRes.json()) as {
    layers: { mediaType: string; digest: string; size: number }[];
  };
  return { base, layers: manifest.layers };
}

export async function* fetchLayer(base: string, digest: string) {
  const res = await fetch(`${base}/blobs/${digest}`);

  if (!res.ok) throw new Error(`layer fetch failed for digest ${digest} with status ${res.status}`);

  const ds = new DecompressionStream('gzip');
  const stream = res.body!.pipeThrough(ds);
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    yield value as Uint8Array;
  }
}

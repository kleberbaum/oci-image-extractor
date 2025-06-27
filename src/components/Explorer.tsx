// SPDX-License-Identifier: (EUPL-1.2)
import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Input,
  Link,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { fetchManifest, fetchLayer } from '../lib/registry';
import { extractLayers } from '../lib/untar-merge';
import { vfsToZip } from '../lib/zip';

export default function Explorer() {
  const [rows, setRows] = useState<{ path: string; size: number }[]>([]);
  const [zipURL, setZipURL] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ref = new FormData(e.currentTarget as HTMLFormElement)
      .get('image')!
      .toString()
      .trim();
    const { base, layers } = await fetchManifest(ref);
    const streams = layers.map((l) => fetchLayer(base, l.digest));
    const vfs = await extractLayers(streams);
    setRows([...vfs.keys()].map((k) => ({ path: k, size: vfs.get(k)!.data.length })));

    const zipBlob = await vfsToZip(vfs);
    setZipURL(URL.createObjectURL(zipBlob));

  }

  return (
    <Box>
      <Box as="form" onSubmit={handleSubmit} display="flex" gap={2} mb={4}>
        <FormControl flex="1">
          <Input name="image" placeholder="ghcr.io/...:tag" required />
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Fetch
        </Button>
        {zipURL && (
          <Button as={Link} href={zipURL} download="image.zip" colorScheme="green">
            ZIP ↓
          </Button>
        )}
      </Box>

      <Table size="sm" maxH="60vh" overflowY="auto">
        <Thead>
          <Tr>
            <Th>Path</Th>
            <Th isNumeric>Size (bytes)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r) => (
            <Tr key={r.path}>
              <Td>{r.path}</Td>
              <Td isNumeric>{r.size}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

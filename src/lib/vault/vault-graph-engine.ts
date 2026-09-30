/**
 * Obsidian Vault Graph & Wikilink Engine
 * 
 * Parses raw Markdown notes containing standard `[[Page Name]]` wikilinks,
 * builds graph nodes and directed edges for force-directed visualization,
 * and compiles Markdown files into downloadable vault bundles.
 */

export interface VaultNode {
  id: string; // Title / Slug
  title: string;
  type: 'PERSONA' | 'MEMBER_DOSSIER' | 'TOPIC' | 'BOUNDARY';
  preview: string;
}

export interface VaultEdge {
  source: string;
  target: string;
}

export interface VaultGraphData {
  nodes: VaultNode[];
  edges: VaultEdge[];
}

export interface RawVaultNote {
  id: string;
  title: string;
  content: string;
  note_type: 'PERSONA' | 'MEMBER_DOSSIER' | 'TOPIC' | 'BOUNDARY';
}

const WIKILINK_REGEX = /\[\[(.*?)\]\]/g;

export function extractWikilinks(markdownText: string): string[] {
  if (!markdownText) return [];
  const links: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = WIKILINK_REGEX.exec(markdownText)) !== null) {
    const link = match[1].trim();
    if (link && !links.includes(link)) {
      links.push(link);
    }
  }
  return links;
}

export function buildVaultGraph(notes: RawVaultNote[]): VaultGraphData {
  const nodes: VaultNode[] = [];
  const edges: VaultEdge[] = [];
  const nodeMap = new Set<string>();

  // 1. Create known nodes from existing notes
  for (const note of notes) {
    nodes.push({
      id: note.title,
      title: note.title,
      type: note.note_type,
      preview: note.content.slice(0, 100),
    });
    nodeMap.add(note.title);
  }

  // 2. Extract outgoing links to build edges
  for (const note of notes) {
    const outgoing = extractWikilinks(note.content);
    for (const target of outgoing) {
      // If target doesn't exist as a formal note yet, create a phantom topic node
      if (!nodeMap.has(target)) {
        nodes.push({
          id: target,
          title: target,
          type: 'TOPIC',
          preview: 'Implicit node linked from references',
        });
        nodeMap.add(target);
      }
      edges.push({
        source: note.title,
        target,
      });
    }
  }

  return { nodes, edges };
}

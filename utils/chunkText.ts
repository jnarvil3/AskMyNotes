export function chunkText(text: string, maxLength: number): string[] {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];
    let chunk = "";
  
    for (let sentence of sentences) {
      if ((chunk + sentence).length > maxLength) {
        chunks.push(chunk);
        chunk = "";
      }
      chunk += sentence + " ";
    }
  
    if (chunk) chunks.push(chunk);
    return chunks;
  }
  
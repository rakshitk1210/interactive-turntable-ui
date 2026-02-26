interface Id3Result {
  title?: string;
  artist?: string;
  coverUrl?: string;
}

function readSyncsafeInt(buf: DataView, offset: number): number {
  return (
    ((buf.getUint8(offset) & 0x7f) << 21) |
    ((buf.getUint8(offset + 1) & 0x7f) << 14) |
    ((buf.getUint8(offset + 2) & 0x7f) << 7) |
    (buf.getUint8(offset + 3) & 0x7f)
  );
}

function readTextFrame(data: Uint8Array): string {
  const encoding = data[0];
  const textBytes = data.slice(1);

  if (encoding === 0) {
    return new TextDecoder('iso-8859-1').decode(textBytes).replace(/\0+$/, '');
  }
  if (encoding === 1 || encoding === 2) {
    return new TextDecoder('utf-16').decode(textBytes).replace(/\0+$/, '');
  }
  return new TextDecoder('utf-8').decode(textBytes).replace(/\0+$/, '');
}

function readApicFrame(data: Uint8Array): string | null {
  const encoding = data[0];
  let offset = 1;

  let mimeEnd = offset;
  while (mimeEnd < data.length && data[mimeEnd] !== 0) mimeEnd++;
  const mime = new TextDecoder('iso-8859-1').decode(data.slice(offset, mimeEnd));
  offset = mimeEnd + 1;

  // picture type byte
  offset++;

  // skip description (null-terminated, encoding-dependent)
  if (encoding === 0 || encoding === 3) {
    while (offset < data.length && data[offset] !== 0) offset++;
    offset++;
  } else {
    while (offset < data.length - 1 && !(data[offset] === 0 && data[offset + 1] === 0)) offset++;
    offset += 2;
  }

  if (offset >= data.length) return null;

  const imageData = data.slice(offset);
  const blob = new Blob([imageData], { type: mime || 'image/jpeg' });
  return URL.createObjectURL(blob);
}

export async function parseId3(file: File): Promise<Id3Result> {
  const result: Id3Result = {};
  const headerBuf = await file.slice(0, 10).arrayBuffer();
  const header = new DataView(headerBuf);

  const magic =
    String.fromCharCode(header.getUint8(0)) +
    String.fromCharCode(header.getUint8(1)) +
    String.fromCharCode(header.getUint8(2));

  if (magic !== 'ID3') return result;

  const tagSize = readSyncsafeInt(header, 6);
  const tagBuf = await file.slice(0, 10 + tagSize).arrayBuffer();
  const view = new DataView(tagBuf);
  const bytes = new Uint8Array(tagBuf);

  const version = header.getUint8(3);
  let offset = 10;

  while (offset < 10 + tagSize - 10) {
    const frameId =
      String.fromCharCode(bytes[offset]) +
      String.fromCharCode(bytes[offset + 1]) +
      String.fromCharCode(bytes[offset + 2]) +
      String.fromCharCode(bytes[offset + 3]);

    if (frameId === '\0\0\0\0') break;

    let frameSize: number;
    if (version === 4) {
      frameSize = readSyncsafeInt(view, offset + 4);
    } else {
      frameSize = view.getUint32(offset + 4);
    }

    const frameData = bytes.slice(offset + 10, offset + 10 + frameSize);

    if (frameId === 'TIT2') {
      result.title = readTextFrame(frameData);
    } else if (frameId === 'TPE1') {
      result.artist = readTextFrame(frameData);
    } else if (frameId === 'APIC') {
      result.coverUrl = readApicFrame(frameData) ?? undefined;
    }

    offset += 10 + frameSize;
  }

  return result;
}

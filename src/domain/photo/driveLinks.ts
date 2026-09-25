export interface PublicDrivePhotoLink {
  fileId: string;
  resourceKey?: string;
  imageUrl: string;
}

export function parsePublicDrivePhotoLink(value: string): PublicDrivePhotoLink {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Masukkan tautan berkas Google Drive yang valid.');
  }
  if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') {
    throw new Error('Gunakan tautan berkas dari https://drive.google.com.');
  }
  const match = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{10,200})(?:\/|$)/);
  const fileId = match?.[1] || (['/open', '/uc'].includes(url.pathname) ? url.searchParams.get('id') : null);
  if (!fileId || !/^[A-Za-z0-9_-]{10,200}$/.test(fileId)) {
    throw new Error('Tautan ini bukan tautan berkas foto Google Drive yang didukung.');
  }
  const resourceKey = url.searchParams.get('resourcekey') || undefined;
  const imageUrl = new URL('https://drive.google.com/uc');
  imageUrl.searchParams.set('export', 'view');
  imageUrl.searchParams.set('id', fileId);
  if (resourceKey) imageUrl.searchParams.set('resourcekey', resourceKey);
  return { fileId, resourceKey, imageUrl: imageUrl.toString() };
}

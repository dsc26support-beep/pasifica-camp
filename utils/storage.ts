/**
 * Pasifika Campus — storage helpers for image upload/compression.
 */
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { AppConfig } from '../constants/config';

/**
 * Compress/resize an image before upload (Pacific bandwidth — spec §25/§50).
 * Returns a new local URI.
 */
export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: AppConfig.imageResizeMaxWidth } }],
    { compress: AppConfig.imageCompress, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Upload a local image to a Supabase Storage bucket under the user's folder.
 * Path convention: `<uid>/<subpath>` so storage RLS can verify ownership.
 */
export async function uploadImage(params: {
  bucket: 'avatars' | 'businesses' | 'listings' | 'tips';
  uid: string;
  localUri: string;
  filename: string;
}): Promise<{ path: string | null; error: string | null }> {
  try {
    const compressed = await compressImage(params.localUri);
    const path = `${params.uid}/${params.filename}`;
    const response = await fetch(compressed);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from(params.bucket)
      .upload(path, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) return { path: null, error: error.message };
    return { path, error: null };
  } catch (e) {
    return { path: null, error: e instanceof Error ? e.message : 'Upload failed' };
  }
}

/** Resolve a storage path to a public URL for display. */
export function publicUrl(
  bucket: 'avatars' | 'businesses' | 'listings' | 'tips',
  path: string | null | undefined
): string | null {
  if (!path) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

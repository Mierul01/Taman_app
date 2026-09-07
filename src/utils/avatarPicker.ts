import * as ImagePicker from 'expo-image-picker';

export type AvatarPickResult =
  | { status: 'success'; uri: string }
  | { status: 'cancelled' }
  | { status: 'permission-denied' };

async function pickImage(aspect: [number, number]): Promise<AvatarPickResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'permission-denied' };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.5,
    base64: true,
  });

  if (result.canceled || !result.assets?.length) return { status: 'cancelled' };
  const asset = result.assets[0];
  const uri = asset.base64 ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` : asset.uri;
  return { status: 'success', uri };
}

export async function pickAvatarImage(): Promise<AvatarPickResult> {
  return pickImage([1, 1]);
}

export async function pickBannerImage(): Promise<AvatarPickResult> {
  return pickImage([16, 9]);
}

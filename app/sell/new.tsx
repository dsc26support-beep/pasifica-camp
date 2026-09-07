/**
 * Pasifika Campus — Create listing form (product / service / rental).
 * Minimal, type-aware form. Uploads images to Storage, creates the listing as
 * PENDING (admin moderation), then attaches image paths. Progressive disclosure
 * keeps the form small (spec §26–28, §52).
 */
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CategorySelect } from '../../components/listings/CategorySelect';
import { ImagePickerRow } from '../../components/listings/ImagePickerRow';
import { listingSchema } from '../../lib/validation';
import { createListing, addListingImages } from '../../features/listings/service';
import { uploadImage } from '../../utils/storage';
import { useAuth } from '../../features/account/AuthProvider';
import { AppConfig } from '../../constants/config';
import type { ListingType, PriceType } from '../../types/database';
import { Spacing } from '../../constants/layout';

export default function NewListingScreen() {
  const { type } = useLocalSearchParams<{ type: ListingType }>();
  const listingType: ListingType = (['product', 'service', 'rental'] as const).includes(
    type as ListingType
  )
    ? (type as ListingType)
    : 'product';

  const { session } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('fixed');
  const [island, setIsland] = useState('');
  const [community, setCommunity] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!session) return;
    setFormError(null);

    // Products require at least one image (spec §26).
    if (listingType === 'product' && images.length === 0) {
      setFormError('Add at least one photo for a product.');
      return;
    }

    const candidate = {
      listing_type: listingType,
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId ?? '',
      price: price ? Number(price) : undefined,
      price_type: priceType,
      country: AppConfig.defaultCountry,
      island: island.trim(),
      community: community.trim(),
    };

    const parsed = listingSchema.safeParse(candidate);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fe[String(i.path[0])] = i.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const listing = await createListing(session.user.id, {
        listing_type: listingType,
        title: parsed.data.title,
        description: parsed.data.description || null,
        category_id: parsed.data.category_id,
        price: parsed.data.price ?? null,
        price_type: parsed.data.price_type,
        country: parsed.data.country,
        island: parsed.data.island || null,
        community: parsed.data.community || null,
      });

      // Upload images then attach ordered paths.
      const paths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const res = await uploadImage({
          bucket: 'listings',
          uid: session.user.id,
          localUri: images[i]!,
          filename: `${listing.id}-${i}-${Date.now()}.jpg`,
        });
        if (res.path) paths.push(res.path);
      }
      await addListingImages(listing.id, paths);

      router.replace('/sell');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not create listing.');
    } finally {
      setLoading(false);
    }
  }

  const priceRequired = listingType === 'product';

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="h2" style={styles.title}>
            New {listingType}
          </Text>

          <Input
            label={`${listingType === 'product' ? 'Product' : listingType === 'service' ? 'Service' : 'Rental'} name`}
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            required
          />

          <CategorySelect
            type={listingType}
            value={categoryId}
            onChange={setCategoryId}
            error={errors.category_id}
          />

          {/* Price type toggle */}
          <View style={styles.priceTypeRow}>
            {(['fixed', 'negotiable'] as PriceType[]).map((pt) => (
              <Button
                key={pt}
                label={pt === 'fixed' ? 'Fixed price' : 'Negotiable'}
                variant={priceType === pt ? 'primary' : 'secondary'}
                onPress={() => setPriceType(pt)}
                style={{ flex: 1 }}
              />
            ))}
          </View>

          {priceType === 'fixed' || priceRequired ? (
            <Input
              label="Price (AUD)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              error={errors.price}
              required={priceRequired}
            />
          ) : null}

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: 'top' }}
          />

          <Input label="Island" value={island} onChangeText={setIsland} placeholder="e.g. South Tarawa" />
          <Input label="Community / village" value={community} onChangeText={setCommunity} />

          <ImagePickerRow uris={images} onChange={setImages} />

          {formError ? (
            <Text variant="label" color="danger" style={styles.formError}>
              {formError}
            </Text>
          ) : null}

          <Text variant="caption" color="muted" style={styles.notice}>
            New listings are reviewed before they appear publicly.
          </Text>
          <Button label="Submit listing" onPress={onSubmit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg },
  title: { marginBottom: Spacing.lg },
  priceTypeRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  formError: { marginBottom: Spacing.md },
  notice: { marginBottom: Spacing.md },
});

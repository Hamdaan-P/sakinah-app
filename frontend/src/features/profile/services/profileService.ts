/**
 * Profile Service
 * Handles profile data operations with Firestore
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebase.config';
import type { UserProfile } from '../types/profile.types';
import { syncPublicProfile } from '@/features/public-profile/services/publicProfileService';

// Fields whose changes should trigger a public_profiles mirror refresh.
const PUBLIC_MIRROR_FIELDS = new Set([
  'full_name', 'fullName',
  'display_name', 'displayName',
  'photo_url', 'photoUrl',
  'profile_image_url', 'profileImageUrl',
  'bio', 'profession', 'location',
  'company', 'industry',
  'gender',
  'pascoArchetype', 'pasco_archetype',
  'islamic_interests', 'islamicInterests',
  'islamic_knowledge', 'islamicKnowledge',
  'skills', 'hobbies',
  'instagram_url', 'instagramUrl',
  'twitter_url', 'twitterUrl',
  'linkedin_url', 'linkedinUrl',
  'website_url', 'websiteUrl',
]);

async function mirrorToPublicIfRelevant(userId: string, changedFields: string[]): Promise<void> {
  if (!changedFields.some((f) => PUBLIC_MIRROR_FIELDS.has(f))) return;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return;
    await syncPublicProfile(userId, snap.data() as Record<string, unknown>);
  } catch (err) {
    console.error('Failed to mirror profile update to public_profiles:', err);
  }
}

/**
 * Get complete user profile from Firestore
 */
export async function getCompleteProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        email: data.email || '',
        fullName: data.full_name || data.fullName,
        displayName: data.display_name || data.displayName,
        photoUrl: data.photo_url || data.photoUrl,
        profileImageUrl: data.profile_image_url || data.profileImageUrl,
        phoneNumber: data.phone_number || data.phoneNumber,
        gender: data.gender ?? null,
        dateOfBirth: data.date_of_birth?.toDate?.() || null,
        location: data.location,
        bio: data.bio,
        profession: data.profession,
        islamicKnowledge: data.islamic_knowledge,
        islamicInterests: data.islamic_interests,
        prayerFrequency: data.prayer_frequency,
        fastingHabit: data.fasting_habit,
        company: data.company,
        industry: data.industry,
        yearsExperience: data.years_experience,
        skills: data.skills,
        hobbies: data.hobbies,
        investmentGoals: data.investment_goals,
        riskTolerance: data.risk_tolerance,
        investmentExperience: data.investment_experience,
        preferredPaymentMethods: data.preferred_payment_methods,
        instagramUrl: data.instagram_url,
        twitterUrl: data.twitter_url,
        linkedinUrl: data.linkedin_url,
        websiteUrl: data.website_url,
        linkedinId: data.linkedin_id,
        linkedinEmail: data.linkedin_email,
        linkedinEmailVerified: data.linkedin_email_verified,
        linkedinPicture: data.linkedin_picture,
        linkedinConnectedAt: data.linkedin_connected_at?.toDate?.() || undefined,
        kycTier: data.kyc_tier ?? 0,
        kycStatus: data.kyc_status || 'none',
        kycLevel: data.kyc_level || 'none',
        profileCompleted: data.profile_completed,
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Calculate profile completion percentage
 */
export function getProfileCompletionPercentage(profile: UserProfile | null): number {
  if (!profile) return 0;

  const coreFields = [
    profile.fullName,
    profile.email,
    profile.phoneNumber,
    profile.dateOfBirth,
    profile.location,
    profile.profileImageUrl || profile.photoUrl,
    profile.bio,
    profile.profession,
  ];

  const filledFields = coreFields.filter((field) => {
    if (typeof field === 'string') return field.trim().length > 0;
    return field !== null && field !== undefined;
  }).length;

  return Math.round((filledFields / coreFields.length) * 100);
}

/**
 * Get completion status message
 */
export function getCompletionStatusMessage(percentage: number): string {
  if (percentage >= 100) return 'Your profile is complete!';
  if (percentage >= 75) return 'Almost done! Just a few more details.';
  if (percentage >= 50) return "You're halfway there! Keep going.";
  if (percentage >= 25) return 'Good start! Add more details to unlock features.';
  return 'Complete your profile to get the most out of ZaryahPlus.';
}

/**
 * Get completion color based on percentage
 */
export function getCompletionColor(percentage: number): string {
  if (percentage >= 100) return '#4CAF50'; // Green
  if (percentage >= 75) return '#2196F3'; // Blue
  if (percentage >= 50) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

/**
 * Update profile field
 */
export async function updateProfileField(
  userId: string,
  field: string,
  value: unknown
): Promise<boolean> {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        id: userId,
        [field]: value,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
    await mirrorToPublicIfRelevant(userId, [field]);
    return true;
  } catch (error) {
    console.error('Error updating profile field:', error);
    return false;
  }
}

/**
 * Update multiple profile fields
 */
export async function updateProfileFields(
  userId: string,
  fields: Record<string, unknown>
): Promise<boolean> {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        id: userId,
        ...fields,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
    await mirrorToPublicIfRelevant(userId, Object.keys(fields));
    return true;
  } catch (error) {
    console.error('Error updating profile fields:', error);
    return false;
  }
}

/**
 * Update profile image URL
 */
export async function updateProfileImage(userId: string, imageUrl: string): Promise<boolean> {
  return updateProfileFields(userId, {
    profile_image_url: imageUrl,
    photo_url: imageUrl,
    photoUrl: imageUrl,
  });
}

/**
 * Get social links count
 */
export function getSocialLinksCount(profile: UserProfile | null): number {
  if (!profile) return 0;
  let count = 0;
  if (profile.instagramUrl) count++;
  if (profile.twitterUrl) count++;
  if (profile.linkedinUrl) count++;
  if (profile.websiteUrl) count++;
  return count;
}

/**
 * Format list to string
 */
export function formatList(items: string[] | undefined): string {
  if (!items || items.length === 0) return 'Not specified';
  return items.join(', ');
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

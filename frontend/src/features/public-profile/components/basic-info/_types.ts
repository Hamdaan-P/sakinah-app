/**
 * Shared types + primitives for the BasicInfoEditor.
 */

export type Gender = 'male' | 'female' | null;

export interface Fields {
  displayName: string;
  bio: string;
  gender: Gender;
  profession: string;
  location: string;
}

export const EMPTY: Fields = {
  displayName: '',
  bio: '',
  gender: null,
  profession: '',
  location: '',
};

export const BIO_MAX = 280;

export type UserProfilePayload = {
  fullName?: string;
  photoURL?: string;
};

export function buildUserProfilePayload(input: UserProfilePayload): UserProfilePayload {
  const payload: UserProfilePayload = {};
  const fullName = input.fullName?.trim();
  const photoURL = input.photoURL?.trim();

  if (fullName) {
    payload.fullName = fullName;
  }
  if (photoURL) {
    payload.photoURL = photoURL;
  }

  return payload;
}

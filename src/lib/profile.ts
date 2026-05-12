export type StoredProfile = {
  mobileNumber?: string | null;
  registrationNumber?: string | null;
  schoolCollegeName?: string | null;
};

export type ProfileSubmission = {
  mobileNumber: string;
  registrationNumber: string;
  schoolCollegeName: string;
  isVitStudent: boolean;
};

export function isVitStudentEmail(email?: string | null) {
  return email?.toLowerCase().endsWith("@vitstudent.ac.in") ?? false;
}

export function needsProfileDetails(email: string, profile: StoredProfile | null | undefined) {
  if (!profile) {
    return true;
  }

  const hasMobile = Boolean(profile.mobileNumber?.trim());
  const hasRegistration = Boolean(profile.registrationNumber?.trim());
  const hasSchool = Boolean(profile.schoolCollegeName?.trim());

  if (!hasMobile || !hasRegistration) {
    return true;
  }

  if (!isVitStudentEmail(email) && !hasSchool) {
    return true;
  }

  return false;
}

export function normalizeProfileValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "";
}

export function getDefaultSchoolCollegeName(email?: string | null) {
  return isVitStudentEmail(email) ? "Vellore Institute Of Technology" : "";
}

export function buildProfileSubmission(params: {
  email: string;
  body: StoredProfile;
  existing?: StoredProfile | null;
}): ProfileSubmission {
  const isVitStudent = isVitStudentEmail(params.email);

  return {
    mobileNumber:
      normalizeProfileValue(params.body.mobileNumber) ||
      normalizeProfileValue(params.existing?.mobileNumber),
    registrationNumber:
      normalizeProfileValue(params.body.registrationNumber) ||
      normalizeProfileValue(params.existing?.registrationNumber),
    schoolCollegeName: isVitStudent
      ? getDefaultSchoolCollegeName(params.email)
      : normalizeProfileValue(params.body.schoolCollegeName) ||
        normalizeProfileValue(params.existing?.schoolCollegeName),
    isVitStudent,
  };
}
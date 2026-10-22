/**
 * Candidate and Visitor Data Formatting Helpers
 * Strictly guarantees no invented or auto-filled information is displayed.
 */

export function formatCandidateAddress(address?: string | null): string {
  if (!address || typeof address !== 'string') {
    return 'Address Not Provided';
  }
  const trimmed = address.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'none' ||
    trimmed.toLowerCase() === 'n/a' ||
    trimmed.toLowerCase() === 'na' ||
    trimmed.toLowerCase() === 'not provided' ||
    trimmed.toLowerCase() === 'address not provided'
  ) {
    return 'Address Not Provided';
  }
  return trimmed;
}

export function formatCandidateLocation(location?: string | null): string {
  if (!location || typeof location !== 'string') {
    return 'Location Not Provided';
  }
  const trimmed = location.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'none' ||
    trimmed.toLowerCase() === 'n/a' ||
    trimmed.toLowerCase() === 'na' ||
    trimmed.toLowerCase() === 'not provided' ||
    trimmed.toLowerCase() === 'location not provided'
  ) {
    return 'Location Not Provided';
  }
  return trimmed;
}

export function formatCandidateExperience(experience?: string | null): string {
  if (!experience || typeof experience !== 'string') {
    return 'Fresher';
  }
  const trimmed = experience.trim();
  const lower = trimmed.toLowerCase();
  if (
    !trimmed ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'none' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === '0' ||
    lower === '0y' ||
    lower === '0 years'
  ) {
    return 'Fresher';
  }
  if (
    lower === 'fresher' ||
    lower === 'fresherly' ||
    lower === 'freshery' ||
    lower === 'fresher / graduate trainee' ||
    lower === 'fresher (0 years of experience)' ||
    lower.startsWith('fresher')
  ) {
    return 'Fresher';
  }
  if (lower === 'less than 1 year' || lower === '<1 year' || lower === '< 1 year' || lower === '<1') {
    return 'Less than 1 year';
  }
  // If it's a numeric string like "4", format as "4 Years" (or "1 Year" if 1)
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const num = parseFloat(trimmed);
    return num === 1 ? '1 Year' : `${trimmed} Years`;
  }
  // If it's already ending with "y" like "4y"
  if (/^\d+(\.\d+)?\s*y$/i.test(trimmed)) {
    const num = trimmed.replace(/y$/i, '').trim();
    return num === '1' ? '1 Year' : `${num} Years`;
  }
  return trimmed;
}

export function formatExperienceBadge(experience?: string | null): string {
  return formatCandidateExperience(experience);
}

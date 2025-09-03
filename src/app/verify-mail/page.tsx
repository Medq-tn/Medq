import { redirect } from 'next/navigation';

export default async function VerifyMailAlias({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved || {})) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  redirect(`/verify-email${qs ? `?${qs}` : ''}`);
}

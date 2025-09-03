// Admin Management Page for a specific specialty
// Minimal server component to satisfy Next.js module requirements

export default async function SpecialtyManagementPage({
	params,
}: {
	params: Promise<{ specialtyId: string }>;
}) {
	const { specialtyId } = await params;
	const title = `Admin · Management · ${decodeURIComponent(specialtyId)}`;
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold">{title}</h1>
			<p className="text-sm text-gray-500 mt-2">This page is under construction.</p>
		</div>
	);
}


// Admin Users Dashboard - User detail page (minimal)

export default async function AdminUserDashboardDetailPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = await params;
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold">Admin · Users · Dashboard · {decodeURIComponent(userId)}</h1>
			<p className="text-sm text-gray-500 mt-2">This page is under construction.</p>
		</div>
	);
}


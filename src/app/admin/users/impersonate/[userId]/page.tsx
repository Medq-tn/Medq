// Admin Users Impersonate - User detail page (minimal)

export default async function AdminUserImpersonatePage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = await params;
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold">Admin · Users · Impersonate · {decodeURIComponent(userId)}</h1>
			<p className="text-sm text-gray-500 mt-2">This page is under construction.</p>
		</div>
	);
}


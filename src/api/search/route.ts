// Route pour rechercher les aliments et les check

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = (searchParams.get("query") || "").trim();
	const page = Number(searchParams.get("page") || "1");
	const limit = Number(searchParams.get("limit") || "20");
	const skip = (page - 1) * limit;

	try {
		const res = await fetch(
            // https://world.openfoodfacts.org/cgi/search.pl?search_terms=pizza&search_simple=1&action=process
			`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
				query
			)}&page_size=${limit}&page=${page}&json=true`,
			{
				next: { revalidate: 86400 },
			}
		);

		if (!res.ok) {
			return NextResponse.json(
				{ error: "Erreur lors de la requête vers Open Food Facts" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		const foods = (data.products || [])
			.map((p: any) => ({
				name: p.product_name_fr || p.product_name || p.generic_name_fr || "",
				image:
					p.image_front_url || p.image_front_small_url || p.image_url || null,
				category:
					p.categories_tags?.[0]?.replace("en:", "") ||
					p.categories?.split(",")[0] ||
					"",
				source: { provider: "openfoodfacts", id: p.code },
			}))
			.filter((f: any) => f.name);

		return NextResponse.json({
			foods,
			total: data.count || foods.length,
			page,
			limit,
			source: "openfoodfacts",
		});
	} catch (error) {
		console.error("Erreur lors de la recherche:", error);
		return NextResponse.json(
			{ error: "Une erreur est survenue lors de la recherche" },
			{ status: 500 }
		);
	}
}

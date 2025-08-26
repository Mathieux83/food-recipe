// Route pour rechercher les aliments et les check
// TODO: Switcher sur l'API de Spoonacular mieux c'est du ALL in ONE 
// TODO: Ingredients et recette sur les ingredients 

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = (searchParams.get("query") || "").trim();
	const page = Number(searchParams.get("page") || "1");
	const limit = Number(searchParams.get("limit") || "20");

	// Validation des paramètres
	if (!query) {
		return NextResponse.json(
			{ error: "Le terme de recherche ne peut pas être vide" },
			{ status: 400 }
		);
	}

	if (limit > 100) {
		return NextResponse.json(
			{ error: "La limite ne peut pas dépasser 100" },
			{ status: 400 }
		);
	}

	try {
		// Construction de l'URL corrigée
		const apiUrl = new URL("https://world.openfoodfacts.org/cgi/search.pl");
		apiUrl.searchParams.set("search_terms", query);
		apiUrl.searchParams.set("search_simple", "1");
		apiUrl.searchParams.set("action", "process");
		apiUrl.searchParams.set("json", "1");
		apiUrl.searchParams.set("page_size", limit.toString());
		apiUrl.searchParams.set("page", page.toString());
		// Filtrer les produits avec des noms
		apiUrl.searchParams.set("fields", "code,product_name,product_name_fr,generic_name_fr,categories,categories_tags");

		const res = await fetch(apiUrl.toString(), {
			headers: {
				'User-Agent': 'FoodApp/1.0 (car.math@live.fr)', // Recommandé par Open Food Facts
			},
			next: { revalidate: 3600 }, // Cache pendant 1 heure au lieu de 24h
		});

		if (!res.ok) {
			console.error("Erreur API Open Food Facts:", res.status, res.statusText);
			return NextResponse.json(
				{ error: "Erreur lors de la requête vers Open Food Facts" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		
		// Vérifier si la réponse contient des produits
		if (!data.products || !Array.isArray(data.products)) {
			return NextResponse.json({
				foods: [],
				total: 0,
				page,
				limit,
				source: "openfoodfacts",
			});
		}

		const foods = data.products
			.map((p: any) => {
				// Nettoyer le nom du produit
				const name = (
					p.product_name_fr || 
					p.product_name || 
					p.generic_name_fr || 
					""
				).trim();

				// Ignorer les produits sans nom
				if (!name) return null;

				// Nettoyer la catégorie
				let category = "";
				if (p.categories_tags && p.categories_tags.length > 0) {
					// Prendre la première catégorie et enlever le préfixe de langue
					category = p.categories_tags[0]
						.replace(/^(en|fr):/i, "")
						.replace(/-/g, " ")
						.trim();
				} else if (p.categories) {
					category = p.categories.split(",")[0].trim();
				}

				return {
					name,
					category,
					source: { 
						provider: "openfoodfacts", 
						id: p.code 
					},
				};
			})
			.filter((f: any) => f !== null); // Enlever les produits null

		return NextResponse.json({
			foods,
			total: data.count || 0,
			page,
			limit,
			hasMore: foods.length === limit, // Indiquer s'il y a plus de résultats
			source: "openfoodfacts",
		});

	} catch (error) {
		console.error("Erreur lors de la recherche:", error);
		
		// Plus d'informations sur l'erreur en développement
		const isDev = process.env.NODE_ENV === 'development';
		const errorMessage = isDev 
			? `Erreur de recherche: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
			: "Une erreur est survenue lors de la recherche";

		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
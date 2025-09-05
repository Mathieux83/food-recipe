// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = (searchParams.get("query") || "").trim();
	const page = Number(searchParams.get("page") || "1");
	const limit = Number(searchParams.get("limit") || "5");

	// Validation des paramètres
	if (!query) {
		return NextResponse.json(
			{ error: "Le terme de recherche ne peut pas être vide" },
			{ status: 400 }
		);
	}

	if (!SPOONACULAR_API_KEY) {
		return NextResponse.json(
			{ error: "Clé API Spoonacular manquante" },
			{ status: 500 }
		);
	}

	if (limit > 100) {
		return NextResponse.json(
			{ error: "La limite ne peut pas dépasser 100" },
			{ status: 400 }
		);
	}

	try {
		// Recherche d'ingrédients via Spoonacular
		const offset = (page - 1) * limit;
		// https://api.spoonacular.com/food/ingredients/search
		// const apiUrl = new URL(`https://api.spoonacular.com/food/ingredients/search`);
		const apiUrl = new URL(`${SPOONACULAR_BASE_URL}/food/ingredients/search`);
		// Améliorer la recherche en français
		apiUrl.searchParams.set("query", query);
		apiUrl.searchParams.set("number", limit.toString());
		apiUrl.searchParams.set("offset", offset.toString());
		apiUrl.searchParams.set("apiKey", SPOONACULAR_API_KEY);
		// ! Ne fonctionne pas 
		apiUrl.searchParams.set("language", "fr");
		apiUrl.searchParams.set("locale", "fr"); // Ajouter la locale française
		// Ajouter des paramètres additionnels pour améliorer les résultats en français
		apiUrl.searchParams.set("addChildren", "true"); // Inclure les variantes
		apiUrl.searchParams.set("metaInformation", "true"); // Obtenir plus d'informations

		const res = await fetch(apiUrl.toString(), {
			headers: {
				"User-Agent": "FoodApp/1.0",
			},
			next: { revalidate: 3600 }, // Cache pendant 1 heure
		});

		if (!res.ok) {
			console.error("Erreur API Spoonacular:", res.status, res.statusText);

			// Gestion spécifique des erreurs Spoonacular
			if (res.status === 402) {
				return NextResponse.json(
					{ error: "Quota API Spoonacular dépassé" },
					{ status: 402 }
				);
			}

			return NextResponse.json(
				{ error: "Erreur lors de la requête vers Spoonacular" },
				{ status: res.status }
			);
		}

		const data = await res.json();

		// Vérifier si la réponse contient des ingrédients
		if (!data.results || !Array.isArray(data.results)) {
			return NextResponse.json({
				foods: [],
				total: 0,
				page,
				limit,
				source: "spoonacular",
			});
		}

		// Transformer les données Spoonacular en format Food
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const foods = data.results.map((ingredient: any) => ({
			name: ingredient.name,
			category: ingredient.aisle || "Non catégorisé",
			source: {
				provider: "spoonacular",
				id: ingredient.id.toString(),
			},
			image: ingredient.image
				? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`
				: undefined,
		}));

		return NextResponse.json({
			foods,
			total: data.totalResults || 0,
			page,
			limit,
			hasMore: foods.length === limit,
			source: "spoonacular",
		});
	} catch (error) {
		console.error("Erreur lors de la recherche:", error);

		const isDev = process.env.NODE_ENV === "development";
		const errorMessage = isDev
			? `Erreur de recherche: ${
					error instanceof Error ? error.message : "Erreur inconnue"
			  }`
			: "Une erreur est survenue lors de la recherche";

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

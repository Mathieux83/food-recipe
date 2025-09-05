// src/app/api/search/route.ts - MISE À JOUR avec traduction automatique
import { NextRequest, NextResponse } from "next/server";
import { freeTranslationService } from "@/lib/translation";

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
		// 🌟 TRADUCTION AUTOMATIQUE FRANÇAIS → ANGLAIS
		// Approche alternative : toujours tenter la traduction
		let searchQuery = query;
		let translationInfo = null;

		console.log(`🔄 Tentative de traduction pour: "${query}"`);

		try {
			const translationResult = await freeTranslationService.translate(
				query,
				"fr",
				"en"
			);

			// Utiliser la traduction si elle est différente du terme original et fiable
			const isDifferent =
				translationResult.translatedText.toLowerCase() !== query.toLowerCase();
			const isReliable = translationResult.confidence > 0.3;

			if (isDifferent && isReliable) {
				searchQuery = translationResult.translatedText;
				translationInfo = {
					originalQuery: query,
					translatedQuery: searchQuery,
					confidence: translationResult.confidence,
					source: translationResult.source,
					used: true,
				};
				console.log(
					`✅ Traduit "${query}" → "${searchQuery}" (${translationResult.source}, confiance: ${translationResult.confidence})`
				);
			} else {
				console.log(`📝 Pas de traduction nécessaire pour "${query}"`);
				translationInfo = {
					originalQuery: query,
					translatedQuery: translationResult.translatedText,
					confidence: translationResult.confidence,
					source: translationResult.source,
					used: false,
					reason: isDifferent ? "Low confidence" : "Same as original",
				};
			}
		} catch (error) {
			console.warn(`❌ Erreur de traduction pour "${query}":`, error);
			// Continuer avec le terme original
		}

		// 🔍 RECHERCHE DANS SPOONACULAR
		const offset = (page - 1) * limit;
		const apiUrl = new URL(`${SPOONACULAR_BASE_URL}/food/ingredients/search`);

		// Utiliser le terme traduit pour la recherche
		apiUrl.searchParams.set("query", searchQuery);
		apiUrl.searchParams.set("number", limit.toString());
		apiUrl.searchParams.set("offset", offset.toString());
		apiUrl.searchParams.set("apiKey", SPOONACULAR_API_KEY);

		// Paramètres pour optimiser la recherche
		apiUrl.searchParams.set("addChildren", "true");
		apiUrl.searchParams.set("metaInformation", "true");

		console.log(`🔍 Recherche Spoonacular avec: "${searchQuery}"`);

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
			console.log(`📝 Aucun résultat pour "${searchQuery}"`);

			return NextResponse.json({
				foods: [],
				total: 0,
				page,
				limit,
				source: "spoonacular",
				searchInfo: {
					searchedTerm: searchQuery,
					translation: translationInfo,
				},
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

		console.log(`✅ ${foods.length} résultats trouvés pour "${searchQuery}"`);

		return NextResponse.json({
			foods,
			total: data.totalResults || 0,
			page,
			limit,
			hasMore: foods.length === limit,
			source: "spoonacular",
			searchInfo: {
				searchedTerm: searchQuery,
				translation: translationInfo,
			},
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

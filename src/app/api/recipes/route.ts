// TODO: implémenté l'api des recipes par ingredients sélectionné grace a l'api et a la route search 
// TODO: et FoodCard qui stock les ingrédients sélectionnés de la recherche pour avoir une base pour rechercher des recettes via l'api avec ses ingredients la.

// src/app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const ingredientsParam = searchParams.get("ingredients");
	const limit = Number(searchParams.get("limit") || "12");
	const ranking = searchParams.get("ranking") || "1"; // 1 = maximize used ingredients, 2 = minimize missing ingredients

	if (!ingredientsParam) {
		return NextResponse.json(
			{ error: "Les ingrédients sont requis" },
			{ status: 400 }
		);
	}

	if (!SPOONACULAR_API_KEY) {
		return NextResponse.json(
			{ error: "Clé API Spoonacular manquante" },
			{ status: 500 }
		);
	}

	try {
		// Nettoyer et préparer la liste des ingrédients
		const ingredients = ingredientsParam
			.split(',')
			.map(ing => ing.trim())
			.filter(ing => ing.length > 0)
			.join(',');

		if (!ingredients) {
			return NextResponse.json(
				{ error: "Aucun ingrédient valide fourni" },
				{ status: 400 }
			);
		}

		// Recherche de recettes par ingrédients
		const apiUrl = new URL(`${SPOONACULAR_BASE_URL}/recipes/findByIngredients`);
		apiUrl.searchParams.set("ingredients", ingredients);
		apiUrl.searchParams.set("number", limit.toString());
		apiUrl.searchParams.set("ranking", ranking);
		apiUrl.searchParams.set("ignorePantry", "true"); // Ignorer les ingrédients de base
		apiUrl.searchParams.set("apiKey", SPOONACULAR_API_KEY);

		console.log('apiUrl:', apiUrl.toString());

		const res = await fetch(apiUrl.toString(), {
			headers: {
				'User-Agent': 'FoodApp/1.0',
			},
			next: { revalidate: 1800 }, // Cache pendant 30 minutes
		});

		if (!res.ok) {
			console.error("Erreur API Spoonacular recettes:", res.status, res.statusText);
			
			if (res.status === 402) {
				return NextResponse.json(
					{ error: "Quota API Spoonacular dépassé" },
					{ status: 402 }
				);
			}
			
			return NextResponse.json(
				{ error: "Erreur lors de la recherche de recettes" },
				{ status: res.status }
			);
		}

		const data = await res.json();

		if (!Array.isArray(data)) {
			return NextResponse.json({
				recipes: [],
				total: 0,
				ingredients: ingredients.split(','),
			});
		}

		// Transformer les données en format Recipe
		const recipes = data.map((recipe: any) => ({
			id: recipe.id.toString(),
			title: recipe.title,
			image: recipe.image,
			usedCount: recipe.usedIngredientCount || 0,
			missedCount: recipe.missedIngredientCount || 0,
			score: calculateScore(recipe.usedIngredientCount, recipe.missedIngredientCount),
			usedIngredients: recipe.usedIngredients?.map((ing: any) => ({
				id: ing.id,
				name: ing.name,
				image: ing.image,
				amount: ing.amount,
				unit: ing.unit
			})) || [],
			missedIngredients: recipe.missedIngredients?.map((ing: any) => ({
				id: ing.id,
				name: ing.name,
				image: ing.image,
				amount: ing.amount,
				unit: ing.unit
			})) || []
		}));

		// Trier par score (ingrédients utilisés vs manquants)
		recipes.sort((a, b) => b.score - a.score);

		return NextResponse.json({
			recipes,
			total: recipes.length,
			ingredients: ingredients.split(','),
			source: "spoonacular"
		});

	} catch (error) {
		console.error("Erreur lors de la recherche de recettes:", error);
		
		const isDev = process.env.NODE_ENV === 'development';
		const errorMessage = isDev 
			? `Erreur de recherche: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
			: "Une erreur est survenue lors de la recherche de recettes";

		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}

// Fonction pour calculer un score basé sur les ingrédients utilisés vs manquants
function calculateScore(used: number, missed: number): number {
	if (used === 0) return 0;
	// Score = (ingrédients utilisés * 100) - (ingrédients manquants * 10)
	return (used * 100) - (missed * 10);
}
// src/app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const recipeId = params.id;

	if (!recipeId) {
		return NextResponse.json(
			{ error: "ID de recette requis" },
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
		// Récupérer les informations détaillées de la recette
		const apiUrl = new URL(
			`${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information`
		);
		apiUrl.searchParams.set("includeNutrition", "false");
		apiUrl.searchParams.set("apiKey", SPOONACULAR_API_KEY);

		console.log("API URL:", apiUrl.toString())

		const res = await fetch(apiUrl.toString(), {
			headers: {
				"User-Agent": "FoodApp/1.0",
			},
			next: { revalidate: 3600 }, // Cache pendant 1 heure
		});

		if (!res.ok) {
			console.error(
				"Erreur API Spoonacular détail recette:",
				res.status,
				res.statusText
			);

			if (res.status === 404) {
				return NextResponse.json(
					{ error: "Recette non trouvée" },
					{ status: 404 }
				);
			}

			if (res.status === 402) {
				return NextResponse.json(
					{ error: "Quota API Spoonacular dépassé" },
					{ status: 402 }
				);
			}

			return NextResponse.json(
				{ error: "Erreur lors de la récupération de la recette" },
				{ status: res.status }
			);
		}

		const recipe = await res.json();

		// Transformer les données en format RecipeDetail
		const recipeDetail = {
			id: recipe.id.toString(),
			title: recipe.title,
			image: recipe.image,
			yields: recipe.servings || 1,
			totalTime: recipe.readyInMinutes,
			cookingTime: recipe.cookingMinutes,
			preparationTime: recipe.preparationMinutes,
			summary: recipe.summary ? stripHtml(recipe.summary) : undefined,
			sourceUrl: recipe.sourceUrl,
			spoonacularUrl: recipe.spoonacularSourceUrl,
			healthScore: recipe.healthScore,
			pricePerServing: recipe.pricePerServing,
			vegetarian: recipe.vegetarian,
			vegan: recipe.vegan,
			glutenFree: recipe.glutenFree,
			dairyFree: recipe.dairyFree,
			veryHealthy: recipe.veryHealthy,
			cheap: recipe.cheap,
			veryPopular: recipe.veryPopular,
			sustainable: recipe.sustainable,
			ingredients:
				recipe.extendedIngredients?.map((ing: any) => ({
					id: ing.id,
					name: ing.name,
					nameClean: ing.nameClean,
					original: ing.original,
					originalString: ing.originalString,
					amount: ing.amount,
					unit: ing.unit,
					measures: {
						metric: {
							amount: ing.measures?.metric?.amount,
							unitLong: ing.measures?.metric?.unitLong,
							unitShort: ing.measures?.metric?.unitShort,
						},
						us: {
							amount: ing.measures?.us?.amount,
							unitLong: ing.measures?.us?.unitLong,
							unitShort: ing.measures?.us?.unitShort,
						},
					},
					image: ing.image
						? `https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`
						: undefined,
				})) || [],
			instructions: extractInstructions(
				recipe.instructions,
				recipe.analyzedInstructions,
				
			),
			dishTypes: recipe.dishTypes || [],
			diets: recipe.diets || [],
			occasions: recipe.occasions || [],
			cuisines: recipe.cuisines || [],
			winePairing: recipe.winePairing
				? {
						pairedWines: recipe.winePairing.pairedWines,
						pairingText: recipe.winePairing.pairingText,
						productMatches: recipe.winePairing.productMatches,
				  }
				: undefined,
		};

		return NextResponse.json({
			recipe: recipeDetail,
			source: "spoonacular",
		});
	} catch (error) {
		console.error("Erreur lors de la récupération de la recette:", error);

		const isDev = process.env.NODE_ENV === "development";
		const errorMessage = isDev
			? `Erreur de récupération: ${
					error instanceof Error ? error.message : "Erreur inconnue"
			  }`
			: "Une erreur est survenue lors de la récupération de la recette";

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// Fonction pour nettoyer le HTML du résumé
function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "").trim();
}


// TODO: Récuperer via api avec param 'lang: "fr"'
// Fonction pour extraire les instructions de différents formats
function extractInstructions(
	instructions: string,
	analyzedInstructions: any[]
): string[] {
	// Si on a des instructions analysées, les utiliser
	if (analyzedInstructions && analyzedInstructions.length > 0) {
		const steps: string[] = [];
		analyzedInstructions.forEach((instruction) => {
			if (instruction.steps && instruction.steps.length > 0) {
				instruction.steps.forEach((step: any) => {
					if (step.step && step.step.trim()) {
						steps.push(step.step.trim());
					}
				});
			}
		});
		if (steps.length > 0) return steps;
	}

	// Sinon, utiliser les instructions brutes
	if (instructions && typeof instructions === "string") {
		// Nettoyer le HTML et séparer par des retours à la ligne ou des numéros
		const cleanInstructions = stripHtml(instructions);
		const steps = cleanInstructions
			.split(/\d+\.|\n/)
			.map((step) => step.trim())
			.filter((step) => step.length > 0);

		if (steps.length > 0) return steps;
	}

	return ["Instructions non disponibles"];
}



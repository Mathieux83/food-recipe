// src/app/recettes/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { RecipeDetail } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RecipeDetailPage() {
	const params = useParams();
	const recipeId = params.id as string;
	
	const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

	// Charger les ingrédients sélectionnés
	useEffect(() => {
		const stored = localStorage.getItem('selectedFoods');
		if (stored) {
			try {
				const foods = JSON.parse(stored);
				setSelectedIngredients(foods);
			} catch (e) {
				console.error('Erreur lors du chargement des ingrédients:', e);
			}
		}
	}, []);

	// Charger la recette
	useEffect(() => {
		if (!recipeId) return;

		const fetchRecipe = async () => {
			setLoading(true);
			setError("");

			try {
				const res = await fetch(`/api/recipes/${recipeId}`);
				
				if (!res.ok) {
					if (res.status === 404) {
						throw new Error("Recette non trouvée");
					}
					const errorData = await res.json().catch(() => ({}));
					throw new Error(errorData.error || `Erreur ${res.status}`);
				}

				const data = await res.json();
				setRecipe(data.recipe);
			} catch (error) {
				console.error("Erreur chargement recette:", error);
				setError(error instanceof Error ? error.message : "Une erreur est survenue");
			} finally {
				setLoading(false);
			}
		};

		fetchRecipe();
	}, [recipeId]);

	// Fonction pour créer une liste de courses
	const createShoppingList = () => {
		if (!recipe) return;
		
		const missingIngredients = recipe.ingredients.filter(ing => 
			!selectedIngredients.some(selected => 
				selected.toLowerCase().includes(ing.nameClean?.toLowerCase() || ing.name.toLowerCase()) ||
				(ing.nameClean?.toLowerCase() || ing.name.toLowerCase()).includes(selected.toLowerCase())
			)
		);

		const shoppingList = {
			recipeId: recipe.id,
			recipeTitle: recipe.title,
			items: missingIngredients.map(ing => ({
				name: ing.nameClean || ing.name,
				quantity: ing.amount,
				unit: ing.unit,
				original: ing.original,
				checked: false
			})),
			createdAt: new Date().toISOString()
		};

		// Sauvegarder dans localStorage (ou envoyer à une API)
		const existingLists = JSON.parse(localStorage.getItem('shoppingLists') || '[]');
		existingLists.push({
			...shoppingList,
			_id: Date.now().toString()
		});
		localStorage.setItem('shoppingLists', JSON.stringify(existingLists));

		alert(`Liste de courses créée avec ${missingIngredients.length} ingrédients !`);
	};

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
					<p className="text-gray-500 mt-4">Chargement de la recette...</p>
				</div>
			</div>
		);
	}

	if (error || !recipe) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="text-center py-12">
					<div className="text-6xl mb-4">😞</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Oups !</h2>
					<p className="text-gray-600 mb-6">{error || "Recette non trouvée"}</p>
					<Link href="/recettes" className="btn-primary">
						Retour aux recettes
					</Link>
				</div>
			</div>
		);
	}

	// Calculer les ingrédients que l'utilisateur a et ceux qui manquent
	const userIngredients = recipe.ingredients.filter(ing =>
		selectedIngredients.some(selected =>
			selected.toLowerCase().includes(ing.nameClean?.toLowerCase() || ing.name.toLowerCase()) ||
			(ing.nameClean?.toLowerCase() || ing.name.toLowerCase()).includes(selected.toLowerCase())
		)
	);

	const missingIngredients = recipe.ingredients.filter(ing =>
		!selectedIngredients.some(selected =>
			selected.toLowerCase().includes(ing.nameClean?.toLowerCase() || ing.name.toLowerCase()) ||
			(ing.nameClean?.toLowerCase() || ing.name.toLowerCase()).includes(selected.toLowerCase())
		)
	);

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<nav className="mb-6">
				<div className="flex items-center space-x-2 text-sm text-gray-500">
					<Link href="/" className="hover:text-primary-600">Accueil</Link>
					<span>›</span>
					<Link href="/recettes" className="hover:text-primary-600">Recettes</Link>
					<span>›</span>
					<span className="text-gray-900 truncate">{recipe.title}</span>
				</div>
			</nav>

			{/* En-tête de la recette */}
			<div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
				<div className="md:flex">
					{/* Image */}
					<div className="md:w-1/2">
						<div className="relative h-64 md:h-80">
							{recipe.image ? (
								<Image
									src={recipe.image}
									alt={recipe.title}
									// fill
									className="object-fill h-[150%] w-[150%]"
                                    height={1000}
                                    width={1000}
									// sizes="(max-width: 768px) 100vw, 50vw"
								/>
							) : (
								<div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
									<span className="text-6xl">🍽️</span>
								</div>
							)}
						</div>
					</div>

					{/* Informations principales */}
					<div className="md:w-1/2 p-6">
						<h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
						
						{recipe.summary && (
							<p className="text-gray-600 mb-6 line-clamp-3">{recipe.summary}</p>
						)}

						{/* Métadonnées */}
						<div className="grid grid-cols-2 gap-4 mb-6">
							{recipe.yields && (
								<div className="flex items-center">
									<svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<span className="text-sm text-gray-600">{recipe.yields} portions</span>
								</div>
							)}
							{recipe.totalTime && (
								<div className="flex items-center">
									<svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span className="text-sm text-gray-600">{recipe.totalTime} min</span>
								</div>
							)}
							{recipe.healthScore && (
								<div className="flex items-center">
									<svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
									<span className="text-sm text-gray-600">Santé: {recipe.healthScore}/100</span>
								</div>
							)}
							{recipe.pricePerServing && (
								<div className="flex items-center">
									<svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
									</svg>
									<span className="text-sm text-gray-600">{Math.round(recipe.pricePerServing / 100)}€/portion</span>
								</div>
							)}
						</div>

						{/* Labels diététiques */}
						{(recipe.vegetarian || recipe.vegan || recipe.glutenFree || recipe.dairyFree) && (
							<div className="flex flex-wrap gap-2 mb-6">
								{recipe.vegetarian && (
									<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
										🌱 Végétarien
									</span>
								)}
								{recipe.vegan && (
									<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
										🌿 Vegan
									</span>
								)}
								{recipe.glutenFree && (
									<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
										🌾 Sans gluten
									</span>
								)}
								{recipe.dairyFree && (
									<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
										🥛 Sans lactose
									</span>
								)}
							</div>
						)}

						{/* Actions */}
						<div className="flex gap-3">
							<button
								onClick={createShoppingList}
								className="btn-primary flex items-center"
								disabled={missingIngredients.length === 0}
							>
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
								</svg>
								Liste de courses ({missingIngredients.length})
							</button>
							{recipe.sourceUrl && (
								<a
									href={recipe.sourceUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="btn-secondary flex items-center"
								>
									<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
									Source
								</a>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Statistiques d'ingrédients */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow-sm p-6 text-center">
					<div className="text-3xl font-bold text-green-600 mb-2">{userIngredients.length}</div>
					<div className="text-sm text-gray-600">Ingrédients que vous avez</div>
				</div>
				<div className="bg-white rounded-lg shadow-sm p-6 text-center">
					<div className="text-3xl font-bold text-orange-600 mb-2">{missingIngredients.length}</div>
					<div className="text-sm text-gray-600">Ingrédients à acheter</div>
				</div>
				<div className="bg-white rounded-lg shadow-sm p-6 text-center">
					<div className="text-3xl font-bold text-primary-600 mb-2">
						{Math.round((userIngredients.length / recipe.ingredients.length) * 100)}%
					</div>
					<div className="text-sm text-gray-600">Compatibilité</div>
				</div>
			</div>

			{/* Ingrédients */}
			<div className="bg-white rounded-xl shadow-sm p-6 mb-8">
				<h2 className="text-2xl font-semibold text-gray-900 mb-6">Ingrédients</h2>
				
				{/* Ingrédients que vous avez */}
				{userIngredients.length > 0 && (
					<div className="mb-6">
						<h3 className="text-lg font-medium text-green-700 mb-3 flex items-center">
							<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							Vous avez déjà ({userIngredients.length})
						</h3>
						<div className="space-y-2">
							{userIngredients.map((ingredient, index) => (
								<div key={`user-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
									<div className="flex items-center">
										{ingredient.image && (
											<Image 
												src={ingredient.image} 
												alt={ingredient.name}
                                                height={100}
                                                width={100}
												className="w-8 h-8 object-contain mr-3"
											/>
										)}
										<span className="font-medium text-green-800">{ingredient.original}</span>
									</div>
									<span className="text-green-600 font-medium">✓</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Ingrédients à acheter */}
				{missingIngredients.length > 0 && (
					<div>
						<h3 className="text-lg font-medium text-orange-700 mb-3 flex items-center">
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
							</svg>
							À acheter ({missingIngredients.length})
						</h3>
						<div className="space-y-2">
							{missingIngredients.map((ingredient, index) => (
								<div key={`missing-${index}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
									<div className="flex items-center">
										{ingredient.image && (
											<Image 
												src={ingredient.image} 
												alt={ingredient.name}
                                                height={100}
                                                width={100}
												className="w-8 h-8 object-contain mr-3"
											/>
										)}
										<span className="font-medium text-orange-800">{ingredient.original}</span>
									</div>
									<span className="text-orange-600">🛒</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Instructions */}
			<div className="bg-white rounded-xl shadow-sm p-6 mb-8">
				<h2 className="text-2xl font-semibold text-gray-900 mb-6">Instructions</h2>
				<div className="space-y-4">
					{recipe.instructions.map((instruction, index) => (
						<div key={index} className="flex">
							<div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-4">
								{index + 1}
							</div>
							<p className="text-gray-700 leading-relaxed pt-1">{instruction}</p>
						</div>
					))}
				</div>
			</div>

			{/* Informations supplémentaires */}
			{(recipe.dishTypes?.length || recipe.cuisines?.length || recipe.diets?.length) && (
				<div className="bg-white rounded-xl shadow-sm p-6">
					<h2 className="text-2xl font-semibold text-gray-900 mb-6">Informations supplémentaires</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{recipe.dishTypes && recipe.dishTypes.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-900 mb-2">Type de plat</h3>
								<div className="flex flex-wrap gap-1">
									{recipe.dishTypes.map((type, index) => (
										<span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full capitalize">
											{type}
										</span>
									))}
								</div>
							</div>
						)}
						{recipe.cuisines && recipe.cuisines.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-900 mb-2">Cuisine</h3>
								<div className="flex flex-wrap gap-1">
									{recipe.cuisines.map((cuisine, index) => (
										<span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full capitalize">
											{cuisine}
										</span>
									))}
								</div>
							</div>
						)}
						{recipe.diets && recipe.diets.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-900 mb-2">Régime</h3>
								<div className="flex flex-wrap gap-1">
									{recipe.diets.map((diet, index) => (
										<span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full capitalize">
											{diet}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Navigation */}
			<div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
				<Link href="/recettes" className="flex items-center text-primary-600 hover:text-primary-700">
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Retour aux recettes
				</Link>
				<Link href="/" className="flex items-center text-primary-600 hover:text-primary-700">
					Modifier mes ingrédients
					<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</Link>
			</div>
		</div>
	);
}
// src/app/recettes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Recipe, RecipesResponse } from "@/lib/types";
import RecipeCard from "@/components/ui/RecipeCard";
import SearchBar from "@/components/ui/SearchBar";
import Link from "next/link";
import Image from "next/image";

export default function RecipesPage() {
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [newIngredient, setNewIngredient] = useState("");
	const [searchingIngredients, setSearchingIngredients] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [ingredientSuggestions, setIngredientSuggestions] = useState<any[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [ranking, setRanking] = useState("1"); // 1 = maximize used, 2 = minimize missing

	// Recherche de recettes
	const searchRecipes = useCallback(
		async (ingredients: string[], searchRanking: string = ranking) => {
			if (ingredients.length === 0) {
				setRecipes([]);
				return;
			}

			setLoading(true);
			setError("");

			try {
				const ingredientsParam = ingredients.join(",");
				const res = await fetch(
					`/api/recipes?ingredients=${encodeURIComponent(
						ingredientsParam
					)}&limit=8&ranking=${searchRanking}`
				);

				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					throw new Error(errorData.error || `Erreur ${res.status}`);
				}

				const data: RecipesResponse = await res.json();
				setRecipes(data.recipes || []);

				if (data.recipes.length === 0) {
					setError(
						"Aucune recette trouvée avec ces ingrédients. Essayez d'ajouter d'autres ingrédients ou d'en retirer quelques-uns."
					);
				}
			} catch (error) {
				console.error("Erreur recherche recettes:", error);
				setError(
					error instanceof Error
						? error.message
						: "Une erreur est survenue lors de la recherche"
				);
				setRecipes([]);
			} finally {
				setLoading(false);
			}
		},
		[ranking]
	);


	// Charger les ingrédients depuis localStorage au montage
	useEffect(() => {
		const stored = localStorage.getItem("selectedFoods");
		if (stored) {
			try {
				const foods = JSON.parse(stored);
				if (Array.isArray(foods)) {
					setSelectedIngredients(foods);
					if (foods.length > 0) {
						searchRecipes(foods);
					}
				}
			} catch (e) {
				console.error("Erreur lors du chargement des ingrédients:", e);
			}
		}
	}, [searchRecipes]);

	// Recherche de suggestions d'ingrédients
	const searchIngredientSuggestions = async (query: string) => {
		if (!query.trim() || query.length < 2) {
			setIngredientSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		setSearchingIngredients(true);

		try {
			const res = await fetch(
				`/api/search?query=${encodeURIComponent(query.trim())}&limit=8`
			);

			if (res.ok) {
				const data = await res.json();
				setIngredientSuggestions(data.foods || []);
				setShowSuggestions(true);
			}
		} catch (error) {
			console.error("Erreur recherche suggestions:", error);
		} finally {
			setSearchingIngredients(false);
		}
	};

	// Ajouter un ingrédient depuis les suggestions ou manuellement
	const addIngredient = (ingredientName?: string) => {
		const ingredient = (ingredientName || newIngredient).trim().toLowerCase();

		if (ingredient && !selectedIngredients.includes(ingredient)) {
			const updated = [...selectedIngredients, ingredient];
			setSelectedIngredients(updated);
			localStorage.setItem("selectedFoods", JSON.stringify(updated));
			setNewIngredient("");
			setShowSuggestions(false);
			setIngredientSuggestions([]);
			searchRecipes(updated);
		}
	};

	// Supprimer un ingrédient
	const removeIngredient = (ingredient: string) => {
		const updated = selectedIngredients.filter((ing) => ing !== ingredient);
		setSelectedIngredients(updated);
		localStorage.setItem("selectedFoods", JSON.stringify(updated));
		searchRecipes(updated);
	};

	// Effacer tout
	const clearAll = () => {
		setSelectedIngredients([]);
		setRecipes([]);
		localStorage.removeItem("selectedFoods");
		setError("");
	};

	// Changer le mode de tri
	const handleRankingChange = (newRanking: string) => {
		setRanking(newRanking);
		if (selectedIngredients.length > 0) {
			searchRecipes(selectedIngredients, newRanking);
		}
	};

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			{/* En-tête */}
			<div className='text-center mb-8'>
				<h1 className='text-4xl font-bold text-gray-900 mb-4'>
					Recettes avec vos ingrédients
				</h1>
				<p className='text-lg text-gray-600'>
					Découvrez des recettes que vous pouvez préparer
				</p>
			</div>

			{/* Gestion des ingrédients */}
			<div className='bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200'>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='font-medium text-gray-900'>
						Vos ingrédients ({selectedIngredients.length})
					</h3>
					{selectedIngredients.length === 0 && (
						<Link
							href='/'
							className='text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center'
						>
							<svg
								className='w-4 h-4 mr-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 6v6m0 0v6m0-6h6m-6 0H6'
								/>
							</svg>
							Sélectionner des ingrédients
						</Link>
					)}
				</div>

				{/* Recherche et ajout d'ingrédients */}
				<div className='relative mb-4'>
					<SearchBar
						onSearch={searchIngredientSuggestions}
						placeholder='Ajouter un ingrédient (ex: tomate, oignon...)'
						isLoading={searchingIngredients}
						value={newIngredient}
						onChange={setNewIngredient}
					/>

					{/* Suggestions d'ingrédients */}
					{showSuggestions && ingredientSuggestions.length > 0 && (
						<div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto'>
							{ingredientSuggestions.map((ingredient, index) => (
								<button
									key={`${ingredient.source.id}-${index}`}
									onClick={() => addIngredient(ingredient.name)}
									className='w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0'
									disabled={selectedIngredients.includes(
										ingredient.name.toLowerCase()
									)}
								>
									{ingredient.image && (
										<Image
											src={ingredient.image}
											alt={ingredient.name}
											className='w-8 h-8 object-contain'
										/>
									)}
									<div className='flex-1'>
										<div className='font-medium text-gray-900 capitalize'>
											{ingredient.name}
										</div>
										{ingredient.category && (
											<div className='text-sm text-gray-500 capitalize'>
												{ingredient.category}
											</div>
										)}
									</div>
									{selectedIngredients.includes(
										ingredient.name.toLowerCase()
									) && (
										<span className='text-green-600 text-sm'>
											✓ Déjà ajouté
										</span>
									)}
								</button>
							))}
						</div>
					)}

					{/* Bouton d'ajout manuel */}
					<button
						onClick={() => addIngredient()}
						disabled={!newIngredient.trim()}
						className='absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-1 px-3 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed'
					>
						Ajouter
					</button>
				</div>

				{/* Liste des ingrédients sélectionnés */}
				{selectedIngredients.length > 0 ? (
					<>
						<div className='flex flex-wrap gap-2 mb-4'>
							{selectedIngredients.map((ingredient) => (
								<span
									key={ingredient}
									className='bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center capitalize'
								>
									{ingredient}
									<button
										onClick={() => removeIngredient(ingredient)}
										className='ml-2 text-primary-500 hover:text-primary-700 w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors'
										aria-label={`Supprimer ${ingredient}`}
									>
										×
									</button>
								</span>
							))}
						</div>

						{/* Options de tri */}
						<div className='flex items-center justify-between pt-4 border-t border-gray-100'>
							<div className='flex items-center space-x-4'>
								<span className='text-sm font-medium text-gray-700'>
									Priorité :
								</span>
								<label className='flex items-center'>
									<input
										type='radio'
										value='1'
										checked={ranking === "1"}
										onChange={(e) => handleRankingChange(e.target.value)}
										className='mr-2'
									/>
									<span className='text-sm text-gray-600'>
										Maximiser mes ingrédients
									</span>
								</label>
								<label className='flex items-center'>
									<input
										type='radio'
										value='2'
										checked={ranking === "2"}
										onChange={(e) => handleRankingChange(e.target.value)}
										className='mr-2'
									/>
									<span className='text-sm text-gray-600'>
										Minimiser les achats
									</span>
								</label>
							</div>
							<button
								onClick={clearAll}
								className='text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors'
							>
								Tout effacer
							</button>
						</div>
					</>
				) : (
					<div className='text-center py-8 text-gray-500'>
						<div className='text-4xl mb-4'>🥕</div>
						<p className='mb-2'>Aucun ingrédient sélectionné</p>
						<p className='text-sm'>
							<Link
								href='/'
								className='text-primary-600 hover:text-primary-700 font-medium'
							>
								Retournez à la recherche
							</Link>{" "}
							ou ajoutez des ingrédients ci-dessus
						</p>
					</div>
				)}
			</div>

			{/* État de chargement */}
			{loading && (
				<div className='text-center py-12'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto'></div>
					<p className='text-gray-500 mt-4'>
						Recherche de recettes délicieuses...
					</p>
				</div>
			)}

			{/* Message d'erreur */}
			{error && !loading && (
				<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-8'>
					<div className='flex items-center'>
						<svg
							className='w-5 h-5 text-red-400 mr-2'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						<p className='text-red-600'>{error}</p>
					</div>
				</div>
			)}

			{/* Résultats de recettes */}
			{!loading && recipes.length > 0 && (
				<>
					<div className='flex justify-between items-center mb-6'>
						<div>
							<h2 className='text-2xl font-semibold text-gray-900'>
								{recipes.length} recette{recipes.length > 1 ? "s" : ""} trouvée
								{recipes.length > 1 ? "s" : ""}
							</h2>
							<p className='text-sm text-gray-500 mt-1'>
								{ranking === "1"
									? "Triées par nombre d'ingrédients que vous avez"
									: "Triées par nombre d'ingrédients manquants"}
							</p>
						</div>
						<div className='text-sm text-gray-500 flex items-center'>
							<svg
								className='w-4 h-4 mr-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
								/>
							</svg>
							Score de pertinence
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{recipes.map((recipe) => (
							<RecipeCard
								key={recipe.id}
								recipe={recipe}
								selectedIngredients={selectedIngredients}
							/>
						))}
					</div>

					{/* Statistiques récapitulatives */}
					<div className='mt-8 bg-gray-50 rounded-lg p-6'>
						<h3 className='font-medium text-gray-900 mb-4'>
							Récapitulatif de vos recettes
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
							<div className='bg-white rounded-lg p-4'>
								<div className='text-2xl font-bold text-green-600'>
									{Math.round(
										recipes.reduce(
											(acc, r) =>
												acc +
												(r.usedCount / (r.usedCount + r.missedCount)) * 100,
											0
										) / recipes.length
									)}
									%
								</div>
								<div className='text-sm text-gray-600'>
									Compatibilité moyenne
								</div>
							</div>
							<div className='bg-white rounded-lg p-4'>
								<div className='text-2xl font-bold text-blue-600'>
									{Math.round(
										(recipes.reduce((acc, r) => acc + r.usedCount, 0) /
											recipes.length) *
											10
									) / 10}
								</div>
								<div className='text-sm text-gray-600'>
									Ingrédients utilisés (moyenne)
								</div>
							</div>
							<div className='bg-white rounded-lg p-4'>
								<div className='text-2xl font-bold text-orange-600'>
									{Math.round(
										(recipes.reduce((acc, r) => acc + r.missedCount, 0) /
											recipes.length) *
											10
									) / 10}
								</div>
								<div className='text-sm text-gray-600'>
									Ingrédients à acheter (moyenne)
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Message si pas d'ingrédients et pas de chargement */}
			{!loading && selectedIngredients.length === 0 && (
				<div className='text-center py-16'>
					<div className='text-6xl mb-6'>👨‍🍳</div>
					<h3 className='text-xl font-medium text-gray-900 mb-2'>
						Prêt à cuisiner ?
					</h3>
					<p className='text-gray-600 mb-6 max-w-md mx-auto'>
						Ajoutez des ingrédients que vous avez chez vous pour découvrir des
						recettes personnalisées
					</p>
					<Link href='/' className='btn-primary inline-block mr-4'>
						Choisir des ingrédients
					</Link>
					<button
						onClick={() => {
							// Ajouter des ingrédients populaires pour commencer
							const popularIngredients = [
								"tomate",
								"oignon",
								"ail",
								"huile d'olive",
							];
							setSelectedIngredients(popularIngredients);
							localStorage.setItem(
								"selectedFoods",
								JSON.stringify(popularIngredients)
							);
							searchRecipes(popularIngredients);
						}}
						className='btn-secondary'
					>
						Essayer avec des ingrédients populaires
					</button>
				</div>
			)}
		</div>
	);
}

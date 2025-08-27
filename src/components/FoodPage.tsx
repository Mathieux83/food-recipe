import React, { useEffect } from "react";
import { useState } from "react";
import FoodCard from "@/components/ui/FoodCard";
import SearchBar from "@/components/ui/SearchBar";
import { Food } from "@/lib/types";
import Link from "next/link";

const FoodPage = () => {
	const [foods, setFoods] = useState<Food[]>([]);
	const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const saved = localStorage.getItem("selectedFoods");
		if (saved) {
			try {
				const savedFood = JSON.parse(saved);
				setSelectedFoods(new Set(savedFood));
			} catch (error) {
				console.error(
					"Erreur lors du chargement des aliments sélectionnés:",
					error
				);
			}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('selectedFoods', JSON.stringify(Array.from(selectedFoods)))
	}, [selectedFoods]);

	// Gestionnaire de recherche amélioré
	const handleSearch = async (query: string) => {
		setSearchQuery(query);
		setError("");

		if (!query.trim()) {
			setFoods([]);
			return;
		}

		// Ne pas rechercher si moins de 2 caractères
		if (query.trim().length < 2) {
			setFoods([]);
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(
				`/api/search?query=${encodeURIComponent(query.trim())}&limit=24`
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || `Erreur ${res.status}`);
			}

			const data = await res.json();
			setFoods(data.foods || []);

			// Message informatif si pas de résultats
			if (data.foods.length === 0) {
				setError(
					"Aucun aliment trouvé pour cette recherche. Essayez avec un autre terme."
				);
			}
		} catch (error) {
			console.error("Erreur recherche aliments:", error);
			setError(
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la recherche"
			);
			setFoods([]);
		} finally {
			setLoading(false);
		}
	};

	// Gestion de la sélection des aliments
	const toggleFood = (foodName: string) => {
		const newSelected = new Set(selectedFoods);
		if (newSelected.has(foodName)) {
			newSelected.delete(foodName);
		} else {
			newSelected.add(foodName);
		}
		setSelectedFoods(newSelected);
	};

	// Effacer toutes les sélections
	const clearSelection = () => {
		setSelectedFoods(new Set());
	};

	return (
		<div className='max-w-4xl mx-auto px-4 py-8'>
			{/* En-tête */}
			<div className='text-center mb-8'>
				<h1 className='text-4xl font-bold text-gray-900 mb-4'>
					Que voulez-vous cuisiner ?
				</h1>
				<p className='text-lg text-gray-600'>
					Recherchez et sélectionnez vos ingrédients pour découvrir des recettes
				</p>
			</div>

			{/* Barre de recherche */}
			<div className='mb-8'>
				<SearchBar 
					onSearch={handleSearch} 
					isLoading={loading}
					error={error}
					placeholder="Rechercher un aliment (ex: tomate, pain, fromage...)"
				/>
			</div>

			{/* Aliments sélectionnés */}
			{selectedFoods.size > 0 && (
				<div className='bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-200'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='font-medium text-gray-900'>
							Ingrédients sélectionnés ({selectedFoods.size})
						</h3>
						<div className="flex gap-2">
							<button
								onClick={clearSelection}
								className='text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors'
							>
								Tout effacer
							</button>
						</div>
					</div>
					<div className='flex flex-wrap gap-2 mb-4'>
						{Array.from(selectedFoods).map((name) => (
							<span
								key={name}
								className='bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center capitalize'
							>
								{name}
								<button
									onClick={() => toggleFood(name)}
									className='ml-2 text-primary-500 hover:text-primary-700 w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors'
									aria-label={`Supprimer ${name}`}
								>
									×
								</button>
							</span>
						))}
					</div>
					
					{/* Bouton pour aller aux recettes */}
					<div className="flex justify-center pt-2 border-t border-gray-100">
						<Link 
							href="/recettes"
							className="btn-primary flex items-center"
						>
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
							Voir les recettes ({selectedFoods.size} ingrédients)
						</Link>
					</div>
				</div>
			)}

			{/* État de chargement */}
			{loading && (
				<div className='text-center py-12'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto'></div>
					<p className='text-gray-500 mt-4'>Recherche en cours...</p>
				</div>
			)}

			{/* Message d'aide pour commencer */}
			{!loading && foods.length === 0 && !searchQuery && !error && (
				<div className='text-center py-12 text-gray-500'>
					<div className="text-6xl mb-6">🔍</div>
					<p className='text-lg mb-2'>Commencez à taper pour rechercher des aliments</p>
					<p className='text-sm mb-4'>Essayez &apos;tomate&apos;, &apos;pain&apos;, &apos;fromage&apos;, &apos;poulet&apos;...</p>
					
					{/* Suggestions populaires */}
					<div className="flex flex-wrap justify-center gap-2 mt-6">
						{['tomate', 'oignon', 'ail', 'poulet', 'fromage', 'pain'].map((suggestion) => (
							<button
								key={suggestion}
								onClick={() => handleSearch(suggestion)}
								className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
							>
								{suggestion}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Résultats de recherche */}
			{!loading && foods.length > 0 && (
				<>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-lg font-medium text-gray-900'>
							{foods.length} résultat{foods.length > 1 ? 's' : ''} pour &apos;{searchQuery}&apos;
						</h2>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{foods.map((food, index) => (
							<FoodCard
								key={`${food.source.id}-${index}`}
								food={food}
								isSelected={selectedFoods.has(food.name)}
								onToggle={() => toggleFood(food.name)}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default FoodPage;

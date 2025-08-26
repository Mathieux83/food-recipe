"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FoodCard from "@/components/FoodCard";
import SearchBar from "@/components/ui/SearchBar";
import { Food } from "@/lib/types";

export default function HomePage() {
	const [foods, setFoods] = useState<Food[]>([]);
	const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);

	// Gestionnaire de recherche
	const handleSearch = async (query: string) => {
		if (!query) {
			setFoods([]);
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
			if (!res.ok) throw new Error("Erreur réseau");

			const data = await res.json();
			setFoods(data.foods || []);
		} catch (error) {
			console.error("Erreur recherche aliments:", error);
		}
		setLoading(false);
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

	return (
		<div className='max-w-4xl mx-auto px-4 py-8'>
			{/* En-tête */}
			<div className='text-center mb-8'>
				<h1 className='text-4xl font-bold text-gray-900 mb-4'>
					Que voulez-vous cuisiner ?
				</h1>
				<p className='text-lg text-gray-600'>
					Recherchez et sélectionnez vos ingrédients
				</p>
			</div>

			{/* Barre de recherche */}
			<div className='mb-8'>
				<SearchBar onSearch={handleSearch} />
			</div>

			{/* Aliments sélectionnés */}
			{selectedFoods.size > 0 && (
				<div className='bg-white rounded-xl shadow-sm p-4 mb-8'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='font-medium'>
							Ingrédients sélectionnés ({selectedFoods.size})
						</h3>
						<button
							onClick={() => setSelectedFoods(new Set())}
							className='text-sm text-gray-500 hover:text-gray-700'
						>
							Tout effacer
						</button>
					</div>
					<div className='flex flex-wrap gap-2'>
						{Array.from(selectedFoods).map((name) => (
							<span
								key={name}
								className='bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm'
							>
								{name}
								<button
									onClick={() => toggleFood(name)}
									className='ml-2 text-primary-500 hover:text-primary-700'
								>
									×
								</button>
							</span>
						))}
					</div>
				</div>
			)}

			{/* Résultats de recherche */}
			{loading ? (
				<div className='text-center py-12'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto'></div>
					<p className='text-gray-500 mt-4'>Recherche en cours...</p>
				</div>
			) : foods.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{foods.map((food, index) => (
						<FoodCard
							key={`${food.name}-${index}`}
							food={food}
							isSelected={selectedFoods.has(food.name)}
							onToggle={() => toggleFood(food.name)}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

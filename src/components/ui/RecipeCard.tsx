// src/components/RecipeCard.tsx
import { Recipe } from "@/lib/types";
import React from "react";
import Image from "next/image";
import Link from "next/link";

interface RecipeCardProps {
	recipe: Recipe;
	selectedIngredients: string[];
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
	// Calculer le pourcentage d'ingrédients que l'utilisateur a
	const totalIngredients = recipe.usedCount + recipe.missedCount;
	const matchPercentage =
		totalIngredients > 0
			? Math.round((recipe.usedCount / totalIngredients) * 100)
			: 0;

	return (
		<Link href={`/recettes/${recipe.id}`}>
			<div className='bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group'>
				{/* Image de la recette */}
				<div className='relative h-48 bg-gray-100'>
					{recipe.image ? (
						<Image
							src={recipe.image}
							alt={recipe.title}
							fill
							className='object-cover group-hover:scale-105 transition-transform duration-300'
							sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
							<span className='text-4xl'>🍽️</span>
						</div>
					)}

					{/* Badge de correspondance */}
					<div className='absolute top-3 right-3'>
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
								matchPercentage >= 80
									? "bg-green-100 text-green-700"
									: matchPercentage >= 60
									? "bg-yellow-100 text-yellow-700"
									: "bg-red-100 text-red-700"
							}`}
						>
							{matchPercentage}% match
						</span>
					</div>
				</div>

				<div className='p-4'>
					{/* Titre de la recette */}
					<h3 className='font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors'>
						{recipe.title}
					</h3>

					{/* Statistiques d'ingrédients */}
					<div className='flex items-center justify-between text-sm mb-3'>
						<div className='flex items-center space-x-4'>
							{recipe.usedCount > 0 && (
								<span className='flex items-center text-green-600'>
									<svg
										className='w-4 h-4 mr-1'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
											clipRule='evenodd'
										/>
									</svg>
									{recipe.usedCount} que vous avez
								</span>
							)}
							{recipe.missedCount > 0 && (
								<span className='flex items-center text-orange-600'>
									<svg
										className='w-4 h-4 mr-1'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
											clipRule='evenodd'
										/>
									</svg>
									{recipe.missedCount} manquants
								</span>
							)}
						</div>
					</div>

					{/* Ingrédients utilisés (preview) */}
					{recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
						<div className='mb-3'>
							<p className='text-xs text-gray-500 mb-1'>
								Ingrédients que vous avez :
							</p>
							<div className='flex flex-wrap gap-1'>
								{recipe.usedIngredients.slice(0, 3).map((ingredient) => (
									<span
										key={ingredient.id}
										className='inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full'
									>
										{ingredient.name}
									</span>
								))}
								{recipe.usedIngredients.length > 3 && (
									<span className='text-xs text-gray-500'>
										+{recipe.usedIngredients.length - 3} autres
									</span>
								)}
							</div>
						</div>
					)}

					{/* Ingrédients manquants (preview) */}
					{recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
						<div className='mb-3'>
							<p className='text-xs text-gray-500 mb-1'>À acheter :</p>
							<div className='flex flex-wrap gap-1'>
								{recipe.missedIngredients.slice(0, 2).map((ingredient) => (
									<span
										key={ingredient.id}
										className='inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full'
									>
										{ingredient.name}
									</span>
								))}
								{recipe.missedIngredients.length > 2 && (
									<span className='text-xs text-gray-500'>
										+{recipe.missedIngredients.length - 2} autres
									</span>
								)}
							</div>
						</div>
					)}

					{/* Score de recette */}
					<div className='flex items-center justify-between pt-3 border-t border-gray-100'>
						<div className='flex items-center space-x-2'>
							<div className='flex items-center'>
								{[...Array(5)].map((_, i) => (
									<svg
										key={i}
										className={`w-4 h-4 ${
											i < Math.round(matchPercentage / 20)
												? "text-yellow-400"
												: "text-gray-300"
										}`}
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
									</svg>
								))}
							</div>
							<span className='text-sm text-gray-600'>
								Score: {recipe.score}
							</span>
						</div>

						<div className='text-primary-600 group-hover:text-primary-700 font-medium text-sm'>
							Voir la recette →
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

// src/components/FoodCard.tsx
import { Food } from "@/lib/types";
import React from "react";
import Image from "next/image";

interface FoodCardProps {
	food: Food;
	isSelected: boolean;
	onToggle: () => void;
}

export default function FoodCard({
	food,
	isSelected,
	onToggle,
}: FoodCardProps) {
	return (
		<div
			onClick={onToggle}
			className={`cursor-pointer transform transition-all duration-200 hover:scale-105
        ${isSelected ? "ring-2 ring-primary-500 shadow-lg" : "hover:shadow-lg"}
        bg-white rounded-xl shadow-sm overflow-hidden`}
		>
			{/* Image de l'ingrédient si disponible */}
			{food.image && (
				<div className="relative h-20 w-full bg-gray-100">
					<Image
						src={food.image}
						alt={food.name}
						fill
						className="object-contain p-2"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						onError={(e) => {
							// Cacher l'image en cas d'erreur
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
						}}
					/>
				</div>
			)}
			
			<div className='p-4'>
				<h3 className='font-medium text-gray-900 mb-1 line-clamp-2 capitalize'>
					{food.name}
				</h3>
				
				{/* {food.category && (
					<p className='text-sm text-gray-500 capitalize mb-2'>{food.category}</p>
				)} */}

				{/* Badge de source */}
				<div className="flex items-center justify-between mb-3">
					<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
						food.source.provider === 'spoonacular' 
							? 'bg-green-100 text-green-700' 
							: 'bg-blue-100 text-blue-700'
					}`}>
						{food.source.provider === 'spoonacular' ? '🥄 Spoonacular' : '📊 OpenFood'}
					</span>
				</div>

				<button
					onClick={(e) => {
						e.stopPropagation();
						onToggle();
					}}
					className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
              ${
								isSelected
									? "bg-primary-500 text-white hover:bg-primary-600 shadow-md transform scale-105"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
				>
					{isSelected ? (
						<span className="flex items-center justify-center">
							<svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							Sélectionné
						</span>
					) : (
						"Sélectionner"
					)}
				</button>
			</div>
		</div>
	);
}
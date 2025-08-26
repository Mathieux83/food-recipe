import { Food } from "@/lib/types";
import React from "react";

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
        ${isSelected ? "ring-2 ring-primary-500" : "hover:shadow-lg"}
        bg-white rounded-xl shadow-sm overflow-hidden`}
		>
			<div className='p-4'>
				<h3 className='font-medium text-gray-900 mb-1 line-clamp-2'>
					{food.name}
				</h3>
				{food.category && (
					<p className='text-sm text-gray-500'>{food.category}</p>
				)}

				<div className='mt-3'>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onToggle();
						}}
						className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
              ${
								isSelected
									? "bg-primary-100 text-primary-700 hover:bg-primary-200"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
					>
						{isSelected ? "Sélectionné" : "Sélectionner"}
					</button>
				</div>
			</div>
		</div>
	);
}

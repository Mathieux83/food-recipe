// src/components/ui/SearchBar.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchBarProps {
	onSearch: (query: string) => void;
	placeholder?: string;
	className?: string;
	isLoading?: boolean;
	error?: string;
	value?: string;
	onChange?: (value: string) => void;
	onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function SearchBar({
	onSearch,
	placeholder = "Rechercher un aliment...",
	className = "",
	isLoading = false,
	error = "",
	value: controlledValue,
	onChange,
	onKeyPress,
}: SearchBarProps) {
	const [internalValue, setInternalValue] = useState("");
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Utiliser la valeur contrôlée si fournie, sinon utiliser la valeur interne
	const value = controlledValue !== undefined ? controlledValue : internalValue;
	const setValue = onChange || setInternalValue;

	const debouncedSearch = useDebouncedCallback((term: string) => {
		// Ne rechercher que si le terme fait au moins 2 caractères
		if (term.trim().length >= 3) {
			// Annuler le timeout précédent s'il existe
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Programmer un nouvel appel
			timeoutRef.current = setTimeout(() => {
				onSearch(term.trim());
			}, 300);
		} else if (term.trim().length === 0) {
			onSearch(""); // Effacer les résultats si vide
		}
	}, 300);

	const handleClear = () => {
		setValue("");
		onSearch("");
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);
		
		// Ne déclencher la recherche automatique que si onChange n'est pas fourni
		// (mode non contrôlé)
		if (!onChange) {
			debouncedSearch(newValue);
		}
	};

	return (
		<div className={`relative ${className}`}>
			<input
				type='text'
				placeholder={placeholder}
				value={value}
				onChange={handleInputChange}
				onKeyPress={onKeyPress}
				className={`w-full px-6 py-4 pr-16 text-lg border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
					error
						? "border-red-300 focus:ring-red-500 focus:border-red-500"
						: "border-gray-300"
				}`}
				disabled={isLoading}
			/>

			{/* Boutons dans l'input */}
			<div className='absolute inset-y-0 right-0 flex items-center pr-3 space-x-1'>
				{/* Bouton effacer (si il y a du texte) */}
				{value && (
					<button
						onClick={handleClear}
						className='p-1 text-gray-400 hover:text-gray-600 rounded-full'
						type='button'
						aria-label='Effacer'
					>
						<svg
							className='h-5 w-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				)}

				{/* Indicateur de chargement ou icône de recherche */}
				{isLoading ? (
					<div className='animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full'></div>
				) : (
					<svg
						className='h-5 w-5 text-gray-400'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
				)}
			</div>

			{/* Message d'erreur */}
			{error && <p className='mt-2 text-sm text-red-600'>{error}</p>}

			{/* Indication pour l'utilisateur */}
			{value.length > 0 && value.length < 2 && (
				<p className='mt-2 text-sm text-gray-500'>
					Tapez au moins 2 caractères pour rechercher
				</p>
			)}
		</div>
	);
}
// src/components/ui/SearchBar.tsx
"use client";

import { useCallback, useState } from "react";

interface SearchBarProps {
	onSearch: (query: string) => void;
	placeholder?: string;
	className?: string;
	isLoading?: boolean;
	error?: string;
	value?: string;
	onChange?: (value: string) => void;
}

export default function SearchBar({
	onSearch,
	placeholder = "Rechercher un aliment...",
	className = "",
	isLoading = false,
	error = "",
	value: controlledValue,
	onChange,
}: SearchBarProps) {
	const [internalValue, setInternalValue] = useState(controlledValue || "");

	const value = controlledValue !== undefined ? controlledValue : internalValue;
	const setValue = onChange || setInternalValue;

	const handleSearch = useCallback(() => {
		if (value.trim().length >= 2) {
			onSearch(value);
		}
	}, [onSearch, value]);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				handleSearch();
			}
		},
		[handleSearch]
	);

	const handleClear = useCallback(() => {
		setValue("");
		onSearch("");
	}, [onSearch, setValue]);

	return (
		<div className={`relative ${className}`}>
			<input
				type='text'
				placeholder={placeholder}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyPress={handleKeyPress}
				className={`w-full px-6 py-4 pr-24 text-lg border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
					error
						? "border-red-300 focus:ring-red-500 focus:border-red-500"
						: "border-gray-300"
				}`}
				disabled={isLoading}
			/>

			<div className='absolute inset-y-0 right-0 flex items-center pr-3 space-x-1'>
				{value.length > 0 && (
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

				{isLoading ? (
					<div className='animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full'></div>
				) : (
					<button
						onClick={handleSearch}
						className='p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:bg-gray-300'
						type='button'
						aria-label='Rechercher'
						disabled={value.trim().length < 2}
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
								d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
							/>
						</svg>
					</button>
				)}
			</div>

			{value.length > 0 && value.length < 2 && !error && (
				<p className='mt-2 text-sm text-gray-500'>
					Tapez au moins 2 caractères pour rechercher.
				</p>
			)}
			{error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
		</div>
	);
}

"use client";

import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchBarProps {
	onSearch: (query: string) => void;
	placeholder?: string;
	className?: string;
}

export default function SearchBar({
	onSearch,
	placeholder = "Rechercher un aliment...",
	className = "",
}: SearchBarProps) {
	const [value, setValue] = useState("");

	const debouncedSearch = useDebouncedCallback((term: string) => {
		onSearch(term);
	}, 300);

	return (
		<div className={`relative ${className}`}>
			<input
				type='text'
				placeholder={placeholder}
				value={value}
				onChange={(e) => {
					setValue(e.target.value);
					debouncedSearch(e.target.value);
				}}
				className='w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
			/>
			<div className='absolute inset-y-0 right-0 flex items-center pr-6'>
				<svg
					className='h-6 w-6 text-gray-400'
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
			</div>
		</div>
	);
}
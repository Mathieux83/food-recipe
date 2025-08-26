"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
	{
		href: "/",
		label: "Accueil",
		icon: "🏠",
		description: "Sélection d'aliments",
	},
	{
		href: "/aliments",
		label: "Aliments",
		icon: "🥕",
		description: "Tous les aliments",
	},
	{
		href: "/recettes",
		label: "Recettes",
		icon: "👩‍🍳",
		description: "Recherche de recettes",
	},
	{
		href: "/liste-de-courses",
		label: "Listes",
		icon: "📝",
		description: "Mes listes de courses",
	},
];

export default function Navigation() {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<nav className='bg-white shadow-sm border-b border-gray-500 sticky top-0 z-50'>
			<div className='container mx-auto px-4'>
				<div className='flex items-center justify-between h-16'>
					{/* LOGO */}
					<Link href={"/"} className='flex items-center justify-between h-16'>
						<span className='text-2xl'>🍽️</span>
						<span className='text-2xl font-bold text-primary-600'>
							Food App
						</span>
					</Link>

					{/* Menu Desktop */}
					<div className='hidden md:flex items-center space-x-1'>
						{navItems.map((item) => {
							const isActive =
								pathname === item.href ||
								(item.href !== "/" && pathname.startsWith(item.href));
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
										isActive
											? "bg-primary-100 text-primary-700 shadow-md"
											: "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
									}`}
									title={item.description}
								>
									<span className='mr-2'>{item.icon}</span>
									{item.label}
								</Link>
							);
						})}
					</div>

					{/* Bouton Menu Mobile */}
					<div className='md:hidden'>
						<button
							onClick={toggleMobileMenu}
							className='text-gray-600 hover:text-gray-900 p-2 cursor-pointer'
							aria-label='Toggle mobile menu'
						>
							{isMobileMenuOpen ? (
								// Icône X pour fermer
								<svg
									className='w-6 h-6'
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
							) : (
								// Icône hamburger pour ouvrir
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 6h16M4 12h16M4 18h16'
									/>
								</svg>
							)}
						</button>
					</div>
				</div>

				{/* Menu Mobile Déroulant */}
				{isMobileMenuOpen && (
					<div className='md:hidden border-t border-gray-200 bg-white'>
						<div className='px-2 pt-2 pb-3 space-y-1'>
							{navItems.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== "/" && pathname.startsWith(item.href));
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMobileMenu}
										className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
											isActive
												? "bg-primary-100 text-primary-700"
												: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
										}`}
										title={item.description}
									>
										<span className='mr-3 text-lg'>{item.icon}</span>
										<div>
											<div>{item.label}</div>
											<div className='text-xs text-gray-500'>
												{item.description}
											</div>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}

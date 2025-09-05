// src/lib/translation.ts - APIs gratuites existantes

export interface TranslationResult {
	translatedText: string;
	confidence: number;
	source: "mymemory" | "libretranslate" | "deepl-free" | "fallback";
	error?: string;
}

class FreeTranslationService {
	private cache = new Map<string, TranslationResult>();

	/**
	 * 🌟 OPTION 1: MyMemory API - 100% GRATUIT
	 * Limites: 1000 mots/jour sans clé, 10000 mots/jour avec email
	 * Avantages: Pas besoin de clé API, très simple
	 */
	async translateWithMyMemory(
		text: string,
		fromLang = "fr",
		toLang = "en"
	): Promise<TranslationResult> {
		try {
			const url = new URL("https://api.mymemory.translated.net/get");
			url.searchParams.set("q", text);
			url.searchParams.set("langpair", `${fromLang}|${toLang}`);

			// 💡 ASTUCE: Ajouter un email augmente la limite à 10000 mots/jour
			// url.searchParams.set('de', 'votre-email@example.com');

			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					"User-Agent": "FoodApp/1.0",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			if (data.responseStatus === 200) {
				return {
					translatedText: data.responseData.translatedText,
					confidence: parseFloat(data.responseData.match) || 0.8,
					source: "mymemory",
				};
			}

			throw new Error(data.responseDetails || "Translation failed");
		} catch (error) {
			throw new Error(
				`MyMemory: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}

	/**
	 * 🌟 OPTION 2: LibreTranslate - 100% GRATUIT (instance publique)
	 * Limites: Dépend de l'instance, généralement généreuse
	 * Avantages: Open source, respect de la vie privée
	 */
	async translateWithLibreTranslate(
		text: string,
		fromLang = "fr",
		toLang = "en",
		apiUrl = "https://libretranslate.com/translate" // Instance publique gratuite
	): Promise<TranslationResult> {
		try {
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					q: text,
					source: fromLang,
					target: toLang,
					format: "text",
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			return {
				translatedText: data.translatedText,
				confidence: 0.8,
				source: "libretranslate",
			};
		} catch (error) {
			throw new Error(
				`LibreTranslate: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * 🌟 OPTION 3: DeepL Free API (nécessite inscription gratuite)
	 * Limites: 500 000 caractères/mois
	 * Avantages: Qualité de traduction exceptionnelle
	 *
	 * ⚠️ Nécessite une clé API gratuite : https://www.deepl.com/fr/pro-api
	 */
	//   async translateWithDeepLFree(
	//     text: string,
	//     fromLang = 'FR',
	//     toLang = 'EN',
	//     apiKey?: string
	//   ): Promise<TranslationResult> {
	//     if (!apiKey) {
	//       throw new Error('DeepL API key required');
	//     }

	//     try {
	//       const response = await fetch('https://api-free.deepl.com/v2/translate', {
	//         method: 'POST',
	//         headers: {
	//           'Authorization': `DeepL-Auth-Key ${apiKey}`,
	//           'Content-Type': 'application/x-www-form-urlencoded',
	//         },
	//         body: new URLSearchParams({
	//           text,
	//           source_lang: fromLang,
	//           target_lang: toLang
	//         })
	//       });

	//       if (!response.ok) {
	//         throw new Error(`HTTP ${response.status}`);
	//       }

	//       const data = await response.json();

	//       if (data.translations && data.translations.length > 0) {
	//         return {
	//           translatedText: data.translations[0].text,
	//           confidence: 0.95, // DeepL est très fiable
	//           source: 'deepl-free'
	//         };
	//       }

	//       throw new Error('No translation returned');
	//     } catch (error) {
	//       throw new Error(`DeepL: ${error instanceof Error ? error.message : 'Unknown error'}`);
	//     }
	//   }

	/**
	 * 🎯 MÉTHODE PRINCIPALE avec fallback automatique
	 */
	async translate(
		text: string,
		fromLang = "fr",
		toLang = "en"
	): Promise<TranslationResult> {
		const cacheKey = `${fromLang}-${toLang}-${text.toLowerCase()}`;

		// Vérifier le cache
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey)!;
		}

		// Essayer les APIs dans l'ordre de préférence
		const providers = [
			() => this.translateWithMyMemory(text, fromLang, toLang),
			() => this.translateWithLibreTranslate(text, fromLang, toLang),
		];

		// Si vous avez une clé DeepL gratuite, décommentez cette ligne :
		// const deeplKey = process.env.DEEPL_API_KEY;
		// if (deeplKey) {
		//   providers.unshift(() => this.translateWithDeepLFree(text, fromLang.toUpperCase(), toLang.toUpperCase(), deeplKey));
		// }

		for (const provider of providers) {
			try {
				const result = await provider();
				this.cache.set(cacheKey, result);
				return result;
			} catch (error) {
				console.warn("Translation provider failed:", error);
				continue;
			}
		}

		// Fallback : retourner le texte original
		const fallbackResult: TranslationResult = {
			translatedText: text,
			confidence: 0,
			source: "fallback",
			error: "All translation providers failed",
		};

		this.cache.set(cacheKey, fallbackResult);
		return fallbackResult;
	}

	/**
	 * 🧹 Utilitaires
	 */
	clearCache(): void {
		this.cache.clear();
	}

	getCacheSize(): number {
		return this.cache.size;
	}
}

// Instance singleton
export const freeTranslationService = new FreeTranslationService();

// Fonction utilitaire simple
export async function translateFrenchToEnglish(text: string): Promise<string> {
	
	try {
		const result = await freeTranslationService.translate(text, "fr", "en");
		return result.translatedText;
	} catch (error) {
		console.error("Translation failed:", error);
		return text; // Retourner le texte original en cas d'erreur
	}
}

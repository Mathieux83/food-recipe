// src/lib/types.ts
export interface Food {
  name: string
  // category?: string
  image?: string
  // lang: string
  source: {
    provider: string
    id: string
  }
}

export interface Ingredient {
  id: number
  name: string
  image?: string
  amount: number
  unit: string
}

export interface Recipe {
  id: string
  title: string
  image?: string
  usedCount: number
  missedCount: number
  score: number
  usedIngredients?: Ingredient[]
  missedIngredients?: Ingredient[]
}

export interface RecipeDetail {
  id: string
  title: string
  image?: string
  yields: number
  totalTime?: number
  cookingTime?: number
  preparationTime?: number
  summary?: string
  sourceUrl?: string
  spoonacularUrl?: string
  healthScore?: number
  pricePerServing?: number
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  dairyFree?: boolean
  veryHealthy?: boolean
  cheap?: boolean
  veryPopular?: boolean
  sustainable?: boolean
  ingredients: Array<{
    id: number
    name: string
    nameClean?: string
    original: string
    originalString?: string
    amount: number
    unit: string
    measures?: {
      metric?: {
        amount?: number
        unitLong?: string
        unitShort?: string
      }
      us?: {
        amount?: number
        unitLong?: string
        unitShort?: string
      }
    }
    image?: string
  }>
  instructions: string[]
  dishTypes?: string[]
  diets?: string[]
  occasions?: string[]
  cuisines?: string[]
  winePairing?: {
    pairedWines?: string[]
    pairingText?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productMatches?: any[]
  }
}

export interface ShoppingItem {
  name: string
  quantity: number
  unit: string
  checked: boolean
}

export interface ShoppingList {
  _id: string
  recipeTitle?: string
  items: ShoppingItem[]
  createdAt: string
}

export interface ShoppingListDetail extends ShoppingList {
  recipeId: string
  userId?: string
  updatedAt: string
}

// Types pour les réponses API
export interface SearchResponse {
  foods: Food[]
  total: number
  lang: string
  page: number
  limit: number
  hasMore?: boolean
  source: string
}

export interface RecipesResponse {
  recipes: Recipe[]
  total: number
  ingredients: string[]
  source: string
}

export interface RecipeDetailResponse {
  recipe: RecipeDetail
  source: string
}
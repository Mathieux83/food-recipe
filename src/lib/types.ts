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

// Types pour les instructions analysées de Spoonacular
export interface Step {
  number: number
  step: string
  ingredients?: Array<{
    id: number
    name: string
    image?: string
  }>
  equipment?: Array<{
    id: number
    name: string
    image?: string
  }>
  length?: {
    number: number
    unit: string
  }
}

export interface AnalyzedInstruction {
  name: string
  steps: Step[]
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
    productMatches?: Array<{
      id: number
      title: string
      description?: string
      price?: string
      imageUrl?: string
      averageRating?: number
      ratingCount?: number
      score?: number
      link?: string
    }>
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
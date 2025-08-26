export interface Food {
  name: string
  category?: string
  source: {
    provider: string
    id: string
  }
}

export interface Recipe {
  id: string
  title: string
  image?: string
  usedCount: number
  missedCount: number
  score: number
}

export interface RecipeDetail {
  id: string
  title: string
  image?: string
  yields: number
  totalTime?: number
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
  }>
  instructions: string[]
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

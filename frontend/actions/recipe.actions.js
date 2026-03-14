"use server";

import { checkUser } from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { freeMealRecommendations, proTierLimit } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { DUMMY_RECIPE_RESPONSE } from "@/lib/dummy";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function getRecipesByPantryIngredients() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User is not authorized");
    }

    // Check if user is Pro
    const isPro = user.subscriptionTier?.toLowerCase() === "pro";

    // Apply Arcjet rate limit based on tier
    const arcjetClient = isPro ? proTierLimit : freeMealRecommendations;

    // Create Arcjet request context
    const req = await request();

    const decision = await arcjetClient.protect(req, {
      userId: user.clerkId, // Use clerkId from checkUser
      requested: 1, // Request 1 token from bucket
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error(
          `Monthly scan limit reached. ${
            isPro
              ? "Please contact support if you need more scans."
              : "Upgrade to Pro for unlimited scans!"
          }`,
        );
      }
      throw new Error("Request denied by security system");
    }

    // Fetch user's pantry items 
    const pantryResponse = await fetch(
        `${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          },
          cache: "no-store",
        }
      );

      if(!pantryResponse.ok) {
        throw new Error("Failed to fetch pantry items");
      }
      
      const pantryData = await pantryResponse.json();

      if(!pantryData.data || pantryData.data.length === 0) {
        return {
            success: false,
            message: "No pantry items found. Please add items to your pantry first."
        }
      }

      const ingredients = pantryData.data.map((item) => item.name).join(", ");

      const model = genAI.getGenerativeModel({model: "gemini-2.5-flash-lite"});

      const prompt = `You are a professional chef. Given these available ingredients: ${ingredients}
        Suggest 5 recipes that can be made primarily with these ingredients. It's fine if the recipes need 1-2 common pantry staples (salt, pepper, oil, etc.) that aren't listed.

        Return ONLY a valid JSON array (no markdown, no explanations):
        [{
            "title": "Name of the recipe",
            "description": "A brief description of the recipe, 1-2 sentences",
            "matchPercentage": 85,
            "missingIngredients": ["ingredient1", "ingredient2"],
            "category": "breakfast|lunch|dinner|snack|dessert",
            "cuisine": "italian|chinese|mexican|etc",
            "prepTime": 20,
            "cookTime": 30,
            "servings": 4
        }]
        Rules:
        - matchPercentage should be 70-99% (how many listed ingredients are used)
        - missingIngredients should be common items or optional additions
        - Sort by matchPercentage descending
        - Make recipes realistic and delicious
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let recipeSuggestions;
        try {
            const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            recipeSuggestions = JSON.parse(cleanText);
        }
        catch(parseError) {
            console.error("Failed to parse Gemini response:", text);
            throw new Error("Failed to generate recipes. Please try again.");
        }

        return {
            success: true,
            recipes: recipeSuggestions,
            ingredientsUsed: ingredients,
            recommendationsLimit: isPro ? "unlimited" : 5,
            message: `Generated ${recipeSuggestions.length} recipe suggestions!`
        }

  }

  catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error(error.message || "Failed to generate recipes. Please try again.");
  }
}

// Helper function to normalize recipe titles 
function normalizeTitle(title) {
  return title
  .trim()
  .split(" ")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(" ");
}

// Helper function to fetch image from Unsplash API based on recipe name
async function fetchRecipeImage(recipeName) {}

// Get or generate recipe details
export async function getOrGenerateRecipe(formData){
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User is not authorized");
    }

    const recipeName = formData.get("recipeName");
    if (!recipeName) {
      throw new Error("Recipe name is required");
    }

    // Normalize recipe name for consistent searching
    const normalizedTitle = normalizeTitle(recipeName)

    // Step 1 : Check if recipe already exists in DB

    // Step 2 : Recipe doesn't exist, generate details using Gemini 

    // Step 3 : Fetch image from Unsplash API

    // Step 4 : Save generated recipe to DB

    return DUMMY_RECIPE_RESPONSE;

  }
  catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error(error.message || "Failed to generate recipe.");
  }
}

// Save recipe to user's collection (bookmark/favorites)
export async function saveRecipeToCollection(formData){
  try{
    const user = await checkUser();
    if(!user){
      throw new Error("User is not authorized");
    }

    const recipeId = formData.get("recipeId");
    if(!recipeId){
      throw new Error("Recipe ID is required");
    }

    // Check if recipe already exists in DB
    const existingResponse = await fetch(
      `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${recipeId}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if(existingResponse.ok){
      const existingData = await existingResponse.json();
      if(existingData.data && existingData.data.length > 0){
        return {
          success: false,
          alreadySaved: true,
          message: "Recipe is already in your collection"
        };
      }
    }

    // Create saved recipe relation
    const saveResponse = await fetch(`${STRAPI_URL}/api/saved-recipes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            user: user.id,
            recipe: recipeId,
            savedAt: new Date().toISOString(),
          },
        }),
      });

      if(!saveResponse.ok){
        const erroText = await saveResponse.text();
        console.error("Failed to save recipe:", erroText);
        throw new Error("Failed to save recipe to collection");
      }

      const savedRecipe = await saveResponse.json();
      return{
        success: true,
        alreadySaved: false,
        savedRecipeId: savedRecipe.data,
        message: "Recipe saved to your collection!"
      };

  }
  catch(error){
    console.error("Error saving recipe to collection:", error);
    throw new Error(error.message || "Failed to save recipe to collection.");
  }
}

// Remove recipe from user's collection
export async function removeRecipeFromCollection(formData){
  try {
    const user = await checkUser();
    if(!user){
      throw new Error("User is not authorized");
    }

    const recipeId = formData.get("recipeId");
    if(!recipeId){
      throw new Error("Recipe ID is required");
    }
    
    // Find the saved recipe relation
    const searchResponse = await fetch(
      `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${recipeId}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if(!searchResponse.ok){
      throw new Error("Failed to find saved recipe");
    }
    
    const searchData = await searchResponse.json();

    if(!searchData.data || searchData.data.length === 0){
      return{
        success: true,
        message: "Recipe is not in your collection"
      };
    }

    // Delete the saved recipe relation
    const savedRecipeId = searchData.data[0].id;
    const deleteResponse = await fetch(`${STRAPI_URL}/api/saved-recipes/${savedRecipeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      }
    );

    if(!deleteResponse.ok){
      throw new Error("Failed to remove recipe from collection");
    }

    return{
      success: true,
      message: "Recipe removed from your collection"
    }
  }
  catch (error) {
    console.error("Error removing recipe from collection:", error);
    throw new Error(error.message || "Failed to remove recipe from collection.");
  }
}
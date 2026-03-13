"use server";

import { checkUser } from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { freeMealRecommendations, proTierLimit } from "@/lib/arcjet";
import { request } from "@arcjet/next";

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
    const isPro = user.subscriptionTier === "pro";

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

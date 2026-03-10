"use client"

import { getMealsByArea } from "@/actions/mealdb.actions";
import { useParams } from "next/navigation";
import RecipeGrid from "@/components/RecipeGrid";

export default function CuisineRecipesPage(){
    const params = useParams();
    const cuisine = params.cuisine;

    return(
        <RecipeGrid type="cuisine" value={cuisine} fetchAction={getMealsByArea} backlink="/dashboard" />
    )
}
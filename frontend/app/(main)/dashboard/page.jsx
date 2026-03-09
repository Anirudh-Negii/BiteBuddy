import { getRecipeOfTheDay, getCategories, getAreas } from "@/actions/mealdb.actions";
import React from 'react'

const DashboardPage = async() => {

    const recipeData = await getRecipeOfTheDay();
    const categoriesData = await getCategories();
    const areasData = await getAreas();

    const recipeOfTheDay = recipeData?.recipe;
    const categories = categoriesData?.categories || [];
    const areas = areasData?.areas || []; 

    return (
        <div className='min-h-screen bg-stone-50 py-16 px-4'>
        DashboardPage
        </div>
    )
}

export default DashboardPage

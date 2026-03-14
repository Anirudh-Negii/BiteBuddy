"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users, ChefHat, Flame, Lightbulb, Bookmark, BookmarkCheck, Loader2, AlertCircle, CheckCircle2, Download, } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useFetch from "@/hooks/use-fetch";
import { getOrGenerateRecipe, saveRecipeToCollection, removeRecipeFromCollection } from "@/actions/recipe.actions";
import { toast } from "sonner";
import Image from "next/image";
import { ClockLoader } from "react-spinners";


function RecipeContent(){
    const searchParams = useSearchParams();
    const recipeName = searchParams.get('cook');
    const router = useRouter();

    const [recipe, setRecipe] = useState(null);
    const [recipeId, setRecipeId] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    // Get or generate recipe 
    const {
        loading: loadingRecipe,
        data: recipeData,
        fn: fetchRecipe
    } = useFetch(getOrGenerateRecipe);

    // Save recipe to collection
    const {
        loading: saving,
        data: saveData,
        fn: saveToCollection,
    } = useFetch(saveRecipeToCollection);

    // Remove recipe from collection
    const {
        loading: removing,
        data: removeData,
        fn: removeFromCollection,
    } = useFetch(removeRecipeFromCollection);

    // Handle save success
    useEffect(() => {
        if(saveData?.success){
            if(saveData.alreadySaved){
                toast.info("Recipe is already in your collection")
            }
            else{
                toast.success("Recipe saved to your collection")
            }
        }
    }, [saveData]);

    // Handle remove success
    useEffect(() => {
        if(removeData?.success){
            setIsSaved(false)
            toast.success("Recipe removed from collection")
        }
    }, [removeData]);

    const handleToggleSave = async () => {
        if(!recipeId) return;

        const formData = new FormData();
        formData.append("recipeId", recipeId);

        if(isSaved){
            await removeFromCollection(formData);
        }
        else{
            await saveToCollection(formData);
        }
    }

    // Fetch recipe on mount
    useEffect(() => {
        if(recipeName && !recipe){
            const formData = new FormData();
            formData.append("recipeName", recipeName);
            fetchRecipe(formData);
        }
    }, [recipeName]);

    // Update recipe state when data is fetched/generated
    useEffect(() => {
        if(recipeData?.success){
            setRecipe(recipeData.recipe);
            setRecipeId(recipeData.recipeId);
            setIsSaved(recipeData.isSaved);

            if(recipeData.fromDatabase){
                toast.success("Recipe loaded from your collection!");
            } else{
                toast.success("New recipe generated & saved!");
            }
        }
    }, [recipeData]);

    // No recipe name in URL
    if(!recipeName){
        return(
            <div className="min-h-screen bg-stone-50 pt-24 pb-16">
                <div className="container mx-auto max-w-4xl text-center py-20">

                    <div className="bg-orange-50 w-20 h-20 border-2 border-orange-200 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className='w-10 h-10 text-orange-600' />
                    </div>

                    <h2 className='text-2xl font-bold text-stone-900 mb-2'>No recipe specified</h2>
                    <p className='ttext-stone-600 mb-6 font-light'>Please select a recipe from the dashboard</p>

                    <Link href='/dashboard'>
                        <Button className='bg-orange-600 hover:bg-orange-700'>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Recipe is loading
    if(loadingRecipe === null || loadingRecipe){
        return(
            <div className="min-h-screen bg-stone-50 pt-24 pb-16">
                <div className="container mx-auto max-w-4xl text-center py-20">
                    <ClockLoader className='mx-auto mb-6' color='#dc6300'/>
                    <h2 className='text-3xl font-bold text-stone-900 mb-2 tracking-light'>Preparing your recipe</h2>
                    <p className='text-stone-600 font-light'>
                        Our AI chef is crafting detailed instructions for{" "}
                        <span className="font-bold text-orange-600">{recipeName}</span>
                        ...
                    </p>
                </div>
            </div>
        )
    }

    // Error state 
    if(loadingRecipe === false && !recipe){
        return(
            <div className="min-h-screen bg-stone-50 pt-24 pb-16">
                <div className="container mx-auto max-w-4xl text-center py-20">
                    <div className="bg-red-50 w-20 h-20 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className='w-10 h-10 text-red-600'/>
                    </div>
                    <h2 className='text-2xl font-bold text-stone-900 mb-2'>Failed to load recipe</h2>
                    <p className='text-stone-600 font-light'>
                        We couldn't load the recipe for{" "}
                        <span className="font-bold text-orange-600">{recipeName}</span>
                        . Please try again later.
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => router.back()} variant='outline'
                            className='border-2 border-stone-800 hover:bg-stone-900 hover:text-white'>
                                <ArrowLeft className='w-4 h-4 mr-2'/>Go Back
                        </Button>
                        <Button onClick={() => window.location.reload()}
                            className='border-orange-600 hover:bg-orange-700'>
                                Retry
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className="min-h-screen bg-stone-50 pt-24 pb-16">
            <div className="container mx-auto max-w-4xl">
                <div className='mb-8'>
                    <Link href='/dashboard' className='inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 transtion-colors mb-6 font-medium'>
                        <ArrowLeft className='w-4 h-4'/>Back to Dashboard
                    </Link>

                    <div className="bg-white p-8 md:p-10 border-2 border-stone-200 mb-6">
                        {recipe.imageUrl && (
                            <div className='relative w-full h-72 overflow-hidden mb-7'>
                                <Image
                                  src={recipe.imageUrl}
                                  alt={recipe.title}
                                  fill
                                  className='object-cover'
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                  priority  
                                />
                            </div>
                        )}

                        <div className='flex flex-wrap gap-2 mb-4'>
                            <Badge variant='outline' className='text-orange-600 border-2 border-orange-200 capitalize'>
                                {recipe.cuisine}
                            </Badge>
                            <Badge variant='outline' className='text-stone-600 border-2 border-stone-200 capitalize'>
                                {recipe.category}
                            </Badge> 
                        </div>

                        {/* Title */}
                        <h1 className='text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-light'>
                            {recipe.title}
                        </h1>

                        {/* Description */}
                        <p className='text-lg text-stone-600 mb-6 font-light'>
                            {recipe.description}
                        </p>

                        <div className='flex flex-wrap gap-6 text-stone-600 mb-6'>
                            <div className='flex items-center gap-2'>
                                <Clock className='w-5 h-5 text-orange-600'/>
                                <span className='font-medium    '>
                                    {parseInt(recipe.prepTime) + parseInt(recipe.cookTime)} mins
                                    total
                                </span>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Users className='w-5 h-5 text-orange-600'/>
                                <span className='font-medium'>{recipe.servings} servings</span>
                            </div>

                            {recipe.nutrition?.calories && (
                                <div className='flex items-center gap-2'>
                                    <Flame className='w-5 h-5 text-orange-600'/>
                                    <span className='font-medium'>
                                        {recipe.nutrition.calories} cal/serving
                                    </span> 
                                </div>
                            )}
                        </div>

                        <div className='flex flex-wrap gap-3'>
                            <Button
                              onClick={handleToggleSave}
                              disabled={saving || removing}
                              className={`${
                                isSaved
                                  ? "bg-green-600 hover:bg-green-700 border-2 border-green-700"
                                  : "bg-orange-600 hover:bg-orange-700 border-2 border-orange-700"
                              } text-white gap-2 transition-all`}
                            >
                                {saving || removing ? (
                                    <>
                                      <Loader2 className='w-4 h-4 animate-spin' />
                                      {isSaved ? "Saving..." : "Removing..."}
                                    </>
                                ): isSaved? (
                                    <>
                                      <BookmarkCheck className='w-4 h-4'/>Saved to Collection
                                    </>
                                ): (
                                    <>
                                      <Bookmark className='w-4 h-4'/>Save to Collection
                                    </>
                                )}
                            </Button>

                            {/* PDF Download button */}
                        </div>
                    </div>
                </div>

                <div className='grid lg:grid-cols-3 gap-6'>
                    {/* Left Column - Ingredients & Nutrition */}
                    <div className='lg:cols-span-1 space-y-6'>
                        <div className='bg-white p-6 border-2 border-stone-200 lg:sticky lg:top-24'>
                            <h2 className='text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2'>
                                <ChefHat className='w-6 h-6 text-orange-600'/>Ingredients
                            </h2>

                            {Object.entries(
                                recipe.ingredients.reduce((acc, ing) => {
                                    const cat = ing.category || "other";
                                    if(!acc[cat]) acc[cat] = [];
                                    acc[cat].push(ing);
                                    return acc;
                                }, {})
                            ).map(([category, items]) => (
                                <div key={category} className='mb-6 last:mb-0'>
                                    <h3 className='text-sm font-bold text-stone-500 uppercase tracking-wide mb-3'>{category}</h3>

                                    <ul className='space-y-2'>
                                        {items.map((ingredient, i) => (
                                            <li key={i} className='flex justify-between items-start gap-2 text-stone-700 py-2 border-b border- stone-100 last:border-0'>
                                                <span className="flex-1">{ingredient.item}</span>
                                                <span className="font-bold text-orange-600 text-sm whitespace-nowrap">{ingredient.amount}</span>
                                            </li>
                                        ))}

                                        {/* Nutrition Info */}
                                        {recipe.nutrition && (
                                            <div className="mt-6 pt-6 border-t-2 border-stone-200">
                                                <h3 className="font-bold text-stone-900 mb-3 uppercase tracking-wide text-sm">
                                                    Nutrition (per serving)
                                                </h3>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-orange-50 p-3 text-center border-2 border-orange-100">
                                                        <div className="text-2xl font-bold text-orange-600">
                                                            {recipe.nutrition.calories}
                                                        </div>
                                                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                                                            Calories
                                                        </div>
                                                    </div>

                                                    <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                                                        <div className="text-2xl font-bold text-stone-900">
                                                            {recipe.nutrition.protein}
                                                        </div>
                                                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                                                            Protein
                                                        </div>
                                                    </div>

                                                    <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                                                        <div className="text-2xl font-bold text-stone-900">
                                                            {recipe.nutrition.carbs}
                                                        </div>
                                                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                                                            Carbs
                                                        </div>
                                                    </div>

                                                    <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                                                        <div className="text-2xl font-bold text-stone-900">
                                                            {recipe.nutrition.fat}
                                                        </div>
                                                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                                                            Fat
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Instructions & Tips */}
                    <div className='lg:col-span-2 space-y-6'>
                        <div className="bg-white p-8 border-2 border-stone-200">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">
                                Step by Step Instructions
                            </h2>

                            <div>
                                {recipe.instructions.map((step, index) => (
                                    <div
                                      key={step.step}
                                      className={`relative pl-12 pb-8 ${
                                        index !== recipe.instructions.length - 1
                                        ? "border-l-2 border-orange-300 ml-5"
                                        : "ml-5"
                                      }`}
                                    >
                                      {/* Step number */}
                                      <div className="absolute -left-5 top-0 w-10 h-10 bg-orange-600 text-white flex items-center justify-center font-bold border-2 border-orange-700">
                                        {step.step}
                                      </div> 

                                      <div>
                                        <h3 className="font-bold text-lg text-stone-900 mb-2">{step.title}</h3>
                                        <p className="text-stone-700 font-light mb-3">{step.instruction}</p>

                                        {step.tip && (
                                            <div className="bg-orange-50 border-l-4 border-orange-600 p-4">
                                                <p className='text-sm text-orange-900 flex items-start gap-2'>
                                                    <Lightbulb className='w-4 h-4 mt-0.5 shrink-0 fill-orange-600'/>
                                                    <span>
                                                        <strong className='font-bold'>Pro Tip:</strong>{" "}
                                                        {step.tip}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                      </div>

                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5"/>
                                    <div>
                                        <h3 className="font-bold text-green-900 mb-1">You&apos;re all done!</h3>
                                        <p className="text-sm text-green-800 font-light">
                                            Plate your masterpiece & enjoy your delicious{" "}{recipe.title}. Don&apos;t forget to share it with friends & family!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function RecipePage(){
    return (
        <Suspense
        fallback={
            <div className='min-h-screen bg-stone-50 pt-24 pb-16 px-4'>
                <div className="container mx-auto max-w-4xl text-center py-20">
                    <Loader2 className='w-16 h-16 text-orange-600 animate-spin mx-auto mb-6'/>
                    <p className="text-stone-600">Loading recipe...</p>
                </div>
            </div>
        }>
            <RecipeContent />
        </Suspense>
    )
}

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

const RecipeCard = ({ recipe, variant='default'}) => {

    const getRecipeData = () => {
        // For MealDB recipes 
        if(recipe.strMeal){
            return {
                title: recipe.strMeal,
                image: recipe.strMealThumb,
                href: `/recipe?cook=${encodeURIComponent(recipe.strMeal)}`,
                showImage: true
            };
        }

        // more conditions for other recipe formats can be added here

        return {};
    }

    const data = getRecipeData();

    if(variant === 'grid'){
        return(
            <Link href={data.href} className='block h-full'>
                <Card className='h-full rounded-none overflow-hidden border-stone-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group pt-0'>
                    {data.showImage ? (
                        <div className='relative aspect-square'>
                            <Image
                                src={data.image}
                                alt={data.title}
                                fill
                                className='object-cover'
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            />

                            <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
                                <div className='absolute bottom-0 left-0 right-0 p-4'>
                                    <p className='text-white text-sm font-medium'>
                                        Click to view recipe
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (<div></div>)}

                    <CardHeader className='flex-1'>
                        <CardTitle className='min-h-14 text-lg font-bold leading-tight text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2'>
                            {data.title}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </Link>
        )
    }

    return (
        <div>Recipe Card</div>
    )
}

export default RecipeCard

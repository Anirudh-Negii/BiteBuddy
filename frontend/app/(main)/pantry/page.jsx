"use client"

import React from 'react'
import { Plus, Trash2, Edit2, Check, X, ChefHat, Loader2, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pantrypage = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ name: "", quantity: ""});

    return (
        <div className='min-h-screen bg-stone-50 pt-24 pb-16 px-4'>
            <div className='container mx-auto max-w-5xl'>
                <div className='mb-4'>
                    <div className='flex items-center justify-between pb-6'>
                        <Package className='w-16 h-16 text-orange-600' />
                        <div>
                            <h1 className='text-4xl md:text-5xl font-bold text-stone-900 tracking-light'>My Pantry</h1>
                            <p className='text-stone-600 font-light'>Manage your ingredients & discover what you can cook</p>
                        </div>
                    </div>

                    <Button onClick={() => setIsModalOpen(true)} className='hidden md:flex' size='lg' variant='primary'>
                        <Plus className='w-5 h-5' /> Add to Pantry
                    </Button>
                </div>
            </div>

            {/* Modal for adding items in pantry*/}
        </div>
    )
}

export default Pantrypage

"use client"

import React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import PricingSection from './PricingSection';

const PricingModal = ({children, subscriptionTier}) => {

    const [isOpen, setIsOpen] = React.useState(false);
    const canOpen = subscriptionTier === 'free'

    return (
        <Dialog isOpen={isOpen} onOpenChange={canOpen ? setIsOpen : undefined}>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent className="p-8 pt-4 sm:max-w-4xl">
                <DialogTitle />
                <PricingSection />
            </DialogContent>
        </Dialog>
    )
}

export default PricingModal

"use client";

import { useState, useEffect } from "react";
import { Camera, Plus, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from "@/components/ImageUploader";
import useFetch from "@/hooks/use-fetch";
import { scanPantryImage, saveToPantry, addPantryItemManually, } from "@/actions/pantry.actions";
import { toast } from "sonner";

export default function AddToPantryModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("scan");
  const [selectedImage, setSelectedImage] = useState(null);
  const [scannedIngredients, setScannedIngredients] = useState([]);
  const [manualItem, setManualItem] = useState({ name: "", quantity: "" });

  // Scan image
  const {
    loading: scanning,
    data: scanData,
    fn: scanImage,
  } = useFetch(scanPantryImage);

  // Save scanned items
  const {
    loading: saving,
    data: saveData,
    fn: saveScannedItems,
  } = useFetch(saveToPantry);

  // Add manual item
  const {
    loading: adding,
    data: addData,
    fn: addManualItem,
  } = useFetch(addPantryItemManually);

  // Handle image selection
  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setScannedIngredients([]); // Reset when new image selected
  };

  // Scan image
  const handleScan = async () => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append("image", selectedImage);
    await scanImage(formData);
  };

  // Update scanned ingredients when scan completes
  useEffect(() => {
    if (scanData?.success && scanData?.ingredients) {
      setScannedIngredients(scanData.ingredients);
      toast.success(`Found ${scanData.ingredients.length} ingredients!`);
    }
  }, [scanData]);

  // Handle save scanned items
  const handleSaveScanned = async () => {
    if (scannedIngredients.length === 0) {
      toast.error("No ingredients to save");
      return;
    }

    const formData = new FormData();
    formData.append("ingredients", JSON.stringify(scannedIngredients));
    await saveScannedItems(formData);
  };

  // Reset modal state
  const handleClose = () => {
    setActiveTab("scan");
    setSelectedImage(null);
    setScannedIngredients([]);
    setManualItem({ name: "", quantity: "" });
    onClose();
  };

  // Handle save success
  useEffect(() => {
    if (saveData?.success) {
      toast.success(saveData.message);
      handleClose();
      if (onSuccess) onSuccess();
    }
  }, [saveData]);

  // Handle manual add
  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!manualItem.name.trim() || !manualItem.quantity.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", manualItem.name);
    formData.append("quantity", manualItem.quantity);
    await addManualItem(formData);
  };

  // Handle manual add success
  useEffect(() => {
    if (addData?.success) {
      toast.success("Item added to pantry!");
      setManualItem({ name: "", quantity: "" });
      handleClose();
      if (onSuccess) onSuccess();
    }
  }, [addData]);

  // Remove scanned ingredient
  const removeIngredient = (index) => {
    setScannedIngredients(scannedIngredients.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Add to Pantry
          </DialogTitle>
          <DialogDescription>
            Scan your pantry with AI or add items manually
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan" className="gap-2">
              <Camera className="w-4 h-4" />
              AI Scan
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Manually
            </TabsTrigger>
          </TabsList>

          {/* AI Scan Tab */}
          <TabsContent value="scan" className="space-y-6 mt-6">
            {scannedIngredients.length === 0 ? (
              // Step 1: Upload & Scan
              <div className="space-y-4">
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  loading={scanning}
                />

                {selectedImage && !scanning && (
                  <Button
                    onClick={handleScan}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg"
                    disabled={scanning}
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mr-2" />
                        Scan Image
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              // Step 2: Review & Save
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">
                      Review Detected Items
                    </h3>
                    <p className="text-sm text-stone-600">
                      Found {scannedIngredients.length} ingredients
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScannedIngredients([]);
                      setSelectedImage(null);
                    }}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Again
                  </Button>
                </div>

                {/* Ingredients List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scannedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-stone-900">
                          {ingredient.name}
                        </div>
                        <div className="text-sm text-stone-500">
                          {ingredient.quantity}
                        </div>
                      </div>
                      {ingredient.confidence && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-700 border-green-200"
                        >
                          {Math.round(ingredient.confidence * 100)}%
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeIngredient(index)}
                        className="text-stone-600 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveScanned}
                  disabled={saving || scannedIngredients.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Save {scannedIngredients.length} Items to Pantry
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Manual Add Tab */}
          <TabsContent value="manual" className="mt-6">
            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={manualItem.name}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, name: e.target.value })
                  }
                  placeholder="e.g., Chicken breast"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={adding}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Quantity
                </label>
                <input
                  type="text"
                  value={manualItem.quantity}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, quantity: e.target.value })
                  }
                  placeholder="e.g., 500g, 2 cups, 3 pieces"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={adding}
                />
              </div>

              <Button
                type="submit"
                disabled={adding}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-12 w-full"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
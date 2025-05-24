import { useEffect, useState } from 'react'


import { useNavigate, useParams } from "react-router-dom"
import { Link } from "react-router-dom"

import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Send } from 'lucide-react'
import * as z from "zod"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import Page from '@/app/dashboard/page'
import { useToast } from '@/hooks/use-toast'
import BASE_URL from '@/config/BaseUrl'

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

const brandSchema = z.object({
  fabric_brand_brands: z.string().min(1, "Brand name is required").regex(/^[A-Za-z ]+$/, "Only letters allowed"),
  fabric_brand_status: z.string().min(1, "Status is required"),
  fabric_brand_images: z.any().optional()
})

const EditBrand = () => {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [brand, setBrand] = useState({
    fabric_brand_brands: "",
    fabric_brand_status: "",
    fabric_brand_images: ""
  })

  // Fetch brand data
  const { data: brandData, isLoading } = useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/fetch-brand-by-Id/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch brand')
      return response.json()
    },
    onSuccess: (data) => {
      setBrand(data?.brand)
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch brand data",
      })
    }
  })

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(`${BASE_URL}/api/update-brand/${id}?_method=PUT`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error('Update failed')
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand updated successfully",
      })
      navigate("/brand")
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message.includes("duplicate") ? "Duplicate entry" : "Update failed",
      })
    }
  })

  const onInputChange = (e) => {
    const { name, value } = e.target
    setBrand(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    try {
      const validatedData = brandSchema.parse(brand)
      const formData = new FormData()
      formData.append("fabric_brand_brands", validatedData.fabric_brand_brands)
      if (selectedFile) formData.append("fabric_brand_images", selectedFile)
      formData.append("fabric_brand_status", validatedData.fabric_brand_status)

      updateBrandMutation.mutate(formData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: err.message,
          })
        })
      }
    }
  }

  const imageUrl = brand.fabric_brand_images
    ? `https://houseofonzone.com/admin/storage/app/public/Brands/${brand.fabric_brand_images}`
    : "https://houseofonzone.com/admin/storage/app/public/no_image.jpg"

  return (
    <Page>
   
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-card p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg md:text-xl font-bold">Edit Brand</h3>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Brand Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-52 h-52 rounded-lg border border-border overflow-hidden shadow">
                    <img 
                      src={imageUrl} 
                      alt="Brand" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="image">Brand Image</Label>
                    <Input
                      id="image"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Brand Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                      id="brandName"
                      type="text"
                      name="fabric_brand_brands"
                      value={brand.fabric_brand_brands}
                      onChange={onInputChange}
                      placeholder="Enter brand name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      name="fabric_brand_status"
                      value={brand.fabric_brand_status}
                      onValueChange={(value) => setBrand(prev => ({ ...prev, fabric_brand_status: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={updateBrandMutation.isPending}
                  className="gap-2"
                >
                  {updateBrandMutation.isPending ? "Updating..." : (
                    <>
                      <Send className="h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>

                <Link to="/brand">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}

export default EditBrand
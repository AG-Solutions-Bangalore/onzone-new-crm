


import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Send } from 'lucide-react'
import * as z from 'zod'
import axios from 'axios'

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
import { useToast } from "@/hooks/use-toast"
import BASE_URL from '@/config/BaseUrl'
import Page from '@/app/dashboard/page'
import { ErrorComponent, LoaderComponent } from '@/components/LoaderComponent/LoaderComponent'


const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

const retailerTypeOptions = [
  { value: "Agent", label: "Agent" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Distributor", label: "Distributor" },
  { value: "Retailers", label: "Retailers" },
]

const retailerSchema = z.object({
  customer_name: z.string()
    .min(1, "Retailer name is required")
    .regex(/^[A-Za-z ]+$/, "Only letters and spaces allowed"),
  customer_type: z.string().min(1, "Retailer type is required"),
  customer_mobile: z.string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  customer_email: z.string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  customer_address: z.string().optional(),
  customer_status: z.string().min(1, "Status is required"),
})

const EditRetailer = () => {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  
  const [customer, setCustomer] = useState({
    customer_name: "",
    customer_type: "",
    customer_mobile: "",
    customer_email: "",
    customer_address: "",
    customer_status: ""
  })

 
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/fetch-customer-by-Id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      return response.data
    },
    retry: 1,
  })

  
  useEffect(() => {
    if (data?.customer) {
      setCustomer(data.customer)
    }
  }, [data])

  
  useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch customer details",
      })
    }
  }, [isError, toast])

  
  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      const response = await axios.put(
        `${BASE_URL}/api/update-customer/${id}`,
        customerData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      if (data.code === 200 ) {
        toast({
          title: "Success",
          description: `${data.msg}`,
        })
        navigate("/master/retailer")
      } else {
        throw new Error("Duplicate Entry")
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.msg.includes("Duplicate") 
          ? "Duplicate entry found" 
          : "Failed to update retailer",
      })
    }
  })

  const validateOnlyDigits = (value) => {
    return /^\d*$/.test(value)
  }

  const validateOnlyText = (value) => {
    return value === "" || /^[A-Za-z ]*$/.test(value)
  }

  const onInputChange = (e) => {
    const { name, value } = e.target
    
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }

    if (name === "customer_mobile") {
      if (validateOnlyDigits(value) && value.length <= 10) {
        setCustomer(prev => ({ ...prev, [name]: value }))
      }
    } else if (name === "customer_name") {
      if (validateOnlyText(value)) {
        setCustomer(prev => ({ ...prev, [name]: value }))
      }
    } else {
      setCustomer(prev => ({ ...prev, [name]: value }))
    }
  }

  const onSelectChange = (name, value) => {
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
    setCustomer(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setErrors({})

    try {
      const validatedData = retailerSchema.parse(customer)
      updateCustomerMutation.mutate(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {}
        error.errors.forEach(err => {
          fieldErrors[err.path[0]] = err.message
        })
        setErrors(fieldErrors)
        
       
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        })
      }
    }
  }

   if (isLoading) {
     return <LoaderComponent name="Loading retailer data" />;
   }
 
   if (isError) {
     return (
       <ErrorComponent
         message="Error Fetching retailer Data"
         refetch={refetch}
       />
     );
   }

  return (
    <Page>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm mb-6">
          <h1 className="text-xl font-bold">Edit Retailer</h1>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Retailer Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Retailer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-sm font-medium">
                    Retailer Name *
                  </Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    value={customer.customer_name}
                    onChange={onInputChange}
                    placeholder="Enter retailer name"
                    className={errors.customer_name ? "border-destructive" : ""}
                  />
                  {errors.customer_name && (
                    <p className="text-xs text-destructive">{errors.customer_name}</p>
                  )}
                </div>

                {/* Retailer Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Type *</Label>
                  <Select
                    value={customer.customer_type}
                    onValueChange={(value) => onSelectChange('customer_type', value)}
                  >
                    <SelectTrigger className={errors.customer_type ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {retailerTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customer_type && (
                    <p className="text-xs text-destructive">{errors.customer_type}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="customer_mobile" className="text-sm font-medium">
                    Mobile Number
                  </Label>
                  <Input
                    id="customer_mobile"
                    name="customer_mobile"
                    value={customer.customer_mobile}
                    onChange={onInputChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className={errors.customer_mobile ? "border-destructive" : ""}
                  />
                  {errors.customer_mobile && (
                    <p className="text-xs text-destructive">{errors.customer_mobile}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="customer_email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    value={customer.customer_email}
                    onChange={onInputChange}
                    placeholder="Enter email address"
                    className={errors.customer_email ? "border-destructive" : ""}
                  />
                  {errors.customer_email && (
                    <p className="text-xs text-destructive">{errors.customer_email}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="customer_address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Input
                    id="customer_address"
                    name="customer_address"
                    value={customer.customer_address}
                    onChange={onInputChange}
                    placeholder="Enter address"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status *</Label>
                  <Select
                    value={customer.customer_status}
                    onValueChange={(value) => onSelectChange('customer_status', value)}
                  >
                    <SelectTrigger className={errors.customer_status ? "border-destructive" : ""}>
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
                  {errors.customer_status && (
                    <p className="text-xs text-destructive">{errors.customer_status}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={updateCustomerMutation.isPending}
                  className="min-w-[120px] gap-2"
                >
                  {updateCustomerMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>

                <Link to="/master/retailer">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="min-w-[120px] gap-2"
                  >
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

export default EditRetailer
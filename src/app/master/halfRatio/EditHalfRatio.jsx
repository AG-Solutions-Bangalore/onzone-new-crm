import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Send } from 'lucide-react'
import * as z from 'zod'
import axios from 'axios'
import { Link } from 'react-router-dom'

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
import BASE_URL from '@/config/BaseUrl'
import Page from '@/app/dashboard/page'
import { useToast } from '@/hooks/use-toast'
import { ErrorComponent, LoaderComponent } from '@/components/LoaderComponent/LoaderComponent'

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

const ratioGroupOptions = [
  { value: "a", label: "a" },
  { value: "ab", label: "ab" },
  { value: "abc", label: "abc" },
]

const ratioSchema = z.object({
  ratio_range: z.string().min(1, "Ratio range is required"),
  ratio_group: z.string().min(1, "Ratio group is required"),
  ratio_status: z.string().min(1, "Status is required"),
  ratio_type38: z.string().min(1, "Ratio 38 is required"),
  ratio_type40: z.string().min(1, "Ratio 40 is required"),
  ratio_type42: z.string().min(1, "Ratio 42 is required"),
  ratio_type44: z.string().min(1, "Ratio 44 is required"),
  ratio_type46: z.string().min(1, "Ratio 46 is required"),
  ratio_type48: z.string().min(1, "Ratio 48 is required"),
  ratio_type50: z.string().min(1, "Ratio 50 is required"),
})

const EditHalfRatio = () => {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [ratioValues, setRatioValues] = useState({
    ratio_range: "",
    ratio_group: "",
    ratio_status: "",
    ratio_type38: "",
    ratio_type40: "",
    ratio_type42: "",
    ratio_type44: "",
    ratio_type46: "",
    ratio_type48: "",
    ratio_type50: "",
  })

  // Fetch ratio data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['half-ratio', id],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/fetch-half-ratio-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      return response.data
    },
  })

  // Use useEffect to populate the form when data is loaded
  useEffect(() => {
    if (data?.ratioHalf) {
      const ratioData = data.ratioHalf
      const ratioTypes = ratioData.ratio_type.split(",")
      
      setRatioValues({
        ratio_range: ratioData.ratio_range,
        ratio_group: ratioData.ratio_group,
        ratio_status: ratioData.ratio_status,
        ratio_type38: ratioTypes[0] || "",
        ratio_type40: ratioTypes[1] || "",
        ratio_type42: ratioTypes[2] || "",
        ratio_type44: ratioTypes[3] || "",
        ratio_type46: ratioTypes[4] || "",
        ratio_type48: ratioTypes[5] || "",
        ratio_type50: ratioTypes[6] || "",
      })
    }
  }, [data])

  // Handle errors with useEffect
  useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch ratio data",
      })
    }
  }, [isError, toast])

  // Update ratio mutation
  const updateRatioMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios({
        url: `${BASE_URL}/api/update-half-ratio/${id}?_method=PUT`,
        method: "POST",
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        toast({
          title: "Success",
          description: `${data.msg}`,
        })
        navigate("/master/half-ratio")
      } else {
        throw new Error(data.msg || "Update failed")
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message.includes("duplicate") 
          ? "Duplicate entry" 
          : "Update failed",
      })
    }
  })

  const onInputChange = (e) => {
    const { name, value } = e.target
    setRatioValues(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    try {
      const validatedData = ratioSchema.parse(ratioValues)
      updateRatioMutation.mutate(validatedData)
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

  if (isLoading) {
    return <LoaderComponent name="Edit half ratio Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching half ratio Data"
        refetch={refetch}
      />
    );
  }

  return (
    <Page>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-card p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg md:text-xl font-bold">Edit Half Ratio</h3>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ratio Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ratio Range */}
                <div className="space-y-2">
                  <Label htmlFor="ratio_range">Ratio Range *</Label>
                  <Input
                    id="ratio_range"
                    name="ratio_range"
                    value={ratioValues.ratio_range}
                    onChange={onInputChange}
                    placeholder="Enter ratio range"
                  />
                </div>

                {/* Ratio Group */}
                <div className="space-y-2">
                  <Label htmlFor="ratio_group">Ratio Group *</Label>
                  <Select
                    name="ratio_group"
                    value={ratioValues.ratio_group}
                    onValueChange={(value) => 
                      setRatioValues(prev => ({ ...prev, ratio_group: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratioGroupOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="ratio_status">Status *</Label>
                  <Select
                    name="ratio_status"
                    value={ratioValues.ratio_status}
                    onValueChange={(value) => 
                      setRatioValues(prev => ({ ...prev, ratio_status: value }))
                    }
                  >
                    <SelectTrigger>
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

                {/* Ratio Values */}
                <div className="space-y-2">
                  <Label htmlFor="ratio_type38">Half 38 *</Label>
                  <Input
                    id="ratio_type38"
                    name="ratio_type38"
                    value={ratioValues.ratio_type38}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 38"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type40">Half 40 *</Label>
                  <Input
                    id="ratio_type40"
                    name="ratio_type40"
                    value={ratioValues.ratio_type40}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type42">Half 42 *</Label>
                  <Input
                    id="ratio_type42"
                    name="ratio_type42"
                    value={ratioValues.ratio_type42}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 42"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type44">Half 44 *</Label>
                  <Input
                    id="ratio_type44"
                    name="ratio_type44"
                    value={ratioValues.ratio_type44}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 44"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type46">Half 46 *</Label>
                  <Input
                    id="ratio_type46"
                    name="ratio_type46"
                    value={ratioValues.ratio_type46}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 46"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type48">Half 48 *</Label>
                  <Input
                    id="ratio_type48"
                    name="ratio_type48"
                    value={ratioValues.ratio_type48}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 48"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratio_type50">Half 50 *</Label>
                  <Input
                    id="ratio_type50"
                    name="ratio_type50"
                    value={ratioValues.ratio_type50}
                    onChange={onInputChange}
                    placeholder="Enter ratio for 50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={updateRatioMutation.isPending}
                  className="gap-2"
                >
                  {updateRatioMutation.isPending ? "Updating..." : (
                    <>
                      <Send className="h-4 w-4" />
                      Update
                    </>
                  )}
                </Button>

                <Link to="/half-ratio">
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

export default EditHalfRatio
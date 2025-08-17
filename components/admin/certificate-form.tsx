"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createCertificateAction } from "@/app/actions/certificates"

const certificateTypes = [
  "Barangay Clearance",
  "Certificate of Residency",
  "Certificate of Indigency",
  "Certificate of Good Moral Character",
  "Certificate of Employment",
  "Certificate of No Pending Case",
  "Certificate of Live Birth",
  "Certificate of Death",
  "Other"
]

interface CertificateFormData {
  type: string
  requestedBy: string
  purpose: string
  estimatedCompletion: string
  notes: string
}

export function CertificateForm() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CertificateFormData>({
    type: "",
    requestedBy: "",
    purpose: "",
    estimatedCompletion: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.requestedBy || !formData.purpose) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const result = await createCertificateAction({
        type: formData.type,
        requestedBy: formData.requestedBy,
        purpose: formData.purpose,
        estimatedCompletion: formData.estimatedCompletion || undefined,
        notes: formData.notes || undefined,
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Certificate request created successfully",
        })
        
        // Reset form and close dialog
        setFormData({
          type: "",
          requestedBy: "",
          purpose: "",
          estimatedCompletion: "",
          notes: ""
        })
        setOpen(false)
        
        // Trigger a page refresh or callback to update the list
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create certificate request",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create certificate request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CertificateFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Certificate Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Certificate Request</DialogTitle>
          <DialogDescription>
            Add a new certificate request for a resident. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Certificate Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                placeholder="Full name"
                value={formData.requestedBy}
                onChange={(e) => handleInputChange("requestedBy", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Input
              id="purpose"
              placeholder="e.g., Job application, Voter's registration"
              value={formData.purpose}
              onChange={(e) => handleInputChange("purpose", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
            <Input
              id="estimatedCompletion"
              type="date"
              value={formData.estimatedCompletion}
              onChange={(e) => handleInputChange("estimatedCompletion", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information or special requirements..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

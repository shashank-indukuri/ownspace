import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Heart, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WeddingInfo {
  id: number;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  venueAddress: string | null;
  description: string | null;
}

export default function RSVPPage() {
  const { rsvpCode } = useParams<{ rsvpCode: string }>();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    attendance: "",
    guestCount: "1",
    dietaryRestrictions: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const { data: wedding, isLoading } = useQuery<WeddingInfo>({
    queryKey: [`/api/rsvp/${rsvpCode}`],
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      // For demo purposes, since we don't have individual guest lookup,
      // we'll create a simplified RSVP submission
      const response = await fetch(`/api/rsvp/${rsvpCode}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit RSVP');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.attendance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      ...formData,
      guestCount: parseInt(formData.guestCount),
      rsvpStatus: formData.attendance === "yes" ? "confirmed" : "declined",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-80 h-96 bg-white/60 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-playfair font-bold text-gray-800 mb-2">
              Wedding Not Found
            </h1>
            <p className="text-gray-600">
              The wedding invitation you're looking for could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weddingDate = new Date(wedding.weddingDate);
  const formattedDate = weddingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = weddingDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-blush-200 shadow-xl">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-playfair font-bold text-gray-800 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600 mb-4">
              Your RSVP has been submitted successfully. We appreciate your response!
            </p>
            <div className="bg-blush-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>{wedding.brideName} & {wedding.groomName}</strong>
                <br />
                {formattedDate}
                <br />
                {wedding.venue}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-blush-200 shadow-xl">
        <CardContent className="p-6">
          {/* Wedding Header Image */}
          <img 
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
            alt="Wedding venue" 
            className="w-full h-32 object-cover rounded-lg mb-4" 
          />
          
          {/* Wedding Details */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-playfair font-bold text-gray-800 mb-1">
              {wedding.brideName} & {wedding.groomName}
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{wedding.venue}</span>
            </div>
            {wedding.venueAddress && (
              <p className="text-xs text-gray-500 mt-1">{wedding.venueAddress}</p>
            )}
          </div>

          {/* RSVP Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 border-blush-200 focus:border-gold-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 border-blush-200 focus:border-gold-400"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 border-blush-200 focus:border-gold-400"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 border-blush-200 focus:border-gold-400"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Will you be attending? *
              </Label>
              <RadioGroup 
                value={formData.attendance} 
                onValueChange={(value) => setFormData({ ...formData, attendance: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes" className="text-sm text-gray-700">
                    Yes, I'll be there!
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no" className="text-sm text-gray-700">
                    Sorry, can't make it
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.attendance === "yes" && (
              <>
                <div>
                  <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700">
                    Number of Guests
                  </Label>
                  <Select value={formData.guestCount} onValueChange={(value) => setFormData({ ...formData, guestCount: value })}>
                    <SelectTrigger className="mt-1 border-blush-200 focus:border-gold-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Just me (1)</SelectItem>
                      <SelectItem value="2">2 people</SelectItem>
                      <SelectItem value="3">3 people</SelectItem>
                      <SelectItem value="4">4 people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dietary" className="text-sm font-medium text-gray-700">
                    Dietary Restrictions
                  </Label>
                  <Textarea
                    id="dietary"
                    placeholder="Any dietary requirements or allergies..."
                    value={formData.dietaryRestrictions}
                    onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    className="mt-1 border-blush-200 focus:border-gold-400 resize-none h-20"
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full gold-gradient text-white py-3 font-medium hover:shadow-lg transition-all duration-200"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit RSVP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

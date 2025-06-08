import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { StatsOverview } from "@/components/stats-overview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import type { Wedding } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWeddingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const createWeddingFormSchema = insertWeddingSchema.extend({
  weddingDate: z.string().min(1, "Wedding date is required"),
});

type CreateWeddingForm = z.infer<typeof createWeddingFormSchema>;

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-gold-500">{timeLeft.days}</div>
        <div className="text-xs text-gray-500">Days</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gold-500">{timeLeft.hours}</div>
        <div className="text-xs text-gray-500">Hours</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gold-500">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-500">Minutes</div>
      </div>
    </div>
  );
}

function CreateWeddingDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateWeddingForm>({
    resolver: zodResolver(createWeddingFormSchema),
    defaultValues: {
      brideName: "",
      groomName: "",
      weddingDate: "",
      venue: "",
      venueAddress: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateWeddingForm) => {
      console.log("Form data:", data);
      const weddingData = {
        ...data,
        weddingDate: data.weddingDate,
      };
      console.log("Sending wedding data:", weddingData);
      const result = await apiRequest("POST", "/api/weddings", weddingData);
      console.log("API response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weddings"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Wedding Created",
        description: "Your wedding event has been created successfully!",
      });
    },
    onError: (error) => {
      console.error("Wedding creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create wedding: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateWeddingForm) => {
    console.log("Form validation passed, submitting:", data);
    console.log("Form errors:", form.formState.errors);
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gold-gradient text-white hover:shadow-lg transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Create Wedding
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair">Create New Wedding</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brideName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bride's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sarah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groomName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groom's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Michael" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="weddingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wedding Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="Rosewood Manor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="venueAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Wedding Lane, California" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A beautiful celebration of love..." 
                      value={field.value || ""} 
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gold-gradient text-white"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Wedding"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const { data: weddings, isLoading } = useQuery<Wedding[]>({
    queryKey: ["/api/weddings"],
  });

  const currentWedding = weddings?.[0]; // Show the first/most recent wedding

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-white/60 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/60 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWedding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100">
        <NavigationHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 card-shadow border border-blush-200/50">
            <Calendar className="w-16 h-16 text-gold-400 mx-auto mb-6" />
            <h2 className="text-3xl font-playfair font-semibold text-gray-800 mb-4">
              Welcome to Own Space
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first wedding event to start managing guests, sending invitations, and tracking RSVPs.
            </p>
            <CreateWeddingDialog />
          </div>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(currentWedding.weddingDate);
  const formattedDate = weddingDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100">
      <NavigationHeader />

      {/* Hero Dashboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 card-shadow border border-blush-200/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-playfair font-semibold text-gray-800">
                  {currentWedding.brideName} & {currentWedding.groomName}'s Wedding
                </h2>
                <Badge className="bg-gold-400 text-white">Active</Badge>
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentWedding.venue}</span>
                </div>
              </div>

              <div className="mb-6">
                <CountdownTimer targetDate={currentWedding.weddingDate.toString()} />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/guests/${currentWedding.id}`}>
                  <Button className="gold-gradient text-white hover:shadow-lg transition-all duration-200">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Guests
                  </Button>
                </Link>
                <Button variant="secondary" className="bg-blush-200 text-gray-700 hover:bg-blush-300">
                  Send Invitations
                </Button>
              </div>
            </div>

            <div className="w-full lg:w-80 h-48 lg:h-64">
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Wedding couple" 
                className="w-full h-full object-cover rounded-xl shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      {currentWedding && <StatsOverview weddingId={currentWedding.id} />}

      {/* Recent Activity & Quick Actions */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
              <CardHeader>
                <CardTitle className="font-playfair">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">Wedding event created successfully</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">More activity will appear here as you manage your wedding</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
              <CardHeader>
                <CardTitle className="font-playfair">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/guests/${currentWedding.id}`}>
                  <Button className="w-full gold-gradient text-white hover:shadow-lg transition-all duration-200">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Guests
                  </Button>
                </Link>
                <Button className="w-full bg-blush-200 text-gray-700 hover:bg-blush-300 transition-colors">
                  Send Invitations
                </Button>
                <Button className="w-full bg-white border border-blush-200 text-gray-700 hover:bg-blush-50 transition-colors">
                  Export Guest List
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
              <CardHeader>
                <CardTitle className="font-playfair">RSVP Link</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Share this link with your guests:</p>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={`${window.location.origin}/rsvp/${currentWedding.rsvpCode}`}
                    readOnly
                    className="flex-1 bg-blush-50 border-blush-200 text-sm"
                  />
                  <Button 
                    size="sm"
                    className="bg-gold-400 text-white hover:bg-gold-500"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/rsvp/${currentWedding.rsvpCode}`);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

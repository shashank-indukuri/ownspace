import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { GuestList } from "@/components/guest-list";
import { UploadCSVDialog } from "@/components/upload-csv-dialog";
import { AddGuestDialog } from "@/components/add-guest-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Upload, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { Wedding, Guest, GuestCategory } from "@shared/schema";

export default function Guests() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: wedding } = useQuery<Wedding>({
    queryKey: [`/api/weddings/${weddingId}`],
  });

  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: [`/api/weddings/${weddingId}/guests`],
  });

  const { data: categories = [] } = useQuery<GuestCategory[]>({
    queryKey: [`/api/weddings/${weddingId}/categories`],
  });

  // Filter guests based on search query and category
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = searchQuery === "" || 
      `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery);
    
    const matchesCategory = selectedCategory === "all" || 
      guest.categoryId?.toString() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading wedding details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gold-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-playfair font-semibold text-gray-800 mb-2">
            Guest Management
          </h1>
          <p className="text-gray-600">
            {wedding.brideName} & {wedding.groomName}'s Wedding
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="font-playfair">Guest List</CardTitle>
                  <div className="flex gap-3">
                    <UploadCSVDialog weddingId={parseInt(weddingId!)} />
                    <AddGuestDialog weddingId={parseInt(weddingId!)} />
                  </div>
                </div>
                
                {/* Search and Filter */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search guests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/50 border-blush-200 focus:bg-white focus:border-gold-400"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48 bg-white/50 border-blush-200 focus:bg-white focus:border-gold-400">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <GuestList 
                  guests={filteredGuests} 
                  categories={categories}
                  isLoading={guestsLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
              <CardHeader>
                <CardTitle className="font-playfair">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Guests</span>
                  <span className="font-semibold text-lg">{guests.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confirmed</span>
                  <span className="font-semibold text-lg text-green-600">
                    {guests.filter(g => g.rsvpStatus === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-lg text-amber-600">
                    {guests.filter(g => g.rsvpStatus === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Declined</span>
                  <span className="font-semibold text-lg text-red-600">
                    {guests.filter(g => g.rsvpStatus === 'declined').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
              <CardHeader>
                <CardTitle className="font-playfair">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gold-gradient text-white hover:shadow-lg transition-all duration-200">
                  Send Bulk Invitations
                </Button>
                <Button className="w-full bg-blush-200 text-gray-700 hover:bg-blush-300 transition-colors">
                  Send Reminders
                </Button>
                <Button className="w-full bg-white border border-blush-200 text-gray-700 hover:bg-blush-50 transition-colors">
                  Export Guest List
                </Button>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="bg-white/60 backdrop-blur-sm card-shadow border border-blush-200/50">
              <CardHeader>
                <CardTitle className="font-playfair">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => {
                  const categoryGuestCount = guests.filter(g => g.categoryId === category.id).length;
                  return (
                    <div key={category.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">{categoryGuestCount}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

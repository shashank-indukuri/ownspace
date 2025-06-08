import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Mail, Phone, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Guest, GuestCategory } from "@shared/schema";

interface GuestListProps {
  guests: Guest[];
  categories: GuestCategory[];
  isLoading: boolean;
}

function GuestRow({ guest, categories }: { guest: Guest; categories: GuestCategory[] }) {
  const { toast } = useToast();
  
  const category = categories.find(c => c.id === guest.categoryId);
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/guests/${guest.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/${guest.weddingId}/guests`] });
      toast({
        title: "Guest Deleted",
        description: "Guest has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRSVPMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest("PATCH", `/api/guests/${guest.id}`, { rsvpStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/${guest.weddingId}/guests`] });
      toast({
        title: "RSVP Updated",
        description: "Guest RSVP status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP status.",
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="p-4 hover:bg-blush-50/50 transition-colors border-b border-blush-200/50 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
            <span className="text-gold-600 font-medium text-sm">
              {getInitials(guest.firstName, guest.lastName)}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">
              {guest.firstName} {guest.lastName}
            </h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{guest.phone}</span>
              </div>
              {guest.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{guest.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {category && (
            <Badge 
              className="text-xs font-medium"
              style={{ 
                backgroundColor: `${category.color}20`,
                color: category.color,
                border: `1px solid ${category.color}40`
              }}
            >
              {category.name}
            </Badge>
          )}
          
          <Badge className={`text-xs font-medium ${getStatusColor(guest.rsvpStatus)}`}>
            {guest.rsvpStatus === 'confirmed' ? 'Confirmed' : 
             guest.rsvpStatus === 'declined' ? 'Declined' : 'Pending'}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateRSVPMutation.mutate('confirmed')}>
                Mark as Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateRSVPMutation.mutate('declined')}>
                Mark as Declined
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateRSVPMutation.mutate('pending')}>
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => deleteMutation.mutate()}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Guest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function GuestList({ guests, categories, isLoading }: GuestListProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-blush-200/50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blush-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blush-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No guests found</h3>
        <p className="text-gray-600 text-sm">
          Add guests manually or upload a CSV file to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-blush-200/50">
      {guests.map((guest) => (
        <GuestRow key={guest.id} guest={guest} categories={categories} />
      ))}
      
      {guests.length > 0 && (
        <div className="p-4 border-t border-blush-200/50 bg-blush-50/30">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {guests.length} guest{guests.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}

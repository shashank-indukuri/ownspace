import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Mail, Clock, Shield, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-50 to-ivory-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blush-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gold-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OS</span>
              </div>
              <h1 className="text-xl font-playfair font-semibold text-gray-800">Own Space</h1>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="gold-gradient text-white hover:shadow-lg transition-all duration-200"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Heart className="w-16 h-16 text-gold-400 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-gray-800 mb-6">
              Your Wedding,
              <br />
              <span className="text-gold-500">Beautifully Organized</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your wedding guest management and communications with our elegant, 
              comprehensive digital platform designed for modern couples.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="gold-gradient text-white px-8 py-4 text-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Start Planning Your Wedding
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-4">
              Everything You Need for Your Special Day
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From guest management to real-time RSVPs, we've got every detail covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-shadow border-blush-200/50 bg-white/60 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <CardTitle className="font-playfair">Guest Management</CardTitle>
                <CardDescription>
                  Upload, organize, and categorize your guest list with AI-powered automation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-shadow border-blush-200/50 bg-white/60 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Mail className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <CardTitle className="font-playfair">Digital Invitations</CardTitle>
                <CardDescription>
                  Send beautiful invitations via email, SMS, and WhatsApp with one click
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-shadow border-blush-200/50 bg-white/60 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Clock className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <CardTitle className="font-playfair">Real-time RSVP</CardTitle>
                <CardDescription>
                  Track responses instantly with live updates and comprehensive analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-shadow border-blush-200/50 bg-white/60 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Shield className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <CardTitle className="font-playfair">Secure & Private</CardTitle>
                <CardDescription>
                  Your guest data is encrypted and protected with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-shadow border-blush-200/50 bg-white/60 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Sparkles className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <CardTitle className="font-playfair">Mobile Optimized</CardTitle>
                <CardDescription>
                  Perfect experience on any device, from desktop to smartphone
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-shadow border-blush-200/50 bg-white/60 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Heart className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <CardTitle className="font-playfair">Elegant Design</CardTitle>
                <CardDescription>
                  Beautiful, romantic interface that matches the magic of your special day
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-6">
            Ready to Create Your Perfect Wedding Experience?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of couples who trust Own Space to manage their special day
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="gold-gradient text-white px-8 py-4 text-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-blush-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gold-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OS</span>
              </div>
              <span className="text-lg font-playfair font-semibold text-gray-800">Own Space</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 Own Space. Making weddings beautiful, one celebration at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

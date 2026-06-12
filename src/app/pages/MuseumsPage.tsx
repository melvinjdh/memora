import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { museums } from '../data/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const MuseumsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMuseums = museums.filter(museum =>
    museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    museum.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Explore Museums</h1>
          <p className="text-muted-foreground mb-6">
            Discover 16 museums showcasing Surabaya's rich cultural heritage
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search museums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Museums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMuseums.map((museum) => (
            <Card 
              key={museum.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate(`/museums/${museum.slug}`)}
            >
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src={museum.heroImage}
                  alt={museum.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">
                    {museum.tickets[0].price === 0 
                      ? 'Free Entry' 
                      : `From Rp ${museum.tickets[0].price.toLocaleString('id-ID')}`}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{museum.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {museum.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{museum.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span>{museum.operatingHours[0].hours}</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => navigate(`/museums/${museum.slug}`)}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMuseums.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No museums found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

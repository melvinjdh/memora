import React from 'react';
import { useNavigate } from 'react-router';
import { Landmark, ShoppingBag, Users, Ticket, ArrowRight, MapPin, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { museums, products } from '../data/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Ticket,
      title: 'Tiket Digital',
      description: 'Pesan tiket museum secara online dan masuk lebih praktis dengan QR Code'
    },
    {
      icon: Users,
      title: 'Pemandu Wisata',
      description: 'Pesan pemandu wisata berpengalaman untuk pengalaman kunjungan yang lebih bermakna'
    },
    {
      icon: ShoppingBag,
      title: 'Toko Museum',
      description: 'Jelajahi dan beli merchandise khas dari museum-museum di Surabaya'
    },
    {
      icon: Landmark,
      title: `${museums.length} Museum`,
      description: 'Temukan kekayaan sejarah dan budaya Surabaya dalam satu platform digital'
    }
  ];

  const featuredMuseums = museums.slice(0, 3);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Jelajahi Warisan Budaya Surabaya
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Selamat Datang di Memora
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Memora adalah platform digital terintegrasi untuk wisata museum di Surabaya.
              Jelajahi 16 museum, pesan tiket, gunakan jasa pemandu wisata, dan temukan
              merchandise dalam satu tempat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/museums')} className="text-lg">
                Jelajahi Museum
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/tour-guides')}>
                Pesan Pemandu
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Mengapa Memora?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami menghadirkan pengalaman kunjungan museum yang lebih praktis, modern, dan terintegrasi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-2 hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Museums */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Jelajahi Museum</h2>
              <p className="text-muted-foreground">Melihat kekayaan sejarah dan budaya Surabaya</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/museums')}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMuseums.map((museum) => (
              <Card
                key={museum.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => navigate(`/museums/${museum.slug}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={museum.heroImage}
                    alt={museum.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      {museum.tickets[0].price === 0
                        ? 'Gratis'
                        : `Mulai Rp ${museum.tickets[0].price.toLocaleString('id-ID')}`}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{museum.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {museum.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{museum.location.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{museum.operatingHours[0].hours.split('-')[0].trim()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Merchandise Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Merchandise Museum</h2>
              <p className="text-muted-foreground">Suvenir khas dan produk budaya autentik</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/merchandise')}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/merchandise')}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h4>
                  <p className="font-bold text-primary">Rp {product.price.toLocaleString('id-ID')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Menjelajah?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Bergabunglah dalam pengalaman menjelajahi warisan budaya Surabaya bersama Memora
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/museums')}
            >
              Lihat Museum
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => navigate('/register')}
            >
              Buat Akun
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

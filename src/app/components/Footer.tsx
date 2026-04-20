import React from 'react';
import { Link } from 'react-router';
import { Landmark, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { toast } from 'sonner';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const handlePlaceholderClick = (label: string) => {
    toast.info(`${label} akan segera tersedia`);
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Landmark className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-primary">Memora</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your gateway to Surabaya's cultural heritage. Discover, explore, and experience the city's museums like never before.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => handlePlaceholderClick('Facebook')}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => handlePlaceholderClick('Instagram')}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => handlePlaceholderClick('Twitter')}
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/museums" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse Museums
                </Link>
              </li>
              <li>
                <Link to="/merchandise" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shop Merchandise
                </Link>
              </li>
              <li>
                <Link to="/tour-guides" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Book Tour Guide
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => handlePlaceholderClick('Help Center')}
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => handlePlaceholderClick('Terms of Service')}
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => handlePlaceholderClick('Privacy Policy')}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => handlePlaceholderClick('Refund Policy')}
                >
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Jl. Taman Sampoerna No.6, Surabaya</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@memora.id" className="hover:text-primary transition-colors">
                  info@memora.id
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+62318001234" className="hover:text-primary transition-colors">
                  +62 31 800-1234
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Memora. All rights reserved. Built with care for Surabaya's cultural heritage.</p>
        </div>
      </div>
    </footer>
  );
};

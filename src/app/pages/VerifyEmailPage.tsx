import React from 'react';
import { Link, useLocation } from 'react-router';
import { MailCheck, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email');

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md border-[#b59a5b]/20 bg-[#0d2b23] text-[#f0ebe3]">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b59a5b]/10">
              <MailCheck className="h-8 w-8 text-[#b59a5b]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Cek Email Anda</CardTitle>
          <CardDescription className="text-[#a09a90] mt-2">
            Kami telah mengirimkan tautan verifikasi ke email Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {email && (
            <div className="rounded-xl border border-[#b59a5b]/15 bg-[#0a1f1a]/50 p-4 text-center">
              <p className="text-sm font-medium text-[#c8c2b8]">{email}</p>
            </div>
          )}
          
          <div className="text-center text-sm text-[#a09a90]">
            <p>
              Silakan klik tautan di dalam email tersebut untuk mengaktifkan akun Anda sebelum masuk ke aplikasi Memora.
            </p>
            <p className="mt-4 text-xs opacity-75">
              Tidak menerima email? Coba periksa folder Spam atau Promotions.
            </p>
          </div>

          <div className="pt-4 text-center">
            <Button asChild className="w-full bg-[#b59a5b] text-[#0a1f1a] hover:bg-[#c9ad6e]">
              <Link to="/login" className="flex items-center justify-center gap-2">
                Ke Halaman Login <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

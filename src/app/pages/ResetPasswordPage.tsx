import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Landmark, MailCheck, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PasswordField } from '../components/PasswordField';

type Mode = 'request' | 'reset';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const [mode, setMode] = useState<Mode>('request');
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();

      if (!active) return;

      if (data.session) {
        setMode('reset');
        setIsChecking(false);
        return;
      }

      const code = searchParams.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!active) return;

        if (error) {
          toast.error('Reset link tidak valid atau sudah kedaluwarsa.');
          setMode('request');
        } else {
          setMode('reset');
        }
      } else {
        setMode('request');
      }

      setIsChecking(false);
    };

    init();

    return () => {
      active = false;
    };
  }, [searchParams]);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Masukkan email terlebih dahulu.');
      return;
    }

    setIsSendingLink(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Link reset password sudah dikirim ke email kamu.');
    } catch (error: any) {
      toast.error(error?.message || 'Gagal mengirim link reset password.');
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak sama.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      await supabase.auth.signOut();
      toast.success('Password berhasil diperbarui. Silakan login lagi.');
      navigate(`/login?reset=success${email ? `&email=${encodeURIComponent(email)}` : ''}`);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal memperbarui password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Landmark className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {mode === 'reset' ? 'Buat Password Baru' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {mode === 'reset'
              ? 'Masukkan password baru untuk akun Memora kamu.'
              : 'Kami akan mengirim link reset password ke email kamu.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isChecking ? (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Memeriksa status reset password...
            </div>
          ) : mode === 'reset' ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Password baru akan menggantikan password lama untuk akun ini.</p>
                </div>
              </div>
              <PasswordField
                id="new-password"
                label="Password Baru"
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <PasswordField
                id="confirm-password"
                label="Konfirmasi Password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Button type="submit" className="w-full" disabled={isSavingPassword}>
                {isSavingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSendingLink}>
                {isSendingLink ? 'Mengirim...' : 'Kirim Link Reset'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Kembali ke login
              </Link>
            </p>
          </div>

          {mode === 'request' && (
            <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Setelah link diterima, buka tautan tersebut untuk membuat password baru.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

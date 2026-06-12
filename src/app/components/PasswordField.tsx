import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from './ui/utils';

type PasswordFieldProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  label: string;
};

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  id,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          className={cn('pr-11', className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
          onClick={() => setIsVisible((value) => !value)}
          aria-label={isVisible ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

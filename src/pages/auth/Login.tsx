import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or Institutional ID is required').email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'director@qodex.edu.pk',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}`);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'FOCAL_PERSON') {
        navigate('/focal-person/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch {
      toast.error('Invalid credentials. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Institutional Crest Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-white shadow-xl shadow-navy/20 border-2 border-teal">
          <GraduationCap className="h-9 w-9 text-teal-300" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">
          Internship Management Portal
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Directorate of Industrial Liaison & Career Services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-navy/5 rounded-2xl border border-border sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <Input
              label="Institutional Email / ID"
              type="email"
              placeholder="e.g. director@qodex.edu.pk"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password <span className="text-danger ml-0.5">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`block w-full rounded-lg border text-sm text-text-primary placeholder:text-slate-400 transition-colors pl-9 pr-10 py-2 ${
                    errors.password
                      ? 'border-danger focus:border-danger'
                      : 'border-border focus:border-teal'
                  } focus:outline-none focus:ring-2 focus:ring-teal/30 bg-white`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-teal focus:ring-teal"
                  {...register('rememberMe')}
                />
                <span className="ml-2">Remember credentials</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info('For credential reset, please contact Department Focal Person or System Administrator.')
                }
                className="font-medium text-teal hover:text-teal-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-navy hover:bg-navy-800"
              isLoading={isSubmitting}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant Demo Access
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Auto-fill
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('director@qodex.edu.pk')}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-teal hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-navy group-hover:text-teal" />
                  <div>
                    <p className="font-semibold text-navy">Director / Admin</p>
                    <p className="text-[10px] text-text-secondary">director@qodex.edu.pk</p>
                  </div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal" />
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('focal.cs@qodex.edu.pk')}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-teal hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal group-hover:text-teal" />
                  <div>
                    <p className="font-semibold text-navy">Focal Person (CS)</p>
                    <p className="text-[10px] text-text-secondary">focal.cs@qodex.edu.pk</p>
                  </div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal" />
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('hamza.cs@student.qodex.edu.pk')}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-teal hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600 group-hover:text-teal" />
                  <div>
                    <p className="font-semibold text-navy">Student (Hamza Farooq)</p>
                    <p className="text-[10px] text-text-secondary">2021-CS-104</p>
                  </div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal" />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-text-secondary">
          Official University Industrial Liaison Platform • Developed by <strong className="text-navy">Qodex Software</strong>
        </p>
      </div>
    </div>
  );
};

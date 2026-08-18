import { useState } from 'react';
import { useMeStore } from '@/contexts/useMeStore';
import { AuthLogo } from '@/features/auth/components/AuthLogo';
import { AUTH } from '@/features/auth/constants/auth.constants';
import { AUTH_ROUTES } from '@/features/auth/constants/routes.constants';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { getAfterLoginRedirect } from '@/features/auth/utils/getAfterLoginRedirect';
import { useGetMe } from '@/features/user/hooks/useGetMe';
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircleIcon,
  LogIn,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { form, submit, loading } = useLoginForm();
  const { refetch: fetchMe } = useGetMe();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accountDisabled = searchParams.get('reason') === 'account_disabled';
  async function onSubmit() {
    try {
      setError(null);

      const res = await submit();
      if (!res) return;
      await fetchMe();

      const redirectTo = getAfterLoginRedirect(useMeStore.getState());
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : AUTH.ERRORS.SERVER);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block w-full space-y-5"
      >
        {/* Header */}
        <div className="text-center space-y-1 pb-3">
          <AuthLogo />

          <h1 className="text-2xl font-semibold tracking-tight">
            {AUTH.UI.TITLE}
          </h1>

          <p className="text-sm text-muted-foreground">{AUTH.UI.SUBTITLE}</p>
        </div>

        {/* Account disabled banner */}
        {accountDisabled && (
          <Alert variant="warning" appearance="light">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{AUTH.UI.BANNERS.ACCOUNT_DISABLED}</AlertTitle>
          </Alert>
        )}

        {/* Error alert */}
        {error && (
          <Alert
            variant="destructive"
            appearance="light"
            onClose={() => setError(null)}
          >
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{AUTH.UI.LABELS.EMAIL}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={AUTH.UI.PLACEHOLDERS.EMAIL}
                  data-testid="auth-login-email-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{AUTH.UI.LABELS.PASSWORD}</FormLabel>

              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder={AUTH.UI.PLACEHOLDERS.PASSWORD}
                    data-testid="auth-login-password-input"
                  />
                </FormControl>

                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  data-testid="auth-login-password-toggle"
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember me */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="auth-login-remember-checkbox"
                    />
                  </FormControl>

                  <FormLabel className="text-sm font-normal cursor-pointer">
                    {AUTH.UI.LABELS.REMEMBER}
                  </FormLabel>
                </div>

                <Link
                  to={AUTH_ROUTES.RESET_PASSWORD}
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  {AUTH.UI.ACTIONS.FORGOT_PASSWORD}
                </Link>
              </div>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          data-testid="auth-login-submit-button"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
              {AUTH.UI.ACTIONS.LOADING}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {AUTH.UI.ACTIONS.SUBMIT}
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
}

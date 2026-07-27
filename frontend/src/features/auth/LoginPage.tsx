import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Radar, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { ROUTES, ROLE_HOME } from "@/constants/routes";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { email: "commander@rescuehive.io", label: "Incident Commander" },
  { email: "operator@rescuehive.io", label: "Field Operator" },
  { email: "admin@rescuehive.io", label: "System Administrator" },
  { email: "dev@rescuehive.io", label: "Developer" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "commander@rescuehive.io", password: "demo1234", rememberMe: true },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await login(values.email, values.password, !!values.rememberMe);
    if (result.success) {
      toast.success("Authenticated", { description: "Welcome back to RescueHive." });
      const role = useAuthStore.getState().user?.role;
      const dest = (location.state as any)?.from?.pathname ?? (role ? ROLE_HOME[role] : ROUTES.DASHBOARD);
      navigate(dest, { replace: true });
    } else {
      toast.error("Login failed", { description: result.error });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-live/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/40">
            <Radar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-wide text-slate-100">RescueHive</h1>
          <p className="text-sm text-muted">Multi-Robot Disaster Intelligence System</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass rounded-2xl p-6 space-y-4"
          aria-label="Login form"
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-xs text-critical">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-9 text-sm text-slate-100 outline-none focus:border-primary"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-critical">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400">
              <input type="checkbox" className="rounded border-border bg-surface" {...register("rememberMe")} />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
              className="text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            {isSubmitting ? "Authenticating..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 rounded-xl border border-border/60 bg-card/40 p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">Demo accounts (password: demo1234)</p>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => setValue("email", acc.email)}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-left text-[11px] text-slate-300 hover:border-primary/50 hover:text-primary"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

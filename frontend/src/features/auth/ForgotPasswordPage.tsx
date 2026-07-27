import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck, ArrowLeft, Radar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/40">
            <Radar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-slate-100">Reset password</h1>
          <p className="text-sm text-muted">We'll send recovery instructions to your email.</p>
        </div>

        <div className="glass rounded-2xl p-6">
          {!sent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <MailCheck className="h-8 w-8 text-success" />
              <p className="text-sm text-slate-300">
                If an account exists for <span className="mono text-slate-100">{email}</span>, recovery
                instructions have been sent.
              </p>
            </div>
          )}
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="mt-5 flex items-center gap-1.5 text-xs text-muted hover:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

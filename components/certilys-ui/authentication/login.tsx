import { CtyIcon } from "@/components/icons/cty-i";
import { LoginForm } from "@/components/certilys-ui/authentication/login-form";

const Login = () => (
  <div className="flex min-h-screen items-center justify-center py-12">
    <div className="mx-auto w-full border border-border/70 pb-0 max-sm:border-t-0 sm:max-w-md sm:rounded-xl sm:bg-card sm:p-1 sm:shadow-lg/3">
      <div className="border border-border/70 bg-muted/60 px-10 py-14 max-sm:border-x-0 sm:rounded-lg sm:shadow-sm/2">
        <CtyIcon className="mx-auto mb-3 text-primary h-12 w-12" />
        <h1 className="mt-3 text-center font-semibold text-2xl">
          Espace Administration
        </h1>
        <p className="text-center text-muted-foreground text-sm mt-2">
          Portail de gestion et d'administration Certilys
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>

      <div className="relative py-5">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
        linear-gradient(45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%),
        linear-gradient(-45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%)
      `,
            backgroundSize: "40px 40px",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)",
          }}
        />

        <p className="relative isolate text-center text-destructive font-medium text-xs px-6">
          Accès strictement réservé aux comptes administrateurs autorisés.
        </p>
      </div>
    </div>
  </div>
);

export default Login;

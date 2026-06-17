import { useEffect, useState } from "react";
import { Eye, EyeOff, IdCard, Lock, Mail, UserRound, type LucideIcon } from "lucide-react";
import { APIService, EmployeeSettingsJSON } from "../services/api";
import BrandLogo from "./BrandLogo";

type SettingsPageProps = {
  email: string;
};

type SettingsField = {
  key: keyof EmployeeSettingsJSON;
  label: string;
  icon: LucideIcon;
  sensitive?: boolean;
};

type SettingsSection = {
  title: string;
  fields: SettingsField[];
};

type SettingsConfig = {
  title: string;
  description: string;
  sections: SettingsSection[];
};

const settingsConfig: SettingsConfig = {
  title: "Settings",
  description: "View your portal profile and login information.",
  sections: [
    {
      title: "Login Information",
      fields: [
        { key: "email", label: "Email", icon: Mail },
        { key: "password", label: "Password", icon: Lock, sensitive: true },
      ],
    },
    {
      title: "Employee Information",
      fields: [
        { key: "name", label: "Name", icon: UserRound },
        { key: "employeeCode", label: "Employee ID", icon: IdCard },
        { key: "role", label: "Role", icon: UserRound },
        { key: "department", label: "Department", icon: IdCard },
      ],
    },
  ],
};

const emptySettings: EmployeeSettingsJSON = {
  email: "",
  password: "",
  name: "",
  employeeCode: "",
  role: "",
  department: "",
};

export default function SettingsPage({ email }: SettingsPageProps) {
  const [settings, setSettings] = useState<EmployeeSettingsJSON>(emptySettings);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    APIService.getEmployeeSettings(email).then((data) => {
      if (mounted) setSettings(data);
    });

    return () => {
      mounted = false;
    };
  }, [email]);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center gap-3">
          <BrandLogo size="sm" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              {settingsConfig.title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{settingsConfig.description}</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {settingsConfig.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl"
            >
              <h2 className="text-sm font-semibold text-slate-100">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.fields.map((field) => {
                  const Icon = field.icon;
                  const value = settings[field.key];
                  const displayValue =
                    field.sensitive && !showPassword
                      ? value
                        ? "••••••••"
                        : "Not set"
                      : value || "Not set";

                  return (
                    <div
                      key={field.key}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                        <Icon className="h-4 w-4 text-indigo-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">{field.label}</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-slate-100">
                          {displayValue}
                        </p>
                      </div>
                      {field.sensitive && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { APP_DESCRIPTION } from "@/lib/config/app";

export function Greeting() {
  const { user } = useCurrentUser();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {user ? `Olá, ${user.firstName}!` : "Olá!"}
      </h1>
      <p className="text-muted mt-1">{APP_DESCRIPTION}</p>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

/**
 * A person's avatar, resolved once: Clerk photo when we have one, a programmatic
 * initials fallback otherwise (also the graceful landing when the image errors).
 * Presentational and server-safe — pass `src` from `getClerkAvatarMap` on the
 * server, or from `useUser().imageUrl` on the client.
 */
export function UserAvatar({
  name,
  src,
  size = "default",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback aria-label={name}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

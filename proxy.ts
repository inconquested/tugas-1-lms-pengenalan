import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The app is single-locale (Indonesian); there is no next-intl routing, no
// [locale] segment, and no message catalog. Running next-intl's middleware here
// prefixed every path with /en (its default localePrefix is "always"), which
// broke /sign-in -> /en/sign-in. Clerk protection stays; the locale layer is gone.

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // Clerk -> DB sync is called server-to-server, no session
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

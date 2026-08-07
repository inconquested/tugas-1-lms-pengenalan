'use client';

import { useRouter } from 'next/navigation';
import { I18nProvider, RouterProvider } from 'react-aria-components';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

export function Providers({
  children,
  locale = 'id-ID',
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const router = useRouter();
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider locale={locale}>
        {/* Route react-aria Link/Button href navigations through Next's router. */}
        <RouterProvider navigate={(href) => router.push(href)}>
          {children}
          <Toaster richColors position="top-center" />
        </RouterProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const footerLinks = {
    product: [
      { name: t('nav.dashboard'), href: '/dashboard' },
      { name: t('nav.patients'), href: '/dashboard/patients' },
      { name: t('nav.appointments'), href: '/dashboard/appointments' },
    ],
    resources: [
      { name: t('nav.education'), href: '/education' },
      { name: t('nav.signIn'), href: '/auth/signin' },
      { name: t('nav.register'), href: '/auth/register' },
    ],
    legal: [
      { name: t('footer.legal.privacy'), href: '#' },
      { name: t('footer.legal.terms'), href: '#' },
    ],
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MamaMtu</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.section.product')}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.section.resources')}</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('footer.section.legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MamaMtu. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {t('footer.madeWith')} <Heart className="h-4 w-4 text-primary mx-1" /> {t('footer.country')}
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { 
  Heart, 
  Calendar, 
  FileText, 
  Bell, 
  Users, 
  Activity,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Calendar,
      title: t('home.features.appointments.title'),
      description: t('home.features.appointments.desc'),
    },
    {
      icon: FileText,
      title: t('home.features.records.title'),
      description: t('home.features.records.desc'),
    },
    {
      icon: Bell,
      title: t('home.features.notifications.title'),
      description: t('home.features.notifications.desc'),
    },
    {
      icon: Activity,
      title: t('home.features.vitals.title'),
      description: t('home.features.vitals.desc'),
    },
    {
      icon: Shield,
      title: t('home.features.security.title'),
      description: t('home.features.security.desc'),
    },
    {
      icon: Users,
      title: t('home.features.careTeam.title'),
      description: t('home.features.careTeam.desc'),
    },
  ];

  const stats = [
    { value: t('home.stats.mothers.value'), label: t('home.stats.mothers.label') },
    { value: t('home.stats.partners.value'), label: t('home.stats.partners.label') },
    { value: t('home.stats.satisfaction.value'), label: t('home.stats.satisfaction.label') },
    { value: t('home.stats.support.value'), label: t('home.stats.support.label') },
  ];

  const benefits = [
    t('home.benefits.item1'),
    t('home.benefits.item2'),
    t('home.benefits.item3'),
    t('home.benefits.item4'),
    t('home.benefits.item5'),
    t('home.benefits.item6'),
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Heart className="h-4 w-4" />
              <span>{t('home.badge')}</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t('home.hero.title').replace(t('home.hero.titleHighlight'), '')}{' '}
              <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {t('home.hero.description')}
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link href="/auth/register">
                  {t('home.hero.cta1')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base" asChild>
                <Link href="/auth/signin">
                  {t('home.hero.cta2')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t('home.features.title')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('home.features.subtitle')}
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30">
        <div className="container py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t('home.benefits.title')}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('home.benefits.description')}
              </p>
              
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="mt-8 gap-2" size="lg" asChild>
                <Link href="/auth/register">
                  {t('home.benefits.cta')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <div className="text-sm font-medium">{t('home.demo.nextAppointment')}</div>
                    <div className="text-xs text-muted-foreground">{t('home.demo.appointmentTime')}</div>
                  </div>
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <Activity className="h-8 w-8 text-green-500 mb-2" />
                    <div className="text-sm font-medium">{t('home.demo.vitals')}</div>
                    <div className="text-xs text-muted-foreground">{t('home.demo.vitalsStatus')}</div>
                  </div>
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <Bell className="h-8 w-8 text-yellow-500 mb-2" />
                    <div className="text-sm font-medium">{t('home.demo.reminders')}</div>
                    <div className="text-xs text-muted-foreground">{t('home.demo.remindersCount')}</div>
                  </div>
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <FileText className="h-8 w-8 text-blue-500 mb-2" />
                    <div className="text-sm font-medium">{t('home.demo.records')}</div>
                    <div className="text-xs text-muted-foreground">{t('home.demo.recordsStatus')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t('home.cta.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('home.cta.description')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/auth/register">
                {t('home.cta.button1')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base" asChild>
              <Link href="/education">
                {t('home.cta.button2')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

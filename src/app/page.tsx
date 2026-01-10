import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

const features = [
  {
    icon: Calendar,
    title: 'Easy Appointments',
    description: 'Book and manage appointments with healthcare providers. Get reminders and never miss a visit.',
  },
  {
    icon: FileText,
    title: 'Health Records',
    description: 'Access complete medical history, lab results, and prescriptions in one secure place.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Receive timely reminders for appointments, medications, and important health updates.',
  },
  {
    icon: Activity,
    title: 'Vitals Tracking',
    description: 'Monitor vital signs and health metrics with easy-to-read charts and trends.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your health data is protected with enterprise-grade security and encryption.',
  },
  {
    icon: Users,
    title: 'Care Team',
    description: 'Connect with your healthcare providers and receive personalized care plans.',
  },
];

const stats = [
  { value: '10,000+', label: 'Mothers Served' },
  { value: '50+', label: 'Healthcare Partners' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' },
];

const benefits = [
  'Track your pregnancy journey week by week',
  'Get personalized health recommendations',
  'Access educational resources anytime',
  'Connect with experienced healthcare providers',
  'Manage all family health records',
  'Receive emergency alerts and guidance',
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Heart className="h-4 w-4" />
              <span>Caring for mothers & newborns</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Partner in{' '}
              <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                Maternal Health
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Comprehensive healthcare management for mothers and newborns. Schedule appointments, 
              track health records, receive timely reminders, and get the care you deserve.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link href="/auth/register">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base" asChild>
                <Link href="/auth/signin">
                  Sign In
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
            Everything You Need for Better Health
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete platform designed to support you throughout your maternal health journey.
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
                Why Choose MamaMtu?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We&apos;re committed to providing the best possible care for mothers and their babies. 
                Our platform makes it easy to stay on top of your health.
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
                  Start Your Journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <div className="text-sm font-medium">Next Appointment</div>
                    <div className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</div>
                  </div>
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <Activity className="h-8 w-8 text-green-500 mb-2" />
                    <div className="text-sm font-medium">Vitals</div>
                    <div className="text-xs text-muted-foreground">All Normal</div>
                  </div>
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <Bell className="h-8 w-8 text-yellow-500 mb-2" />
                    <div className="text-sm font-medium">Reminders</div>
                    <div className="text-xs text-muted-foreground">2 Active</div>
                  </div>
                  <div className="rounded-xl bg-background p-4 shadow-lg">
                    <FileText className="h-8 w-8 text-blue-500 mb-2" />
                    <div className="text-sm font-medium">Records</div>
                    <div className="text-xs text-muted-foreground">Up to date</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Take Control of Your Health?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of mothers who trust MamaMtu for their maternal healthcare needs.
            Get started today - it&apos;s free!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/auth/register">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base" asChild>
              <Link href="/education">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, PlayCircle, Stethoscope, Baby, Utensils, HeartPulse } from 'lucide-react';

type Resource = {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'guide';
  duration?: string;
};

const resources: Resource[] = [
  {
    id: 1,
    title: 'Prenatal Care Basics',
    description: 'Learn about essential prenatal care for a healthy pregnancy.',
    category: 'Pregnancy',
    type: 'article',
    duration: '5 min read',
  },
  {
    id: 2,
    title: 'Nutrition During Pregnancy',
    description: 'Discover the best foods to eat for you and your baby.',
    category: 'Nutrition',
    type: 'article',
    duration: '7 min read',
  },
  {
    id: 3,
    title: 'Labor and Delivery: What to Expect',
    description: 'A comprehensive guide to the stages of labor and delivery.',
    category: 'Childbirth',
    type: 'video',
    duration: '15 min',
  },
  {
    id: 4,
    title: 'Newborn Care 101',
    description: 'Essential tips for caring for your newborn in the first weeks.',
    category: 'Newborn',
    type: 'guide',
  },
  {
    id: 5,
    title: 'Postpartum Recovery',
    description: 'Understanding your body\'s recovery after childbirth.',
    category: 'Postpartum',
    type: 'article',
    duration: '8 min read',
  },
  {
    id: 6,
    title: 'Breastfeeding Techniques',
    description: 'Learn proper latching and positioning for successful breastfeeding.',
    category: 'Breastfeeding',
    type: 'video',
    duration: '12 min',
  },
];

const categories = [
  { name: 'All', icon: null },
  { name: 'Pregnancy', icon: <HeartPulse className="h-4 w-4 mr-2" /> },
  { name: 'Nutrition', icon: <Utensils className="h-4 w-4 mr-2" /> },
  { name: 'Childbirth', icon: <Stethoscope className="h-4 w-4 mr-2" /> },
  { name: 'Breastfeeding', icon: null },
  { name: 'Newborn', icon: <Baby className="h-4 w-4 mr-2" /> },
  { name: 'Postpartum', icon: null },
];

export default function EducationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Health Education</h1>
        <p className="text-muted-foreground">Access educational resources for a healthy pregnancy and beyond</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button key={category.name} variant="outline" className="flex items-center">
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                {resource.type === 'article' && <BookOpen className="h-5 w-5 text-blue-500" />}
                {resource.type === 'video' && <PlayCircle className="h-5 w-5 text-red-500" />}
                {resource.type === 'guide' && <Stethoscope className="h-5 w-5 text-green-500" />}
              </div>
              <CardDescription>{resource.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
            </CardContent>
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{resource.duration || 'Guide'}</span>
                <Button variant="outline" size="sm">
                  View {resource.type === 'video' ? 'Video' : 'Article'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" className="mx-auto">
          Load More Resources
        </Button>
      </div>
    </div>
  );
}

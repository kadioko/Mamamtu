'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentType, DifficultyLevel } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Icons } from '../ui/icons';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title must be less than 120 characters'),
  description: z
    .string()
    .max(300, 'Description must be less than 300 characters')
    .optional(),
  content: z
    .string()
    .min(10, 'Content is required')
    .max(50000, 'Content is too long (max 50,000 characters)'),
  type: z.nativeEnum(ContentType, {
    message: 'Please select a content type',
  }),
  difficulty: z.nativeEnum(DifficultyLevel, {
    message: 'Please select a difficulty level',
  }),
  duration: z.coerce
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(1000, 'Duration cannot exceed 1000 minutes')
    .optional()
    .or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z
    .string()
    .refine(
      (val) => !val || val.split(',').every(tag => tag.trim().length <= 30),
      'Each tag must be 30 characters or less'
    )
    .optional(),
  thumbnailUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => !url || /.(jpe?g|png|webp|avif)$/i.test(new URL(url).pathname),
      'Image must be a JPG, PNG, or WebP'
    )
    .optional()
    .or(z.literal('')),
  videoUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => !url || /.(mp4|webm|mov|m3u8)$/i.test(new URL(url).pathname),
      'Video must be MP4, WebM, or M3U8'
    )
    .optional()
    .or(z.literal('')),
  fileUrl: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => !url || /\.(pdf|ppt|pptx|key|odp)$/i.test(new URL(url).pathname),
      'File must be a PDF or presentation'
    )
    .optional()
    .or(z.literal('')),
  relatedContentIds: z
    .array(z.string())
    .max(10, 'You can select up to 10 related contents')
    .optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
}).refine(data => {
  // Additional validation based on content type
  if (data.type === ContentType.VIDEO && !data.videoUrl) {
    return { message: 'Video URL is required for video content', path: ['videoUrl'] };
  }
  if ((data.type === ContentType.PDF || data.type === ContentType.PRESENTATION) && !data.fileUrl) {
    return { message: 'File URL is required for this content type', path: ['fileUrl'] };
  }
  return true;
});

type FormValues = z.input<typeof formSchema>;

type SubmitValues = Omit<FormValues, 'tags' | 'thumbnailUrl' | 'videoUrl' | 'fileUrl'> & {
  tags: string[];
  thumbnailUrl: string | null;
  videoUrl: string | null;
  fileUrl: string | null;
};

interface ContentEditorProps {
  initialData?: Partial<SubmitValues>;
  onSubmit: (data: SubmitValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ContentEditor({ initialData, onSubmit, isSubmitting: isExternalSubmitting }: ContentEditorProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [relatedContents, setRelatedContents] = useState<Array<{ id: string; title: string }>>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      type: initialData?.type || ContentType.ARTICLE,
      difficulty: initialData?.difficulty || DifficultyLevel.BEGINNER,
      duration: initialData?.duration || undefined,
      categoryId: initialData?.categoryId || '',
      tags: initialData?.tags?.join(', ') || '',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      videoUrl: initialData?.videoUrl || '',
      fileUrl: initialData?.fileUrl || '',
      relatedContentIds: initialData?.relatedContentIds || [],
      isPublished: initialData?.isPublished || false,
      isFeatured: initialData?.isFeatured || false,
    },
  });

  // Watch content type to show/hide relevant fields
  const contentType = form.watch('type');
  const isFormValid = form.formState.isValid;
  const formIsSubmitting = form.formState.isSubmitting;
  const errors = form.formState.errors;
  const disabledSubmitting = formIsSubmitting || isExternalSubmitting;

  // Fetch categories and related content
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, contentsRes] = await Promise.all([
          fetch('/api/content/categories'),
          fetch('/api/content?limit=100'),
        ]);

        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }

        if (contentsRes.ok) {
          const { data } = await contentsRes.json();
          setRelatedContents(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: FormValues) => {
    try {
      const formData: SubmitValues = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        // Clean up empty strings from optional fields
        thumbnailUrl: data.thumbnailUrl || null,
        videoUrl: data.videoUrl || null,
        fileUrl: data.fileUrl || null,
      };
      
      await onSubmit(formData);
    } catch (err: unknown) {
      console.error('Error submitting form:', err);
      
      // Handle specific error cases
      const response =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: unknown }).response
          : undefined;

      if (response && typeof response === 'object') {
        const statusValue = (response as { status?: unknown }).status;
        const dataValue = (response as { data?: unknown }).data;
        const status = typeof statusValue === 'number' ? statusValue : undefined;
        const data =
          dataValue && typeof dataValue === 'object' && !Array.isArray(dataValue)
            ? (dataValue as Record<string, unknown>)
            : {};
        
        if (status === 401) {
          form.setError('root', {
            type: 'manual',
            message: 'You need to be logged in to perform this action',
          });
        } else if (status === 403) {
          form.setError('root', {
            type: 'manual',
            message: 'You do not have permission to perform this action',
          });
        } else if (status === 409) {
          // Handle validation errors from server
          const errorsValue = data['errors'];
          if (errorsValue && typeof errorsValue === 'object' && !Array.isArray(errorsValue)) {
            Object.entries(errorsValue as Record<string, unknown>).forEach(([field, message]) => {
              const messageText =
                Array.isArray(message) && typeof message[0] === 'string'
                  ? message[0]
                  : typeof message === 'string'
                    ? message
                    : undefined;

              form.setError(field as keyof FormValues, {
                type: 'manual',
                message: messageText || 'Invalid value',
              });
            });
          } else {
            const messageText = typeof data['message'] === 'string' ? data['message'] : undefined;
            form.setError('root', {
              type: 'manual',
              message: messageText || 'A conflict occurred',
            });
          }
        } else {
          const messageText = typeof data['message'] === 'string' ? data['message'] : undefined;
          form.setError('root', {
            type: 'manual',
            message: messageText || 'An error occurred while saving',
          });
        }
      } else {
        form.setError('root', {
          type: 'manual',
          message: 'Network error. Please check your connection and try again.',
        });
      }
    }
  };

  

  return (
    <Form {...form}>
      {errors.root && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errors.root.message}
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">
            {initialData ? 'Edit Content' : 'Create New Content'}
          </h2>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={disabledSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || disabledSubmitting}
            >
              {formIsSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : initialData ? (
                'Update Content'
              ) : (
                'Create Content'
              )}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description of your content"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content</Label>
                <div className="flex border rounded-md">
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm ${activeTab === 'edit' ? 'bg-muted' : ''}`}
                    onClick={() => setActiveTab('edit')}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-sm ${activeTab === 'preview' ? 'bg-muted' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Preview
                  </button>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    {activeTab === 'edit' ? (
                      <FormControl>
                        <Textarea
                          placeholder="Enter your content here. You can use Markdown for formatting."
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                    ) : (
                      <div className="prose max-w-none p-4 border rounded-md min-h-[300px]">
                        <ReactMarkdown>{field.value || '*No content to preview*'}</ReactMarkdown>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publish</FormLabel>
                        <FormDescription>
                          This content will be visible to all users if published.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Feature this content on the homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={disabledSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={disabledSubmitting}>
                    {formIsSubmitting ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {initialData ? 'Update' : 'Create'} Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ContentType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0) + type.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DifficultyLevel).map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0) + level.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="e.g. 10"
                          {...field}
                          value={typeof field.value === 'number' ? field.value : ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {contentType === 'VIDEO' && (
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/video.mp4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {contentType === 'PDF' || contentType === 'PRESENTATION' ? (
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {contentType === 'PDF' ? 'PDF URL' : 'Presentation URL'}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/document.pdf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="tag1, tag2, tag3" {...field} />
                      </FormControl>
                      <FormDescription>
                        Separate tags with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Content</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="relatedContentIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          {relatedContents
                            .filter(content => content.id !== initialData?.id)
                            .map((content) => (
                              <div key={content.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`related-${content.id}`}
                                  checked={field.value?.includes(content.id) || false}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...(field.value || []), content.id]
                                      : field.value?.filter((id: string) => id !== content.id) || [];
                                    field.onChange(newValue);
                                  }}
                                />
                                <Label htmlFor={`related-${content.id}`} className="text-sm font-normal">
                                  {content.title}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

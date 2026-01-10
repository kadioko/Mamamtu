'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Progress } from '@/components/ui/progress';
import { ContentType, DifficultyLevel } from '@prisma/client';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Badge } from '../ui/badge';
import Image from 'next/image';

const difficultyColors = {
  [DifficultyLevel.BEGINNER]: 'bg-green-100 text-green-800',
  [DifficultyLevel.INTERMEDIATE]: 'bg-blue-100 text-blue-800',
  [DifficultyLevel.ADVANCED]: 'bg-purple-100 text-purple-800',
} as const;

const contentTypeLabels = {
  [ContentType.ARTICLE]: 'Article',
  [ContentType.VIDEO]: 'Video',
  [ContentType.PDF]: 'PDF',
  [ContentType.PRESENTATION]: 'Presentation',
  [ContentType.QUIZ]: 'Quiz',
} as const;

interface ContentViewerProps {
  content: {
    id: string;
    title: string;
    content: string;
    description: string | null;
    type: ContentType;
    difficulty: DifficultyLevel;
    duration: number | null;
    viewCount: number;
    averageRating: number | null;
    ratingsCount: number;
    thumbnailUrl: string | null;
    videoUrl: string | null;
    fileUrl: string | null;
    category: { name: string };
    author: { name: string | null; image: string | null };
    createdAt: string;
    updatedAt: string;
  };
  userProgress: {
    id: string;
    progress: number;
    isCompleted: boolean;
    completedAt: Date | null;
    rating: number | null;
    notes: string | null;
  } | null;
}

export function ContentViewer({ content, userProgress: initialUserProgress }: ContentViewerProps) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState(initialUserProgress?.progress || 0);
  const [isCompleted, setIsCompleted] = useState(initialUserProgress?.isCompleted || false);
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(initialUserProgress?.rating || 0);
  const [notes, setNotes] = useState(initialUserProgress?.notes || '');
  const [showNotes, setShowNotes] = useState(false);

  const updateProgress = useCallback(async (newProgress: number) => {
    if (!session?.user) return;

    const completed = newProgress >= 90; // Consider 90% as completed

    try {
      setIsLoading(true);
      const response = await fetch(`/api/content/${content.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: newProgress,
          isCompleted: completed,
          rating: rating > 0 ? rating : undefined,
          notes: showNotes ? notes : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await response.json();
      setProgress(data.progress);
      setIsCompleted(data.isCompleted);

      if (completed && !isCompleted) {
        toast.success('Content marked as completed!', {
          description: `You've completed "${content.title}"`,
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setIsLoading(false);
    }
  }, [content.id, content.title, session, rating, showNotes, notes, isCompleted]);

  useEffect(() => {
    // Mark as viewed when component mounts
    if (session?.user) {
      updateProgress(progress);
    }
  }, [session, progress, updateProgress]);

  const handleMarkComplete = () => {
    updateProgress(100);
  };

  const handleRate = async (newRating: number) => {
    setRating(newRating);
    await updateProgress(progress);
    toast.success('Thank you for your rating!');
  };

  const renderContent = () => {
    switch (content.type) {
      case ContentType.ARTICLE:
        return (
          <div className="prose max-w-none">
            <ReactMarkdown>{content.content}</ReactMarkdown>
          </div>
        );
      case ContentType.VIDEO:
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {content.videoUrl ? (
              <video
                controls
                className="w-full h-full"
                onEnded={() => updateProgress(100)}
                onTimeUpdate={(e) => {
                  const video = e.target as HTMLVideoElement;
                  const newProgress = (video.currentTime / video.duration) * 100;
                  if (newProgress > progress) {
                    updateProgress(newProgress);
                  }
                }}
              >
                <source src={content.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                Video content not available
              </div>
            )}
          </div>
        );
      case ContentType.PDF:
      case ContentType.PRESENTATION:
        return (
          <div className="h-[600px] border rounded-lg">
            <iframe
              src={content.fileUrl || ''}
              className="w-full h-full"
              title={content.title}
            />
          </div>
        );
      case ContentType.QUIZ:
        return (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Quiz: {content.title}</h3>
            <p className="text-muted-foreground mb-6">
              This is an interactive quiz. Complete all questions to finish.
            </p>
            <Button onClick={handleMarkComplete} disabled={isCompleted || isLoading}>
              {isCompleted ? 'Quiz Completed' : 'Mark as Completed'}
            </Button>
          </div>
        );
      default:
        return <p>Unsupported content type</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{contentTypeLabels[content.type]}</span>
          <span>•</span>
          <span>{content.category.name}</span>
          <span>•</span>
          <span>{content.duration ? `${content.duration} min` : 'N/A'}</span>
          <span>•</span>
          <Badge variant="outline" className={difficultyColors[content.difficulty]}>
            {content.difficulty}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>By {content.author?.name || 'Unknown Author'}</span>
          <span>•</span>
          <span>Updated {format(new Date(content.updatedAt), 'MMM d, yyyy')}</span>
          <span>•</span>
          <span>{content.viewCount} views</span>
          {content.averageRating !== null && (
            <span className="flex items-center">
              <Icons.star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              {content.averageRating.toFixed(1)} ({content.ratingsCount})
            </span>
          )}
        </div>
      </div>

      {content.thumbnailUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          <Image
            src={content.thumbnailUrl}
            alt={content.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {content.description && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-muted-foreground italic">{content.description}</p>
        </div>
      )}

      <div className="space-y-4">
        {session?.user && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isCompleted ? 'Completed' : 'Progress'}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {!isCompleted && content.type !== ContentType.QUIZ && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkComplete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Mark as Completed'}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="prose max-w-none">
          {renderContent()}
        </div>
      </div>

      {session?.user && (
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Rate this content</h3>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                  onClick={() => handleRate(star)}
                  className="p-1 focus:outline-none"
                  disabled={isLoading}
                >
                  <Icons.star
                    className={`h-6 w-6 ${
                      star <= (rating || 0)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground/30 fill-muted-foreground/10'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notes</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
              >
                {showNotes ? 'Hide' : 'Show'} Notes
              </Button>
            </div>
            {showNotes && (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => updateProgress(progress)}
                  placeholder="Add your notes here..."
                  className="w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Your notes are saved automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

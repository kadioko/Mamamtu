import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ContentType, DifficultyLevel } from '@prisma/client';
import { NextResponse } from 'next/server';

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string')
          .map(item => item.trim())
          .filter(Boolean);
      }
    } catch {}

    return trimmed
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

const serializeStringArray = (value: unknown): string | null => {
  const parsed = parseStringArray(value);
  if (parsed.length === 0) return null;
  return parsed.join(', ');
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty') as DifficultyLevel | null;
    const type = searchParams.get('type') as ContentType | null;
    const isFeatured = searchParams.get('featured') === 'true';

    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(category && { category: { slug: category } }),
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      ...(isFeatured && { isFeatured: true }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { hasSome: [search] } },
        ],
      }),
    };

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          author: {
            select: { name: true, image: true },
          },
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      data: contents,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.title || !data.content || !data.type || !data.difficulty || !data.categoryId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');

    const content = await prisma.content.create({
      data: {
        ...data,
        slug,
        authorId: session.user.id,
        tags: serializeStringArray(data?.tags),
        isPublished: data.isPublished || false,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

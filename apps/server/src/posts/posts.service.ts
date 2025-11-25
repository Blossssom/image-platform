import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from '../entities/Posts';
import { FindAllPostsDto } from './dto/find-all-posts.dto';
import { PaginatedPostsResponseDto } from './dto/paginated-posts.response.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: string, // Assuming you have user management
  ): Promise<Posts> {
    const newPost = this.postsRepository.create({
      ...createPostDto,
      userId,
    });

    return this.postsRepository.save(newPost);
  }

  async findAll(query: FindAllPostsDto): Promise<PaginatedPostsResponseDto> {
    const limit = query.limit || 10; // Default limit
    const qb = this.postsRepository.createQueryBuilder('post');

    qb.leftJoinAndSelect('post.images', 'image');
    qb.orderBy('post.createdAt', 'DESC');
    qb.addOrderBy('post.id', 'DESC'); // Secondary sort to handle same createdAt

    if (query.cursor) {
      const cursorPost = await this.postsRepository.findOne({
        where: { id: query.cursor },
      });

      if (!cursorPost) {
        throw new NotFoundException('Cursor post not found');
      }

      // Cursor-based pagination logic
      // Fetch posts that are older than the cursorPost, or
      // if same createdAt, then have a smaller ID (further down the list)
      qb.andWhere(
        '(post.createdAt < :cursorCreatedAt OR (post.createdAt = :cursorCreatedAt AND post.id < :cursorId))',
        {
          cursorCreatedAt: cursorPost.createdAt,
          cursorId: cursorPost.id,
        },
      );
    }

    // Fetch one more than the limit to check for hasMore
    qb.take(limit + 1);

    const posts = await qb.getMany();

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = data.length > 0 ? data[data.length - 1].id : null;

    return {
      data,
      cursor: nextCursor,
      hasMore,
    };
  }
}


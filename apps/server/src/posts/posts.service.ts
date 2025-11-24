import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from '../entities/Posts';
import { Images } from '../entities/Images';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
  ) {}

  async createPostWithImage(
    createPostDto: { title: string; description?: string },
    image: Images,
  ): Promise<Posts> {
    const newPost = this.postsRepository.create({
      title: createPostDto.title,
      description: createPostDto.description,
      images: [image],
      // userId would be set here from the authenticated user
    });

    return this.postsRepository.save(newPost);
  }
}

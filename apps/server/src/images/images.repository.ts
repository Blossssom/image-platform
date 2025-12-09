import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Images } from '../entities/Images';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(Images)
    private readonly repository: Repository<Images>,
  ) {}

  create(data: Partial<Images>): Images {
    return this.repository.create(data);
  }

  async save(image: Images): Promise<Images> {
    return this.repository.save(image);
  }
}

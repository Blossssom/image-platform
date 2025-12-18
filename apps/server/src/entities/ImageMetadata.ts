import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { Images } from './Images';

@Entity('image_metadata', { schema: 'public' })
export class ImageMetadata {
  @Column('uuid', { primary: true, name: 'image_id' })
  imageId: string;

  @Column('character varying', { name: 'title', nullable: true, length: 255 })
  title: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('character varying', {
    name: 'generation_tool',
    nullable: true,
    length: 50,
  })
  generationTool: string | null;

  @Column('character varying', {
    name: 'generation_method',
    nullable: true,
    length: 50,
  })
  generationMethod: string | null;

  @Column('text', { name: 'positive_prompt', nullable: true })
  positivePrompt: string | null;

  @Column('text', { name: 'negative_prompt', nullable: true })
  negativePrompt: string | null;

  @Column('character varying', {
    name: 'model_hash',
    nullable: true,
    length: 64,
  })
  modelHash: string | null;

  @Column('character varying', { name: 'sampler', nullable: true, length: 50 })
  sampler: string | null;

  @Column('integer', { name: 'steps', nullable: true })
  steps: number | null;

  @Column('double precision', {
    name: 'cfg_scale',
    nullable: true,
  })
  cfgScale: number | null;

  @Column('bigint', { name: 'seed', nullable: true })
  seed: string | null;

  @Column('jsonb', { name: 'workflow', nullable: true })
  workflow: object | null;

  @Column('jsonb', { name: 'raw_params', nullable: true })
  rawParams: object | null;

  @Column('jsonb', { name: 'resources', nullable: true })
  resources: object[] | null;

  @Column('jsonb', { name: 'tags', nullable: true })
  tags: string[] | null;

  @Column('boolean', { name: 'is_nsfw', nullable: true, default: false })
  isNsfw: boolean | null;

  @OneToOne(() => Images, (images) => images.imageMetadata, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image: Images;
}

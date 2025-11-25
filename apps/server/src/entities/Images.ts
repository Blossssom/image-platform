import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Comments } from './Comments';
import { ImageLikes } from './ImageLikes';
import { ImageResources } from './ImageResources';
import { Posts } from './Posts';
import { ApiProperty } from '@nestjs/swagger';

@Index('IDX_images_generation_info', ['generationInfo'], {})
@Index('PK_images', ['id'], { unique: true })
@Index('IDX_images_nsfw_level', ['nsfwLevel'], {})
@Entity('images', { schema: 'public' })
export class Images {
  @ApiProperty()
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @ApiProperty()
  @Column('character varying', { name: 'url_original' })
  urlOriginal!: string;

  @ApiProperty()
  @Column('character varying', { name: 'url_preview' })
  urlPreview!: string;

  @ApiProperty()
  @Column('character varying', { name: 'url_thumbnail' })
  urlThumbnail!: string;

  @ApiProperty()
  @Column('integer', { name: 'width' })
  width!: number;

  @ApiProperty()
  @Column('integer', { name: 'height' })
  height!: number;

  @ApiProperty()
  @Column('double precision', { name: 'aspect_ratio', precision: 53 })
  aspectRatio!: number;

  @ApiProperty()
  @Column('jsonb', { name: 'generation_info' })
  generationInfo: object;

  @ApiProperty({ enum: ['NONE', 'SOFT', 'MATURE', 'X'] })
  @Column('enum', {
    name: 'nsfw_level',
    enum: ['NONE', 'SOFT', 'MATURE', 'X'],
    default: () => "'NONE'",
  })
  nsfwLevel: 'NONE' | 'SOFT' | 'MATURE' | 'X';

  @ApiProperty({ nullable: true })
  @Column('character varying', { name: 'workflow_url', nullable: true })
  workflowUrl: string | null;

  @ApiProperty()
  @Column('integer', { name: 'like_count', default: () => '0' })
  likeCount: number;

  @ApiProperty()
  @Column('integer', { name: 'comment_count', default: () => '0' })
  commentCount: number;

  @ApiProperty()
  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @ApiProperty()
  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'now()',
  })
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ type: () => [Comments] })
  @OneToMany(() => Comments, comments => comments.image)
  comments: Comments[];

  @ApiProperty({ type: () => [ImageLikes] })
  @OneToMany(() => ImageLikes, imageLikes => imageLikes.image)
  imageLikes: ImageLikes[];

  @ApiProperty({ type: () => [ImageResources] })
  @OneToMany(() => ImageResources, imageResources => imageResources.image)
  imageResources: ImageResources[];

  @ApiProperty({ type: () => Posts })
  @ManyToOne(() => Posts, posts => posts.images, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'post_id', referencedColumnName: 'id' }])
  post: Posts;
}

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

@Index('IDX_images_generation_info', ['generationInfo'], {})
@Index('PK_images', ['id'], { unique: true })
@Index('IDX_images_nsfw_level', ['nsfwLevel'], {})
@Entity('images', { schema: 'public' })
export class Images {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('character varying', { name: 'url_original' })
  urlOriginal!: string;

  @Column('character varying', { name: 'url_preview' })
  urlPreview!: string;

  @Column('character varying', { name: 'url_thumbnail' })
  urlThumbnail!: string;

  @Column('integer', { name: 'width' })
  width!: number;

  @Column('integer', { name: 'height' })
  height!: number;

  @Column('double precision', { name: 'aspect_ratio', precision: 53 })
  aspectRatio!: number;

  @Column('jsonb', { name: 'generation_info' })
  generationInfo: object;

  @Column('enum', {
    name: 'nsfw_level',
    enum: ['NONE', 'SOFT', 'MATURE', 'X'],
    default: () => "'NONE'",
  })
  nsfwLevel: 'NONE' | 'SOFT' | 'MATURE' | 'X';

  @Column('character varying', { name: 'workflow_url', nullable: true })
  workflowUrl: string | null;

  @Column('integer', { name: 'like_count', default: () => '0' })
  likeCount: number;

  @Column('integer', { name: 'comment_count', default: () => '0' })
  commentCount: number;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'now()',
  })
  updatedAt: Date;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Comments, comments => comments.image)
  comments: Comments[];

  @OneToMany(() => ImageLikes, imageLikes => imageLikes.image)
  imageLikes: ImageLikes[];

  @OneToMany(() => ImageResources, imageResources => imageResources.image)
  imageResources: ImageResources[];

  @ManyToOne(() => Posts, posts => posts.images, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'post_id', referencedColumnName: 'id' }])
  post: Posts;
}

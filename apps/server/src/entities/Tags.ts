import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImageTags } from './ImageTags';
import { Users } from './Users';

@Index('idx_tags_category_usage', ['category', 'usageCount'], {})
@Index('tags_pkey', ['id'], { unique: true })
@Index('tags_name_key', ['name'], { unique: true })
@Index('idx_tags_name_trgm', ['name'], {})
@Index('idx_tags_slug', ['slug'], {})
@Index('tags_slug_key', ['slug'], { unique: true })
@Index('idx_tags_trending', ['trendingScore', 'usageCount'], {})
@Entity('tags', { schema: 'public' })
export class Tags {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @Column('character varying', { name: 'name', unique: true, length: 100 })
  name!: string;

  @Column('character varying', { name: 'slug', unique: true, length: 100 })
  slug!: string;

  @Column('character varying', { name: 'category', nullable: true, length: 50 })
  category!: string | null;

  @Column('character', { name: 'color', nullable: true, length: 7 })
  color!: string | null;

  @Column('character varying', { name: 'icon', nullable: true, length: 50 })
  icon!: string | null;

  @Column('text', { name: 'description', nullable: true })
  description!: string | null;

  @Column('jsonb', { name: 'aliases', nullable: true })
  aliases!: object | null;

  @Column('integer', {
    name: 'usage_count',
    nullable: true,
    default: () => '0',
  })
  usageCount!: number | null;

  @Column('numeric', {
    name: 'trending_score',
    nullable: true,
    precision: 10,
    scale: 2,
    default: () => '0',
  })
  trendingScore!: string | null;

  @Column('boolean', {
    name: 'is_nsfw',
    nullable: true,
    default: () => 'false',
  })
  isNsfw!: boolean | null;

  @Column('boolean', {
    name: 'is_verified',
    nullable: true,
    default: () => 'true',
  })
  isVerified!: boolean | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date | null;

  @OneToMany(() => ImageTags, imageTags => imageTags.tag)
  imageTags!: ImageTags[];

  @ManyToOne(() => Users, users => users.tags)
  @JoinColumn([{ name: 'created_by_user_id', referencedColumnName: 'id' }])
  createdByUser!: Users;

  @ManyToOne(() => Tags, tags => tags.tags)
  @JoinColumn([{ name: 'parent_tag_id', referencedColumnName: 'id' }])
  parentTag!: Tags;

  @OneToMany(() => Tags, tags => tags.parentTag)
  tags!: Tags[];
}

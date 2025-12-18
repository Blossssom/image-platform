import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Tags } from './Tags';

@Index('image_tags_pkey', ['imageId', 'tagId'], { unique: true })
@Index('idx_image_tags_tag_id', ['tagId'], {})
@Entity('image_tags', { schema: 'public' })
export class ImageTags {
  @Column('uuid', { primary: true, name: 'image_id' })
  imageId: string;

  @Column('integer', { primary: true, name: 'tag_id' })
  tagId: number;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'now()',
  })
  createdAt: Date | null;

  @ManyToOne(() => Tags, (tags) => tags.imageTags, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'tag_id', referencedColumnName: 'id' }])
  tag: Tags;
}

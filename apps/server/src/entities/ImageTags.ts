import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Images } from './Images';
import { Tags } from './Tags';

@Index('idx_image_tags_tag_confidence', ['confidence', 'tagId'], {})
@Index('image_tags_pkey', ['imageId', 'tagId'], { unique: true })
@Index('idx_image_tags_image_source', ['imageId', 'tagSource'], {})
@Entity('image_tags', { schema: 'public' })
export class ImageTags {
  @Column('uuid', { primary: true, name: 'image_id' })
  imageId!: string;

  @Column('integer', { primary: true, name: 'tag_id' })
  tagId!: number;

  @Column('integer', { name: 'tag_source' })
  tagSource!: number;

  @Column('numeric', {
    name: 'confidence',
    nullable: true,
    precision: 4,
    scale: 3,
  })
  confidence!: string | null;

  @Column('boolean', {
    name: 'verified_by_admin',
    nullable: true,
    default: () => 'true',
  })
  verifiedByAdmin!: boolean | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @ManyToOne(() => Users, users => users.imageTags)
  @JoinColumn([{ name: 'add_by_user_ud', referencedColumnName: 'id' }])
  addByUserUd!: Users;

  @ManyToOne(() => Images, images => images.imageTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;

  @ManyToOne(() => Tags, tags => tags.imageTags, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'tag_id', referencedColumnName: 'id' }])
  tag!: Tags;
}

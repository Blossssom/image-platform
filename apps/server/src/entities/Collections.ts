import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CollectionItems } from './CollectionItems';
import { Images } from './Images';
import { Users } from './Users';
import { Notifications } from './Notifications';

@Index('collections_pkey', ['id'], { unique: true })
@Index('idx_collections_featured', ['isFeatured', 'updatedAt'], {})
@Index('idx_collections_user_public', ['isPublic', 'updatedAt', 'userId'], {})
@Entity('collections', { schema: 'public' })
export class Collections {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId!: string | null;

  @Column('character varying', { name: 'name', length: 100 })
  name!: string;

  @Column('text', { name: 'description', nullable: true })
  description!: string | null;

  @Column('boolean', {
    name: 'is_public',
    nullable: true,
    default: () => 'true',
  })
  isPublic!: boolean | null;

  @Column('boolean', {
    name: 'is_featured',
    nullable: true,
    default: () => 'false',
  })
  isFeatured!: boolean | null;

  @Column('integer', { name: 'item_count', nullable: true, default: () => '0' })
  itemCount!: number | null;

  @Column('integer', { name: 'view_count', nullable: true, default: () => '0' })
  viewCount!: number | null;

  @Column('integer', { name: 'like_count', nullable: true, default: () => '0' })
  likeCount!: number | null;

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

  @OneToMany(
    () => CollectionItems,
    collectionItems => collectionItems.collection
  )
  collectionItems!: CollectionItems[];

  @ManyToOne(() => Images, images => images.collections)
  @JoinColumn([{ name: 'cover_image_id', referencedColumnName: 'id' }])
  coverImage!: Images;

  @ManyToOne(() => Users, users => users.collections, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;

  @OneToMany(
    () => Notifications,
    notifications => notifications.targetCollection
  )
  notifications!: Notifications[];
}

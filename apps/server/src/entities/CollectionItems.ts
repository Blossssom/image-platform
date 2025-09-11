import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Collections } from './Collections';
import { Images } from './Images';

@Index('collection_items_pkey', ['collectionId', 'imageId'], { unique: true })
@Entity('collection_items', { schema: 'public' })
export class CollectionItems {
  @Column('uuid', { primary: true, name: 'collection_id' })
  collectionId!: string;

  @Column('uuid', { primary: true, name: 'image_id' })
  imageId!: string;

  @Column('integer', { name: 'sort_order', nullable: true, default: () => '0' })
  sortOrder!: number | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @ManyToOne(() => Users, users => users.collectionItems)
  @JoinColumn([{ name: 'added_by_user_id', referencedColumnName: 'id' }])
  addedByUser!: Users;

  @ManyToOne(() => Collections, collections => collections.collectionItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'collection_id', referencedColumnName: 'id' }])
  collection!: Collections;

  @ManyToOne(() => Images, images => images.collectionItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;
}

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Images } from './Images';
import { Users } from './Users';

@Index('PK_image_likes', ['imageId', 'userId'], { unique: true })
@Entity('image_likes', { schema: 'public' })
export class ImageLikes {
  @Column('uuid', { primary: true, name: 'user_id' })
  userId!: string;

  @Column('uuid', { primary: true, name: 'image_id' })
  imageId!: string;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt!: Date;

  @ManyToOne(() => Images, images => images.imageLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;

  @ManyToOne(() => Users, users => users.imageLikes, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;
}

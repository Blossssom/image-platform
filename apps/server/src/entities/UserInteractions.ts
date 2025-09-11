import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Images } from './Images';
import { Users } from './Users';

@Index(
  'idx_interactions_user_type_created',
  ['createdAt', 'interactionType', 'userId'],
  {}
)
@Index('user_interactions_pkey', ['id'], { unique: true })
@Index('idx_interactions_image_type', ['imageId', 'interactionType'], {})
@Index(
  'user_interactions_user_id_image_id_interaction_type_key',
  ['imageId', 'interactionType', 'userId'],
  { unique: true }
)
@Index('idx_interactions_daily_stats', ['interactionType'], {})
@Entity('user_interactions', { schema: 'public' })
export class UserInteractions {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('uuid', { name: 'user_id', nullable: true, unique: true })
  userId!: string | null;

  @Column('uuid', { name: 'image_id', nullable: true, unique: true })
  imageId!: string | null;

  @Column('integer', { name: 'interaction_type', unique: true })
  interactionType!: number;

  @Column('inet', { name: 'ip_hash', nullable: true })
  ipHash!: string | null;

  @Column('text', { name: 'user_agent', nullable: true })
  userAgent!: string | null;

  @Column('character varying', {
    name: 'referrer',
    nullable: true,
    length: 500,
  })
  referrer!: string | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @ManyToOne(() => Images, images => images.userInteractions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;

  @ManyToOne(() => Users, users => users.userInteractions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;
}

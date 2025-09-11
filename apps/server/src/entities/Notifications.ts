import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Collections } from './Collections';
import { Comments } from './Comments';
import { Images } from './Images';
import { Workflows } from './Workflows';

@Index('idx_notifications_user_unread', ['createdAt', 'userId'], {})
@Index(
  'idx_notifications_user_type',
  ['createdAt', 'notificationType', 'userId'],
  {}
)
@Index('notifications_pkey', ['id'], { unique: true })
@Entity('notifications', { schema: 'public' })
export class Notifications {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId!: string | null;

  @Column('integer', { name: 'notification_type' })
  notificationType!: number;

  @Column('character varying', { name: 'title', length: 200 })
  title!: string;

  @Column('text', { name: 'content', nullable: true })
  content!: string | null;

  @Column('character varying', {
    name: 'action_url',
    nullable: true,
    length: 500,
  })
  actionUrl!: string | null;

  @Column('boolean', {
    name: 'is_read',
    nullable: true,
    default: () => 'false',
  })
  isRead!: boolean | null;

  @Column('boolean', {
    name: 'is_email_sent',
    nullable: true,
    default: () => 'false',
  })
  isEmailSent!: boolean | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @ManyToOne(() => Users, users => users.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'actor_user_id', referencedColumnName: 'id' }])
  actorUser!: Users;

  @ManyToOne(() => Collections, collections => collections.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'target_collection_id', referencedColumnName: 'id' }])
  targetCollection!: Collections;

  @ManyToOne(() => Comments, comments => comments.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'target_comment_id', referencedColumnName: 'id' }])
  targetComment!: Comments;

  @ManyToOne(() => Images, images => images.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'target_image_id', referencedColumnName: 'id' }])
  targetImage!: Images;

  @ManyToOne(() => Workflows, workflows => workflows.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'target_workflow_id', referencedColumnName: 'id' }])
  targetWorkflow!: Workflows;

  @ManyToOne(() => Users, users => users.notifications2, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;
}

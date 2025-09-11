import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CommentLikes } from './CommentLikes';
import { Images } from './Images';
import { Users } from './Users';
import { Notifications } from './Notifications';
import { Reports } from './Reports';

@Index('idx_comments_user_created', ['createdAt', 'userId'], {})
@Index('idx_comments_parent_created', ['createdAt', 'parentCommentId'], {})
@Index('idx_comments_image_created', ['createdAt', 'imageId'], {})
@Index('comments_pkey', ['id'], { unique: true })
@Entity('comments', { schema: 'public' })
export class Comments {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('uuid', { name: 'image_id', nullable: true })
  imageId!: string | null;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId!: string | null;

  @Column('uuid', { name: 'parent_comment_id', nullable: true })
  parentCommentId!: string | null;

  @Column('text', { name: 'content' })
  content!: string;

  @Column('integer', {
    name: 'content_type',
    nullable: true,
    default: () => '0',
  })
  contentType!: number | null;

  @Column('boolean', {
    name: 'is_edited',
    nullable: true,
    default: () => 'false',
  })
  isEdited!: boolean | null;

  @Column('boolean', {
    name: 'is_pinned',
    nullable: true,
    default: () => 'false',
  })
  isPinned!: boolean | null;

  @Column('boolean', {
    name: 'is_verified',
    nullable: true,
    default: () => 'false',
  })
  isVerified!: boolean | null;

  @Column('integer', { name: 'like_count', nullable: true, default: () => '0' })
  likeCount!: number | null;

  @Column('integer', {
    name: 'reply_count',
    nullable: true,
    default: () => '0',
  })
  replyCount!: number | null;

  @Column('timestamp without time zone', { name: 'edited_at', nullable: true })
  editedAt!: Date | null;

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

  @Column('timestamp without time zone', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => CommentLikes, commentLikes => commentLikes.comment)
  commentLikes!: CommentLikes[];

  @ManyToOne(() => Images, images => images.comments, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;

  @ManyToOne(() => Comments, comments => comments.comments)
  @JoinColumn([{ name: 'parent_comment_id', referencedColumnName: 'id' }])
  parentComment!: Comments;

  @OneToMany(() => Comments, comments => comments.parentComment)
  comments!: Comments[];

  @ManyToOne(() => Users, users => users.comments, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;

  @OneToMany(() => Notifications, notifications => notifications.targetComment)
  notifications!: Notifications[];

  @OneToMany(() => Reports, reports => reports.reportedComment)
  reports!: Reports[];
}

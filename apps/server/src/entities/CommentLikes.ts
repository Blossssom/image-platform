import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Comments } from './Comments';
import { Users } from './Users';

@Index('comment_likes_pkey', ['commentId', 'userId'], { unique: true })
@Entity('comment_likes', { schema: 'public' })
export class CommentLikes {
  @Column('uuid', { primary: true, name: 'user_id' })
  userId!: string;

  @Column('uuid', { primary: true, name: 'comment_id' })
  commentId!: string;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @ManyToOne(() => Comments, comments => comments.commentLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'comment_id', referencedColumnName: 'id' }])
  comment!: Comments;

  @ManyToOne(() => Users, users => users.commentLikes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;
}

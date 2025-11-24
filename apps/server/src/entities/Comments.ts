import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Images } from './Images';
import { Users } from './Users';

@Index('PK_comments', ['id'], { unique: true })
@Entity('comments', { schema: 'public' })
export class Comments {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('text', { name: 'content' })
  content!: string;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt!: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'now()',
  })
  updatedAt!: Date;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => Images, images => images.comments, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;

  @ManyToOne(() => Comments, comments => comments.comments)
  @JoinColumn([{ name: 'parent_id', referencedColumnName: 'id' }])
  parent!: Comments;

  @OneToMany(() => Comments, comments => comments.parent)
  comments!: Comments[];

  @ManyToOne(() => Users, users => users.comments)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;
}

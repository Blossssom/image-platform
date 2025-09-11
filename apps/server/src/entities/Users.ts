import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { CollectionItems } from './CollectionItems';
import { Collections } from './Collections';
import { CommentLikes } from './CommentLikes';
import { Comments } from './Comments';
import { ImageTags } from './ImageTags';
import { Images } from './Images';
import { Notifications } from './Notifications';
import { Reports } from './Reports';
import { SystemSettings } from './SystemSettings';
import { Tags } from './Tags';
import { UserFollows } from './UserFollows';
import { UserInteractions } from './UserInteractions';
import { UserPreferences } from './UserPreferences';
import { WorkflowRatings } from './WorkflowRatings';

@Index('users_email_key', ['email'], { unique: true })
@Index('users_pkey', ['id'], { unique: true })
@Index('idx_users_active_verified', ['isActive', 'isVerified'], {})
@Index('users_username_key', ['username'], { unique: true })
@Entity('users', { schema: 'public' })
export class Users {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('character varying', { name: 'email', unique: true, length: 255 })
  email!: string;

  @Column('character varying', { name: 'username', unique: true, length: 50 })
  username!: string;

  @Column('character varying', {
    name: 'display_name',
    nullable: true,
    length: 100,
  })
  displayName!: string | null;

  @Column('character varying', { name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column('character varying', {
    name: 'avatar_url',
    nullable: true,
    length: 500,
  })
  avatarUrl!: string | null;

  @Column('text', { name: 'bio', nullable: true })
  bio!: string | null;

  @Column('boolean', {
    name: 'is_verified',
    nullable: true,
    default: () => 'false',
  })
  isVerified!: boolean | null;

  @Column('boolean', {
    name: 'is_active',
    nullable: true,
    default: () => 'true',
  })
  isActive!: boolean | null;

  @Column('boolean', {
    name: 'is_admin',
    nullable: true,
    default: () => 'false',
  })
  isAdmin!: boolean | null;

  @Column('integer', {
    name: 'total_uploads',
    nullable: true,
    default: () => '0',
  })
  totalUploads!: number | null;

  @Column('integer', {
    name: 'total_likes_received',
    nullable: true,
    default: () => '0',
  })
  totalLikesReceived!: number | null;

  @Column('integer', {
    name: 'follower_count',
    nullable: true,
    default: () => '0',
  })
  followerCount!: number | null;

  @Column('integer', {
    name: 'following_count',
    nullable: true,
    default: () => '0',
  })
  followingCount!: number | null;

  @Column('timestamp without time zone', {
    name: 'email_verified_at',
    nullable: true,
  })
  emailVerifiedAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'last_login_at',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'update_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt!: Date | null;

  @OneToMany(
    () => CollectionItems,
    collectionItems => collectionItems.addedByUser
  )
  collectionItems!: CollectionItems[];

  @OneToMany(() => Collections, collections => collections.user)
  collections!: Collections[];

  @OneToMany(() => CommentLikes, commentLikes => commentLikes.user)
  commentLikes!: CommentLikes[];

  @OneToMany(() => Comments, comments => comments.user)
  comments!: Comments[];

  @OneToMany(() => ImageTags, imageTags => imageTags.addByUserUd)
  imageTags!: ImageTags[];

  @OneToMany(() => Images, images => images.user)
  images!: Images[];

  @OneToMany(() => Notifications, notifications => notifications.actorUser)
  notifications!: Notifications[];

  @OneToMany(() => Notifications, notifications => notifications.user)
  notifications2!: Notifications[];

  @OneToMany(() => Reports, reports => reports.reportedUser)
  reports!: Reports[];

  @OneToMany(() => Reports, reports => reports.reporterUser)
  reports2!: Reports[];

  @OneToMany(() => Reports, reports => reports.reviewedByAdmin)
  reports3!: Reports[];

  @OneToMany(
    () => SystemSettings,
    systemSettings => systemSettings.updatedByAdmin
  )
  systemSettings!: SystemSettings[];

  @OneToMany(() => Tags, tags => tags.createdByUser)
  tags!: Tags[];

  @OneToMany(() => UserFollows, userFollows => userFollows.follower)
  userFollows!: UserFollows[];

  @OneToMany(() => UserFollows, userFollows => userFollows.following)
  userFollows2!: UserFollows[];

  @OneToMany(() => UserInteractions, userInteractions => userInteractions.user)
  userInteractions!: UserInteractions[];

  @OneToOne(() => UserPreferences, userPreferences => userPreferences.user)
  userPreferences!: UserPreferences;

  @OneToMany(() => WorkflowRatings, workflowRatings => workflowRatings.user)
  workflowRatings!: WorkflowRatings[];
}

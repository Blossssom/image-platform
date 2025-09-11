import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { Users } from './Users';

@Index('user_preferences_pkey', ['userId'], { unique: true })
@Entity('user_preferences', { schema: 'public' })
export class UserPreferences {
  @Column('uuid', { primary: true, name: 'user_id' })
  userId!: string;

  @Column('integer', { name: 'theme', nullable: true, default: () => '0' })
  theme!: number | null;

  @Column('integer', {
    name: 'grid_columns',
    nullable: true,
    default: () => '5',
  })
  gridColumns!: number | null;

  @Column('integer', {
    name: 'image_quality',
    nullable: true,
    default: () => '0',
  })
  imageQuality!: number | null;

  @Column('boolean', {
    name: 'nsfw_filter',
    nullable: true,
    default: () => 'true',
  })
  nsfwFilter!: boolean | null;

  @Column('boolean', {
    name: 'show_ai_generated_only',
    nullable: true,
    default: () => 'false',
  })
  showAiGeneratedOnly!: boolean | null;

  @Column('boolean', {
    name: 'show_metadata_images_only',
    nullable: true,
    default: () => 'false',
  })
  showMetadataImagesOnly!: boolean | null;

  @Column('boolean', {
    name: 'auto_play_gifs',
    nullable: true,
    default: () => 'true',
  })
  autoPlayGifs!: boolean | null;

  @Column('boolean', {
    name: 'infinite_scroll',
    nullable: true,
    default: () => 'true',
  })
  infiniteScroll!: boolean | null;

  @Column('boolean', {
    name: 'notification_likes',
    nullable: true,
    default: () => 'true',
  })
  notificationLikes!: boolean | null;

  @Column('boolean', {
    name: 'notification_comments',
    nullable: true,
    default: () => 'true',
  })
  notificationComments!: boolean | null;

  @Column('boolean', {
    name: 'notification_follows',
    nullable: true,
    default: () => 'true',
  })
  notificationFollows!: boolean | null;

  @Column('boolean', {
    name: 'email_notifications',
    nullable: true,
    default: () => 'false',
  })
  emailNotifications!: boolean | null;

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

  @OneToOne(() => Users, users => users.userPreferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;
}

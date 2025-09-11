import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CollectionItems } from './CollectionItems';
import { Collections } from './Collections';
import { Comments } from './Comments';
import { ImageProcessingJobs } from './ImageProcessingJobs';
import { ImageTags } from './ImageTags';
import { Users } from './Users';
import { Notifications } from './Notifications';
import { Reports } from './Reports';
import { UserInteractions } from './UserInteractions';
import { Workflows } from './Workflows';

@Index('idx_images_ai_model', ['aiModel'], {})
@Index('idx_images_aspect_ratio', ['aspectRatio'], {})
@Index('idx_images_color_palette', ['colorPalette'], {})
@Index('idx_images_generation_params', ['generationParams'], {})
@Index('idx_images_has_workflow', ['hasWorkflow', 'uploadedAt'], {})
@Index('idx_images_dimensions', ['height', 'width'], {})
@Index('images_pkey', ['id'], { unique: true })
@Index('idx_images_ai_generated', ['isAiGenerated', 'uploadedAt'], {})
@Index('idx_images_popular', ['popularityScore', 'uploadedAt'], {})
@Index('idx_images_trending', ['trendingScore', 'uploadedAt'], {})
@Index('idx_images_public_uploaded_desc', ['uploadedAt'], {})
@Index('idx_images_user_uploaded_desc', ['uploadedAt', 'userId'], {})
@Entity('images', { schema: 'public' })
export class Images {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId!: string | null;

  @Column('character varying', { name: 'filename', length: 255 })
  filename!: string;

  @Column('character varying', {
    name: 'original_filename',
    nullable: true,
    length: 255,
  })
  originalFilename!: string | null;

  @Column('character varying', { name: 'image_path', length: 500 })
  imagePath!: string;

  @Column('character varying', {
    name: 'file_hash',
    nullable: true,
    length: 64,
  })
  fileHash!: string | null;

  @Column('integer', { name: 'file_size' })
  fileSize!: number;

  @Column('character varying', { name: 'mime_type', length: 100 })
  mimeType!: string;

  @Column('integer', { name: 'width' })
  width!: number;

  @Column('integer', { name: 'height' })
  height!: number;

  @Column('numeric', { name: 'aspect_ratio', precision: 10, scale: 6 })
  aspectRatio!: string;

  @Column('character', { name: 'dominant_color', nullable: true, length: 7 })
  dominantColor!: string | null;

  @Column('numeric', {
    name: 'average_brightness',
    nullable: true,
    precision: 5,
    scale: 2,
  })
  averageBrightness!: string | null;

  @Column('jsonb', { name: 'color_palette', nullable: true })
  colorPalette!: object | null;

  @Column('character varying', { name: 'title', nullable: true, length: 200 })
  title!: string | null;

  @Column('text', { name: 'description', nullable: true })
  description!: string | null;

  @Column('jsonb', { name: 'exif_data', nullable: true })
  exifData!: object | null;

  @Column('jsonb', { name: 'generation_params', nullable: true })
  generationParams!: object | null;

  @Column('character varying', {
    name: 'ai_model',
    nullable: true,
    length: 200,
  })
  aiModel!: string | null;

  @Column('character varying', {
    name: 'ai_sampler',
    nullable: true,
    length: 100,
  })
  aiSampler!: string | null;

  @Column('integer', { name: 'ai_steps', nullable: true })
  aiSteps!: number | null;

  @Column('numeric', {
    name: 'ai_cfg_scale',
    nullable: true,
    precision: 4,
    scale: 1,
  })
  aiCfgScale!: string | null;

  @Column('bigint', { name: 'ai_seed', nullable: true })
  aiSeed!: string | null;

  @Column('text', { name: 'prompt', nullable: true })
  prompt!: string | null;

  @Column('text', { name: 'negative_prompt', nullable: true })
  negativePrompt!: string | null;

  @Column('boolean', {
    name: 'has_workflow',
    nullable: true,
    default: () => 'false',
  })
  hasWorkflow!: boolean | null;

  @Column('integer', {
    name: 'workflow_complexity',
    nullable: true,
    default: () => '0',
  })
  workflowComplexity!: number | null;

  @Column('boolean', {
    name: 'is_nsfw',
    nullable: true,
    default: () => 'false',
  })
  isNsfw!: boolean | null;

  @Column('boolean', {
    name: 'is_public',
    nullable: true,
    default: () => 'true',
  })
  isPublic!: boolean | null;

  @Column('boolean', {
    name: 'is_ai_generated',
    nullable: true,
    default: () => 'true',
  })
  isAiGenerated!: boolean | null;

  @Column('jsonb', { name: 'content_warning', nullable: true })
  contentWarning!: object | null;

  @Column('integer', {
    name: 'license_type',
    nullable: true,
    default: () => '0',
  })
  licenseType!: number | null;

  @Column('boolean', {
    name: 'commercial_use',
    nullable: true,
    default: () => 'false',
  })
  commercialUse!: boolean | null;

  @Column('integer', { name: 'view_count', nullable: true, default: () => '0' })
  viewCount!: number | null;

  @Column('integer', {
    name: 'unique_view_count',
    nullable: true,
    default: () => '0',
  })
  uniqueViewCount!: number | null;

  @Column('integer', { name: 'like_count', nullable: true, default: () => '0' })
  likeCount!: number | null;

  @Column('integer', {
    name: 'bookmark_count',
    nullable: true,
    default: () => '0',
  })
  bookmarkCount!: number | null;

  @Column('integer', {
    name: 'download_count',
    nullable: true,
    default: () => '0',
  })
  downloadCount!: number | null;

  @Column('integer', {
    name: 'comment_count',
    nullable: true,
    default: () => '0',
  })
  commentCount!: number | null;

  @Column('integer', {
    name: 'share_count',
    nullable: true,
    default: () => '0',
  })
  shareCount!: number | null;

  @Column('integer', {
    name: 'workflow_download_count',
    nullable: true,
    default: () => '0',
  })
  workflowDownloadCount!: number | null;

  @Column('integer', {
    name: 'popularity_score',
    nullable: true,
    default: () => '0',
  })
  popularityScore!: number | null;

  @Column('integer', {
    name: 'trending_score',
    nullable: true,
    default: () => '0',
  })
  trendingScore!: number | null;

  @Column('timestamp without time zone', {
    name: 'last_interaction_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastInteractionAt!: Date | null;

  @Column('timestamp without time zone', { name: 'taken_at', nullable: true })
  takenAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'uploaded_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  uploadedAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date | null;

  @Column('timestamp without time zone', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column('character varying', {
    name: 'deleted_reason',
    nullable: true,
    length: 100,
  })
  deletedReason!: string | null;

  @OneToMany(() => CollectionItems, collectionItems => collectionItems.image)
  collectionItems!: CollectionItems[];

  @OneToMany(() => Collections, collections => collections.coverImage)
  collections!: Collections[];

  @OneToMany(() => Comments, comments => comments.image)
  comments!: Comments[];

  @OneToMany(
    () => ImageProcessingJobs,
    imageProcessingJobs => imageProcessingJobs.image
  )
  imageProcessingJobs!: ImageProcessingJobs[];

  @OneToMany(() => ImageTags, imageTags => imageTags.image)
  imageTags!: ImageTags[];

  @ManyToOne(() => Users, users => users.images, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;

  @OneToMany(() => Notifications, notifications => notifications.targetImage)
  notifications!: Notifications[];

  @OneToMany(() => Reports, reports => reports.reportedImage)
  reports!: Reports[];

  @OneToMany(() => UserInteractions, userInteractions => userInteractions.image)
  userInteractions!: UserInteractions[];

  @OneToMany(() => Workflows, workflows => workflows.image)
  workflows!: Workflows[];
}

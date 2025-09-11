import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Images } from './Images';

@Index('image_processing_jobs_pkey', ['id'], { unique: true })
@Entity('image_processing_jobs', { schema: 'public' })
export class ImageProcessingJobs {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('integer', { name: 'job_type' })
  jobType!: number;

  @Column('integer', { name: 'status', nullable: true, default: () => '0' })
  status!: number | null;

  @Column('integer', { name: 'priority', nullable: true, default: () => '0' })
  priority!: number | null;

  @Column('integer', { name: 'progress', nullable: true, default: () => '0' })
  progress!: number | null;

  @Column('character varying', {
    name: 'current_step',
    nullable: true,
    length: 100,
  })
  currentStep!: string | null;

  @Column('jsonb', { name: 'result_data', nullable: true })
  resultData!: object | null;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage!: string | null;

  @Column('integer', {
    name: 'retry_count',
    nullable: true,
    default: () => '0',
  })
  retryCount!: number | null;

  @Column('integer', {
    name: 'max_retries',
    nullable: true,
    default: () => '3',
  })
  maxRetries!: number | null;

  @Column('timestamp without time zone', {
    name: 'scheduled_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  scheduledAt!: Date | null;

  @Column('timestamp without time zone', { name: 'started_at', nullable: true })
  startedAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'completed_at',
    nullable: true,
  })
  completedAt!: Date | null;

  @Column('timestamp without time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date | null;

  @ManyToOne(() => Images, images => images.imageProcessingJobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;
}

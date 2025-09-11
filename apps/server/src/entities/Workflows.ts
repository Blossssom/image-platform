import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Notifications } from './Notifications';
import { Reports } from './Reports';
import { WorkflowRatings } from './WorkflowRatings';
import { Images } from './Images';

@Index('idx_workflow_category', ['category', 'createdAt'], {})
@Index(
  'idx_workflow_type_public',
  ['createdAt', 'isPublic', 'workflowType'],
  {}
)
@Index('workflows_pkey', ['id'], { unique: true })
@Index('idx_workflows_node_types', ['nodeTypes'], {})
@Index('idx_workflows_required_models', ['requiredModels'], {})
@Index('workflows_workflow_hash_key', ['workflowHash'], { unique: true })
@Index('idx_workflow_hash', ['workflowHash'], {})
@Entity('workflows', { schema: 'public' })
export class Workflows {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('jsonb', { name: 'workflow_data' })
  workflowData!: object;

  @Column('character varying', {
    name: 'workflow_hash',
    unique: true,
    length: 64,
  })
  workflowHash!: string;

  @Column('integer', {
    name: 'workflow_type',
    nullable: true,
    default: () => '0',
  })
  workflowType!: number | null;

  @Column('character varying', {
    name: 'workflow_version',
    nullable: true,
    length: 20,
  })
  workflowVersion!: string | null;

  @Column('character varying', { name: 'title', nullable: true, length: 200 })
  title!: string | null;

  @Column('text', { name: 'description', nullable: true })
  description!: string | null;

  @Column('character varying', { name: 'category', nullable: true, length: 50 })
  category!: string | null;

  @Column('integer', { name: 'node_count', nullable: true, default: () => '0' })
  nodeCount!: number | null;

  @Column('jsonb', { name: 'node_types', nullable: true })
  nodeTypes!: object | null;

  @Column('jsonb', { name: 'required_models', nullable: true })
  requiredModels!: object | null;

  @Column('jsonb', { name: 'required_loras', nullable: true })
  requiredLoras!: object | null;

  @Column('integer', {
    name: 'difficulty_level',
    nullable: true,
    default: () => '0',
  })
  difficultyLevel!: number | null;

  @Column('integer', {
    name: 'license_type',
    nullable: true,
    default: () => '0',
  })
  licenseType!: number | null;

  @Column('boolean', {
    name: 'commercial_use',
    nullable: true,
    default: () => 'true',
  })
  commercialUse!: boolean | null;

  @Column('integer', {
    name: 'download_count',
    nullable: true,
    default: () => '0',
  })
  downloadCount!: number | null;

  @Column('integer', {
    name: 'favorite_count',
    nullable: true,
    default: () => '0',
  })
  favoriteCount!: number | null;

  @Column('numeric', {
    name: 'rating_avg',
    nullable: true,
    precision: 3,
    scale: 2,
    default: () => '0',
  })
  ratingAvg!: string | null;

  @Column('integer', {
    name: 'rating_count',
    nullable: true,
    default: () => '0',
  })
  ratingCount!: number | null;

  @Column('boolean', {
    name: 'is_public',
    nullable: true,
    default: () => 'true',
  })
  isPublic!: boolean | null;

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

  @OneToMany(() => Notifications, notifications => notifications.targetWorkflow)
  notifications!: Notifications[];

  @OneToMany(() => Reports, reports => reports.reportedWorkflow)
  reports!: Reports[];

  @OneToMany(() => WorkflowRatings, workflowRatings => workflowRatings.workflow)
  workflowRatings!: WorkflowRatings[];

  @ManyToOne(() => Images, images => images.workflows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;
}

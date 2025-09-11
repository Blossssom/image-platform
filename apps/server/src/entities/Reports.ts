import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Comments } from './Comments';
import { Images } from './Images';
import { Users } from './Users';
import { Workflows } from './Workflows';

@Index('reports_pkey', ['id'], { unique: true })
@Entity('reports', { schema: 'public' })
export class Reports {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('integer', { name: 'report_type' })
  reportType!: number;

  @Column('character varying', { name: 'category', nullable: true, length: 50 })
  category!: string | null;

  @Column('text', { name: 'reason' })
  reason!: string;

  @Column('integer', { name: 'status', nullable: true, default: () => '0' })
  status!: number | null;

  @Column('integer', { name: 'priority', nullable: true, default: () => '1' })
  priority!: number | null;

  @Column('timestamp without time zone', {
    name: 'reviewed_at',
    nullable: true,
  })
  reviewedAt!: Date | null;

  @Column('text', { name: 'admin_notes', nullable: true })
  adminNotes!: string | null;

  @Column('character varying', {
    name: 'resolution_action',
    nullable: true,
    length: 50,
  })
  resolutionAction!: string | null;

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

  @ManyToOne(() => Comments, comments => comments.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'reported_comment_id', referencedColumnName: 'id' }])
  reportedComment!: Comments;

  @ManyToOne(() => Images, images => images.reports, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'reported_image_id', referencedColumnName: 'id' }])
  reportedImage!: Images;

  @ManyToOne(() => Users, users => users.reports, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'reported_user_id', referencedColumnName: 'id' }])
  reportedUser!: Users;

  @ManyToOne(() => Workflows, workflows => workflows.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'reported_workflow_id', referencedColumnName: 'id' }])
  reportedWorkflow!: Workflows;

  @ManyToOne(() => Users, users => users.reports2, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'reporter_user_id', referencedColumnName: 'id' }])
  reporterUser!: Users;

  @ManyToOne(() => Users, users => users.reports3)
  @JoinColumn([{ name: 'reviewed_by_admin_id', referencedColumnName: 'id' }])
  reviewedByAdmin!: Users;
}

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Workflows } from './Workflows';

@Index('workflow_ratings_pkey', ['id'], { unique: true })
@Index('workflow_ratings_workflow_id_user_id_key', ['userId', 'workflowId'], {
  unique: true,
})
@Entity('workflow_ratings', { schema: 'public' })
export class WorkflowRatings {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'uuid_generate_v4()',
  })
  id!: string;

  @Column('uuid', { name: 'workflow_id', nullable: true, unique: true })
  workflowId!: string | null;

  @Column('uuid', { name: 'user_id', nullable: true, unique: true })
  userId!: string | null;

  @Column('integer', { name: 'rating' })
  rating!: number;

  @Column('text', { name: 'review', nullable: true })
  review!: string | null;

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

  @ManyToOne(() => Users, users => users.workflowRatings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user!: Users;

  @ManyToOne(() => Workflows, workflows => workflows.workflowRatings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'workflow_id', referencedColumnName: 'id' }])
  workflow!: Workflows;
}

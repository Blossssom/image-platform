import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('reports_pkey', ['id'], { unique: true })
@Entity('reports', { schema: 'public' })
export class Reports {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('uuid', { name: 'image_id', nullable: true })
  imageId: string | null;

  @Column('character varying', { name: 'reason', length: 50 })
  reason: string;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('character varying', {
    name: 'status',
    nullable: true,
    length: 20,
    default: () => "'PENDING'",
  })
  status: string | null;

  @Column('inet', { name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'now()',
  })
  createdAt: Date | null;
}

import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';

@Index('system_settings_pkey', ['key'], { unique: true })
@Entity('system_settings', { schema: 'public' })
export class SystemSettings {
  @Column('character varying', { primary: true, name: 'key', length: 100 })
  key!: string;

  @Column('jsonb', { name: 'value' })
  value!: object;

  @Column('text', { name: 'description', nullable: true })
  description!: string | null;

  @Column('integer', { name: 'category', nullable: true })
  category!: number | null;

  @Column('boolean', {
    name: 'is_public',
    nullable: true,
    default: () => 'false',
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

  @ManyToOne(() => Users, users => users.systemSettings)
  @JoinColumn([{ name: 'updated_by_admin_id', referencedColumnName: 'id' }])
  updatedByAdmin!: Users;
}

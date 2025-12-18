import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Images } from './Images';

@Index('users_email_key', ['email'], { unique: true })
@Entity('users', { schema: 'public' })
export class Users {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('character varying', {
    name: 'email',
    nullable: true,
    unique: true,
    length: 255,
  })
  email: string | null;

  @Column('character varying', { name: 'nickname', nullable: true, length: 50 })
  nickname: string | null;

  @Column('character varying', {
    name: 'role',
    length: 20,
    default: () => "'USER'",
  })
  role: string;

  @Column('character varying', { name: 'provider', nullable: true, length: 20 })
  provider: string | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    nullable: true,
    default: () => 'now()',
  })
  createdAt: Date | null;

  @OneToMany(() => Images, (images) => images.user)
  images: Images[];
}

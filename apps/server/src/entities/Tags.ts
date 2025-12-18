import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImageTags } from './ImageTags';

@Index('tags_pkey', ['id'], { unique: true })
@Index('tags_name_key', ['name'], { unique: true })
@Entity('tags', { schema: 'public' })
export class Tags {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', unique: true, length: 50 })
  name: string;

  @Column('character varying', {
    name: 'type',
    nullable: true,
    length: 20,
    default: () => "'AUTO'",
  })
  type: string | null;

  @OneToMany(() => ImageTags, (imageTags) => imageTags.tag)
  imageTags: ImageTags[];
}

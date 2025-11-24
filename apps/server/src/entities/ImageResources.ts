import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Images } from './Images';
import { Resources } from './Resources';

@Index('PK_image_resources', ['id'], { unique: true })
@Index('UQ_image_res_pair', ['imageId', 'resourceId'], { unique: true })
@Entity('image_resources', { schema: 'public' })
export class ImageResources {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @Column('double precision', { name: 'weight', nullable: true, precision: 53 })
  weight!: number | null;

  @Column('uuid', { name: 'image_id', unique: true })
  imageId!: string;

  @Column('uuid', { name: 'resource_id', unique: true })
  resourceId!: string;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt!: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'now()',
  })
  updatedAt!: Date;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => Images, images => images.imageResources, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
  image!: Images;

  @ManyToOne(() => Resources, resources => resources.imageResources)
  @JoinColumn([{ name: 'resource_id', referencedColumnName: 'id' }])
  resource!: Resources;
}

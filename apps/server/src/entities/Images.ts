import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { ImageMetadata } from "./ImageMetadata";
import { ImageStats } from "./ImageStats";
import { ImageTags } from "./ImageTags";
import { Users } from "./Users";
import { Reports } from "./Reports";

@Index("idx_images_created_at", ["createdAt"], {})
@Index("images_pkey", ["id"], { unique: true })
@Index("idx_images_user_id", ["userId"], {})
@Entity("images", { schema: "public" })
export class Images {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "user_id" })
  userId: string | null;

  @Column("character varying", { name: "url_original", length: 255 })
  urlOriginal: string;

  @Column("character varying", { name: "url_thumbnail", length: 255 })
  urlThumbnail: string;

  @Column("integer", { name: "width" })
  width: number;

  @Column("integer", { name: "height" })
  height: number;

  @Column("boolean", {
    name: "is_nsfw",
    nullable: true,
    default: () => "false",
  })
  isNsfw: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToOne(() => ImageMetadata, (imageMetadata) => imageMetadata.image)
  imageMetadata: ImageMetadata;

  @OneToOne(() => ImageStats, (imageStats) => imageStats.image)
  imageStats: ImageStats;

  @OneToMany(() => ImageTags, (imageTags) => imageTags.image)
  imageTags: ImageTags[];

  @ManyToOne(() => Users, (users) => users.images, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(() => Reports, (reports) => reports.image)
  reports: Reports[];
}

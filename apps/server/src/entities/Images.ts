import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { ImageMetadata } from "./ImageMetadata";
import { Users } from "./Users";

@Index("images_pkey", ["id"], { unique: true })
@Entity("images", { schema: "public" })
export class Images {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

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

  @Column("character varying", {
    name: "status",
    length: 20,
    default: () => "'DRAFT'",
  })
  status: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToOne(() => ImageMetadata, (imageMetadata) => imageMetadata.image)
  imageMetadata: ImageMetadata;

  @ManyToOne(() => Users, (users) => users.images, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}

import { Column, Entity, Index, OneToMany } from "typeorm";
import { ImageResources } from "./ImageResources";

@Index("UQ_resources_hash", ["hash"], { unique: true })
@Index("PK_resources", ["id"], { unique: true })
@Index("IDX_resources_name", ["name"], {})
@Entity("resources", { schema: "public" })
export class Resources {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "hash", unique: true })
  hash: string;

  @Column("character varying", { name: "name" })
  name: string;

  @Column("enum", {
    name: "type",
    enum: ["CHECKPOINT", "LORA", "EMBEDDING", "VAE", "CONTROLNET"],
  })
  type: "CHECKPOINT" | "LORA" | "EMBEDDING" | "VAE" | "CONTROLNET";

  @Column("character varying", { name: "external_url", nullable: true })
  externalUrl: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "now()",
  })
  updatedAt: Date;

  @Column("timestamp with time zone", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ImageResources, (imageResources) => imageResources.resource)
  imageResources: ImageResources[];
}

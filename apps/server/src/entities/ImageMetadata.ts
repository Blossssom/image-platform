import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Images } from "./Images";

@Index("image_metadata_pkey", ["imageId"], { unique: true })
@Index("idx_meta_model_hash", ["modelHash"], {})
@Index("idx_meta_workflow", ["workflow"], {})
@Entity("image_metadata", { schema: "public" })
export class ImageMetadata {
  @Column("uuid", { primary: true, name: "image_id" })
  imageId: string;

  @Column("text", { name: "positive_prompt", nullable: true })
  positivePrompt: string | null;

  @Column("text", { name: "negative_prompt", nullable: true })
  negativePrompt: string | null;

  @Column("character varying", {
    name: "model_hash",
    nullable: true,
    length: 64,
  })
  modelHash: string | null;

  @Column("character varying", { name: "sampler", nullable: true, length: 50 })
  sampler: string | null;

  @Column("integer", { name: "steps", nullable: true })
  steps: number | null;

  @Column("double precision", {
    name: "cfg_scale",
    nullable: true,
    precision: 53,
  })
  cfgScale: number | null;

  @Column("bigint", { name: "seed", nullable: true })
  seed: string | null;

  @Column("jsonb", { name: "workflow", nullable: true })
  workflow: object | null;

  @Column("jsonb", { name: "raw_params", nullable: true })
  rawParams: object | null;

  @OneToOne(() => Images, (images) => images.imageMetadata, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "image_id", referencedColumnName: "id" }])
  image: Images;
}

import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("models_hash_v2_key", ["hashV2"], { unique: true })
@Index("idx_models_hash", ["hashV2"], {})
@Index("models_pkey", ["id"], { unique: true })
@Entity("models", { schema: "public" })
export class Models {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("character varying", { name: "hash_v2", unique: true, length: 64 })
  hashV2: string;

  @Column("character varying", { name: "type", length: 20 })
  type: string;

  @Column("character varying", {
    name: "base_model",
    nullable: true,
    length: 20,
  })
  baseModel: string | null;
}

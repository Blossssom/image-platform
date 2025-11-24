import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";

@Index("PK_social_accounts", ["id"], { unique: true })
@Index("UQ_social_provider", ["provider", "providerId"], { unique: true })
@Index("IDX_social_user_id", ["userId"], {})
@Entity("social_accounts", { schema: "public" })
export class SocialAccounts {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "provider", unique: true })
  provider: string;

  @Column("character varying", { name: "provider_id", unique: true })
  providerId: string;

  @Column("text", { name: "access_token", nullable: true })
  accessToken: string | null;

  @Column("text", { name: "refresh_token", nullable: true })
  refreshToken: string | null;

  @Column("uuid", { name: "user_id" })
  userId: string;

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

  @ManyToOne(() => Users, (users) => users.socialAccounts, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}

import { Column, Entity, Index, OneToMany } from "typeorm";
import { Comments } from "./Comments";
import { ImageLikes } from "./ImageLikes";
import { Posts } from "./Posts";
import { SocialAccounts } from "./SocialAccounts";

@Index("UQ_users_email", ["email"], { unique: true })
@Index("PK_users", ["id"], { unique: true })
@Entity("users", { schema: "public" })
export class Users {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "email", unique: true })
  email: string;

  @Column("character varying", { name: "nickname", nullable: true })
  nickname: string | null;

  @Column("character varying", { name: "avatar_url", nullable: true })
  avatarUrl: string | null;

  @Column("enum", {
    name: "role",
    enum: ["USER", "ADMIN", "MODERATOR"],
    default: () => "'USER'",
  })
  role: "USER" | "ADMIN" | "MODERATOR";

  @Column("enum", {
    name: "nsfw_filter",
    enum: ["SHOW", "BLUR", "HIDE"],
    default: () => "'BLUR'",
  })
  nsfwFilter: "SHOW" | "BLUR" | "HIDE";

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

  @OneToMany(() => Comments, (comments) => comments.user)
  comments: Comments[];

  @OneToMany(() => ImageLikes, (imageLikes) => imageLikes.user)
  imageLikes: ImageLikes[];

  @OneToMany(() => Posts, (posts) => posts.user)
  posts: Posts[];

  @OneToMany(() => SocialAccounts, (socialAccounts) => socialAccounts.user)
  socialAccounts: SocialAccounts[];
}

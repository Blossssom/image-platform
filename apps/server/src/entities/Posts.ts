import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Images } from "./Images";
import { Users } from "./Users";

@Index("PK_posts", ["id"], { unique: true })
@Index("IDX_posts_user_id", ["userId"], {})
@Entity("posts", { schema: "public" })
export class Posts {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "title" })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("integer", { name: "view_count", default: () => "0" })
  viewCount: number;

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

  @OneToMany(() => Images, (images) => images.post)
  images: Images[];

  @ManyToOne(() => Users, (users) => users.posts)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}

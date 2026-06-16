import { AdminShell } from "@/components/admin/admin-shell";
import { BlogCategoriesManager } from "@/components/admin/blog-categories-manager";
import { requireTeamSession } from "@/lib/admin/auth";
import {
  createBlogCategoryAction,
  deleteBlogCategoryAction,
  updateBlogCategoryAction,
} from "@/app/admin/(dashboard)/blog/actions";
import { listBlogCategoriesAdmin } from "@/lib/db/blog";

export default async function AdminBlogCategoriesPage() {
  const { profile } = await requireTeamSession();
  const categories = await listBlogCategoriesAdmin();

  return (
    <AdminShell profile={profile} title="Bloggkategorier">
      <BlogCategoriesManager
        categories={categories}
        createAction={createBlogCategoryAction}
        updateAction={updateBlogCategoryAction}
        deleteAction={deleteBlogCategoryAction}
      />
    </AdminShell>
  );
}

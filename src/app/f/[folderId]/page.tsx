import { eq } from "drizzle-orm";
import { z } from "zod";
import DriveContents from "~/app/drive-contents";
import { db } from "~/server/db";
import { files_table, folders_table } from "~/server/db/schema";

async function getAllParents(folderId: number) {
  const parents = [];
  let currentId: number | null = folderId;

  while (currentId !== null) {
    const folder = await db
      .selectDistinct()
      .from(folders_table)
      .where(eq(folders_table.id, currentId));

    if (!folder[0]) {
      throw new Error("Parent Folder not found!!!");
    }

    parents.unshift(folder[0]);
    currentId = folder[0]?.parent;
  }

  return parents;
}

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;

  const safeParams = z
    .object({
      folderId: z.coerce.number(),
    })
    .safeParse(params);

  if (!safeParams.success) return <div>Invalid folder ID</div>;

  const parsedFolderId = safeParams.data.folderId;

  const foldersPromise = db
    .select()
    .from(folders_table)
    .where(eq(folders_table.parent, parsedFolderId));

  const filesPromise = db
    .select()
    .from(files_table)
    .where(eq(files_table.parent, parsedFolderId));

  const parentsPromise = getAllParents(parsedFolderId);

  const [folders, files, parents] = await Promise.all([
    foldersPromise,
    filesPromise,
    parentsPromise,
  ]);

  return <DriveContents files={files} folders={folders} parents={parents} />;
}

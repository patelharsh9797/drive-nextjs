import { eq } from "drizzle-orm";
import { z } from "zod";
import DriveContents from "~/app/drive-contents";
import { db } from "~/server/db";
import { files_table, folders_table } from "~/server/db/schema";

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

  const folders = await db
    .select()
    .from(folders_table)
    .where(eq(folders_table.parent, parsedFolderId));

  const files = await db
    .select()
    .from(files_table)
    .where(eq(files_table.parent, parsedFolderId));

  return <DriveContents files={files} folders={folders} />;
}

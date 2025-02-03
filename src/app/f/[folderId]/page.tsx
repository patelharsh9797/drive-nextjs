import { z } from "zod";
import DriveContents from "~/app/drive-contents";
import { QUERIES } from "~/server/db/queries";

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

  const [folders, files, parents] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
  ]);

  return <DriveContents files={files} folders={folders} parents={parents} />;
}
